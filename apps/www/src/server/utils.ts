import crypto from "node:crypto";
import { env } from "../env";

const TOKEN_LENGTH = 32;

function sign(token: string) {
  return crypto
    .createHmac("sha256", env.TOKEN_SECRET)
    .update(token)
    .digest("base64url");
}

export function generateCsrfToken() {
  const token = crypto.randomBytes(TOKEN_LENGTH).toString("base64url");

  const signature = sign(token);

  return [token, signature].join(".");
}

export function validateCsrfToken(token: string) {
  const [value, signature] = token.split(".");

  if (!value || !signature) return false;

  const expectedSignature = sign(value);

  return signature === expectedSignature;
}
