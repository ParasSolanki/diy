import { defineAction, ActionError } from "astro:actions";
import { z } from "astro:schema";
import { validateCsrfToken } from "../server/utils";
import { and, db, eq, schema } from "../server/db";
import { Argon2id } from "oslo/password";
import { generateUsername } from "../utils/generate";

const EMAIL_KEY = "email";
const AVATAR_URLS = [
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Lily",
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Miss%20kitty",
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Muffin",
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Sheba",
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Willow",
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Jasmine",
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Sassy",
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Bandit",
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Precious",
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Milo",
];

function getRandomAvatar() {
  return AVATAR_URLS[Math.floor(Math.random() * AVATAR_URLS.length - 1)];
}

const csrfSchmea = z.string();

const authSchema = z.object({
  _csrf: csrfSchmea,
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email is required",
    })
    .min(1, "Email is required")
    .email("Email is invalid"),
  password: z
    .string({
      required_error: "Password is required",
      invalid_type_error: "Password is required",
    })
    .min(8, "Password must contain at least 8 character(s)")
    .max(100, "Password must contain at most 100 character(s)"),
});

export const server = {
  signup: defineAction({
    accept: "form",
    input: authSchema,
    handler: async ({ email, password, _csrf }) => {
      if (!validateCsrfToken(_csrf)) {
        throw new ActionError({
          code: "FORBIDDEN",
          message: "forbidden",
        });
      }

      {
        const [customer] = await db
          .select({ id: schema.customersTable.id })
          .from(schema.customersTable)
          .where(eq(schema.customersTable.email, email))
          .limit(1);

        if (customer) {
          throw new ActionError({
            code: "CONFLICT",
            message: "User already exists with email",
          });
        }
      }

      try {
        const customer = await db.transaction(async (tx) => {
          const username = generateUsername(email);

          const [customer] = await tx
            .insert(schema.customersTable)
            .values({
              email,
              avatarUrl: getRandomAvatar(),
              displayName: username,
            })
            .returning();
          const hashedPassword = await new Argon2id().hash(password);

          await tx.insert(schema.customerPasswordsTable).values({
            hashedPassword,
            customerId: customer.id,
          });

          await tx.insert(schema.customerAccountsTable).values({
            providerKey: EMAIL_KEY,
            providerId: email,
            customerId: customer.id,
          });

          return customer;
        });

        return { customer };
      } catch (e) {
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unable to sign up. Please try again later.",
        });
      }
    },
  }),
  login: defineAction({
    accept: "form",
    input: authSchema,
    handler: async ({ email, password, _csrf }) => {
      if (!validateCsrfToken(_csrf)) {
        throw new ActionError({
          code: "FORBIDDEN",
          message: "forbidden",
        });
      }

      {
        const [customers, accounts] = await Promise.all([
          db
            .select({ id: schema.customersTable.id })
            .from(schema.customersTable)
            .where(eq(schema.customersTable.email, email))
            .limit(1),
          db
            .select({
              customerId: schema.customerAccountsTable.customerId,
            })
            .from(schema.customerAccountsTable)
            .where(
              and(
                eq(schema.customerAccountsTable.providerKey, EMAIL_KEY),
                eq(schema.customerAccountsTable.providerId, email)
              )
            )
            .limit(1),
        ]);

        const customer = customers[0];
        const account = accounts[0];

        if (!customer || !account) {
          throw new ActionError({
            code: "BAD_REQUEST",
            message: "Incorrect email or password",
          });
        }
      }

      const [customer] = await db
        .select({
          id: schema.customersTable.id,
          email: schema.customersTable.email,
          hashedPassword: schema.customerPasswordsTable.hashedPassword,
        })
        .from(schema.customersTable)
        .leftJoin(
          schema.customerPasswordsTable,
          eq(schema.customersTable.id, schema.customerPasswordsTable.customerId)
        )
        .where(eq(schema.customersTable.email, email))
        .limit(1);

      // no customer found
      if (!customer) {
        throw new ActionError({
          code: "BAD_REQUEST",
          message: "Incorrect email or password",
        });
      }

      // customer does not have password
      if (!customer.hashedPassword) {
        throw new ActionError({
          code: "BAD_REQUEST",
          message: "Incorrect email or password",
        });
      }

      const isPasswordValid = await new Argon2id().verify(
        customer.hashedPassword,
        password
      );

      if (!isPasswordValid) {
        throw new ActionError({
          code: "BAD_REQUEST",
          message: "Incorrect email or password",
        });
      }

      const { hashedPassword, ...customerWithoutPassword } = customer;

      return { customer: customerWithoutPassword };
    },
  }),
  logout: defineAction({
    accept: "form",
    input: z.object({ _csrf: csrfSchmea }),
    handler: async ({ _csrf }) => {
      if (!validateCsrfToken(_csrf)) {
        throw new ActionError({
          code: "FORBIDDEN",
          message: "forbidden",
        });
      }

      return { ok: true };
    },
  }),
};
