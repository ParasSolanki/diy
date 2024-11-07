import crypto from "node:crypto";
import { sha256 } from "@oslojs/crypto/sha2";
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { serializeCookie } from "oslo/cookie";
import { db, eq, lte, schema } from "./db";
import { env } from "../env";

const SESSION_TOKEN_LENGTH = 26 as const;
const SESSION_COOKIE_NAME = "diy-session" as const;
const SESSION_EXPIRES_IN = 1000 * 60 * 60 * 24 * 3; // 3 days
const SESSION_REFRSH_IN = SESSION_EXPIRES_IN / 2; // half time of expires in

export type Session = {
  id: string;
  customerId: string;
  expiresAt: Date;
};

export type Customer = {
  id: string;
  email: string;
};

type SessionValidationResult =
  | { session: Session & { fresh?: boolean }; customer: Customer }
  | { session: null; customer: null };

/**
 * Generates a random session token.
 * @returns {string} A base32 encoded session token.
 */
function generateSessionToken(): string {
  const bytes = new Uint8Array(SESSION_TOKEN_LENGTH);
  crypto.getRandomValues(bytes);

  return encodeBase32LowerCaseNoPadding(bytes);
}

export type CookieAttributes = {
  secure?: boolean;
  path?: string;
  domain?: string;
  sameSite?: "lax" | "strict" | "none";
  httpOnly?: boolean;
  maxAge?: number;
  expires?: Date;
};

/**
 * Represents an HTTP cookie.
 */
class Cookie {
  public name: string;
  public value: string;
  public attributes: CookieAttributes;

  /**
   * Creates a new Cookie instance.
   * @param {string} name - The name of the cookie.
   * @param {string} value - The value of the cookie.
   * @param {CookieAttributes} attributes - The attributes of the cookie.
   */
  constructor(name: string, value: string, attributes: CookieAttributes) {
    this.name = name;
    this.value = value;
    this.attributes = attributes;
  }

  /**
   * Serializes the cookie into a string.
   * @returns {string} The serialized cookie string.
   */
  public serialize(): string {
    return serializeCookie(this.name, this.value, this.attributes);
  }
}

export const auth = {
  /**
   * Gets the session cookie name.
   * @returns {string} The session cookie name.
   */
  get sessionCookieName(): string {
    return SESSION_COOKIE_NAME;
  },

  /**
   * Creates a new session for a customer.
   * @param {string} customerId - The ID of the customer.
   * @returns {Promise<Session>} A promise that resolves to the created session.
   */
  createSession: async (customerId: string): Promise<Session> => {
    const sessionToken = generateSessionToken();
    const sessionId = encodeHexLowerCase(
      sha256(new TextEncoder().encode(sessionToken))
    );

    const [session] = await db
      .insert(schema.customerSessionsTable)
      .values({
        id: sessionId,
        customerId,
        expiresAt: new Date(Date.now() + SESSION_EXPIRES_IN),
      })
      .returning();

    return session;
  },

  /**
   * Validates a session and returns the associated customer information.
   * @param {string} sessionId - The ID of the session to validate.
   * @returns {Promise<SessionValidationResult>} A promise that resolves to the validation result.
   */
  validateSession: async (
    sessionId: string
  ): Promise<SessionValidationResult> => {
    const result = await db
      .select({
        session: {
          id: schema.customerSessionsTable.id,
          customerId: schema.customerSessionsTable.customerId,
          expiresAt: schema.customerSessionsTable.expiresAt,
        },
        customer: {
          id: schema.customersTable.id,
          email: schema.customersTable.email,
        },
      })
      .from(schema.customerSessionsTable)
      .innerJoin(
        schema.customersTable,
        eq(schema.customersTable.id, schema.customerSessionsTable.customerId)
      )
      .where(eq(schema.customerSessionsTable.id, sessionId));

    if (result.length < 1) {
      return { session: null, customer: null };
    }

    const { customer, session } = result[0];

    if (!session || !customer) return { session: null, customer: null };

    // if session is expired
    if (Date.now() >= session.expiresAt.getTime()) {
      await auth.invalidateSession(session.id);
      return { session: null, customer: null };
    }

    // if session is half expired then update the session expiration time
    // to consider as new and update expiresAt time in db
    if (Date.now() >= session.expiresAt.getTime() - SESSION_REFRSH_IN) {
      const newExpiresAt = new Date(Date.now() + SESSION_EXPIRES_IN);
      await db
        .update(schema.customerSessionsTable)
        .set({
          expiresAt: newExpiresAt,
        })
        .where(eq(schema.customerSessionsTable.id, session.id));

      Object.assign(session, { fresh: true, expiresAt: newExpiresAt });
    }

    return { session, customer };
  },

  /**
   * Invalidates a session by deleting it from the database.
   * @param {string} sessionId - The ID of the session to invalidate.
   * @returns {Promise<void>} A promise that resolves when the session is invalidated.
   */
  invalidateSession: async (sessionId: string): Promise<void> => {
    await db
      .delete(schema.customerSessionsTable)
      .where(eq(schema.customerSessionsTable.id, sessionId));
  },

  /**
   * Invalidates all sessions for a specific customer.
   * @param {string} customerId - The ID of the customer whose sessions should be invalidated.
   * @returns {Promise<void>} A promise that resolves when all sessions are invalidated.
   */
  invalidateUserSessions: async (customerId: string): Promise<void> => {
    await db
      .delete(schema.customerSessionsTable)
      .where(eq(schema.customerSessionsTable.customerId, customerId));
  },

  /**
   * Deletes all expired sessions from the database.
   * @returns {Promise<void>} A promise that resolves when all expired sessions are deleted.
   */
  deleteExpiredSessions: async (): Promise<void> => {
    await db
      .delete(schema.customerSessionsTable)
      .where(lte(schema.customerSessionsTable.expiresAt, new Date()));
  },

  /**
   * Creates a session cookie.
   * @param {string} sessionId - The ID of the session to be stored in the cookie.
   * @returns {Cookie} The created session cookie.
   */
  createSessionCookie: (sessionId: string): Cookie => {
    return new Cookie(SESSION_COOKIE_NAME, sessionId, {
      expires: new Date(),
      maxAge: SESSION_EXPIRES_IN,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: env.PROD,
    });
  },

  /**
   * Creates a blank session cookie, typically used for logging out.
   * @returns {Cookie} The created blank session cookie.
   */
  createBlankSessionCookie: (): Cookie => {
    return new Cookie(SESSION_COOKIE_NAME, "", {
      expires: new Date(),
      maxAge: 0,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: env.PROD,
    });
  },
};
