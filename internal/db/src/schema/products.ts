import { pgTable, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { lifecycleDates, primaryId } from "./utils";

export const productsTable = pgTable(
  "products",
  {
    id: primaryId(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    description: varchar("description", { length: 1024 }),

    ...lifecycleDates,
  },
  (t) => ({
    name: uniqueIndex().on(t.name),
  })
);
