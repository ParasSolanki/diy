import {
  index,
  pgTable,
  timestamp,
  unique,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { lifecycleDates, primaryId } from "./utils";

export const customersTable = pgTable(
  "customers",
  {
    id: primaryId(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    displayName: varchar("display_name", { length: 255 }),
    avatarUrl: varchar("avatar_url"),

    address: varchar("address", { length: 1024 }),
    city: varchar("city", { length: 255 }),
    state: varchar("state", { length: 255 }),
    postcode: varchar("postcode", { length: 255 }),

    billingAddress: varchar("billing_address", { length: 1024 }),
    billingCity: varchar("billing_city", { length: 255 }),
    billingState: varchar("billing_state", { length: 255 }),
    billingPostcode: varchar("billing_postcode", { length: 255 }),

    ...lifecycleDates,
  },
  (t) => ({
    email: uniqueIndex().on(t.email),
  })
);

export const customerSessionsTable = pgTable(
  "customer_sessions",
  {
    id: primaryId(),

    customerId: varchar("customer_id")
      .notNull()
      .references(() => customersTable.id, {
        onDelete: "cascade",
      }),
    expiresAt: timestamp("expires_at").notNull(),
  },
  (t) => ({
    customerId: index("customer_sessions_customer_idx").on(t.customerId),
  })
);

export const customerAccountsTable = pgTable(
  "customer_accounts",
  {
    id: primaryId(),

    customerId: varchar("customer_id")
      .notNull()
      .references(() => customersTable.id, {
        onDelete: "cascade",
      }),

    providerKey: varchar("provider_key", { length: 100 }).notNull(),
    providerId: varchar("provider_id", {
      length: 255,
    }).notNull(),

    ...lifecycleDates,
  },
  (t) => ({
    customerId: index("customer_accounts_customer_idx").on(t.customerId),
    providerKey: index("customer_accounts_provider_key_idx").on(t.providerKey),
    providerId: index("customer_accounts_provider_id_idx").on(t.providerId),
    uniqueCustomerIdAndProviderKey: unique().on(t.customerId, t.providerKey),
  })
);

export const customerPasswordsTable = pgTable(
  "customer_passwords",
  {
    id: primaryId(),

    customerId: varchar("customer_id")
      .notNull()
      .unique()
      .references(() => customersTable.id, {
        onDelete: "cascade",
      }),

    hashedPassword: varchar("hashed_password", { length: 2048 }).notNull(),

    ...lifecycleDates,
  },
  (t) => ({
    customerId: index("customer_passwords_customer_idx").on(t.customerId),
  })
);

export const customerPasswordResetTokensTable = pgTable(
  "customer_password_reset_tokens",
  {
    id: primaryId(),

    customerId: varchar("customer_id")
      .notNull()
      .references(() => customersTable.id, {
        onDelete: "cascade",
      }),

    tokenHash: varchar("token_hash", { length: 512 }).notNull().unique(),

    expiresAt: timestamp("expires_at").notNull(),
  },
  (t) => ({
    customerId: index("customer_password_reset_tokens_customer_idx").on(
      t.customerId
    ),
  })
);
