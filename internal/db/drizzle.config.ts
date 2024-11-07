import type { Config } from "drizzle-kit";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("Environment variable `DATABASE_URL` is required");
}

export default {
  verbose: true,
  breakpoints: true,
  out: "./migrations",
  dialect: "postgresql",
  schema: "./src/schema/index.ts",
  dbCredentials: { url: DATABASE_URL },
} satisfies Config;
