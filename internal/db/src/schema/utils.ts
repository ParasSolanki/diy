import { sql } from "drizzle-orm";
import { numeric, timestamp, varchar } from "drizzle-orm/pg-core";
import { ulid } from "ulid";

export const primaryId = (name = "id") =>
  varchar(name)
    .notNull()
    .primaryKey()
    .$defaultFn(() => ulid());

export const price = (name: string) =>
  numeric(name, { precision: 10, scale: 2 });

export const lifecycleDates = {
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .default(sql`NULL`)
    .$onUpdate(() => new Date()),
};
