import { pgDrizzle, pg } from "@diy/db";
import { env } from "../env";

export * from "@diy/db";

export const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  max: 5,
});

export const db = pgDrizzle(pool, { logger: env.PROD });
