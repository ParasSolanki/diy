import { boolean, integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { lifecycleDates, price, primaryId } from "./utils";
import { productsTable } from "./products";
import { colorsTable, fabricsTable } from "./fabrics-colors";

export const orderItemsTable = pgTable("order_items", {
  id: primaryId(),

  order: integer("order").notNull(),

  name: varchar("name", { length: 256 }).notNull(),

  productId: varchar("product_id")
    .notNull()
    .references(() => productsTable.id, { onDelete: "no action" }),

  fabricId: varchar("fabric_id").references(() => fabricsTable.id, {
    onDelete: "no action",
  }),

  colorId: varchar("color_id").references(() => colorsTable.id, {
    onDelete: "no action",
  }),

  width: integer("width"),
  drop: integer("drop"),
  quantity: integer("quantity"),

  price: price("price").notNull(),

  isExternal: boolean("is_external").notNull().default(false),

  notes: varchar("notes", { length: 2048 }),

  ...lifecycleDates,
});

export const sampleOrderItemsTable = pgTable("sample_order_items", {
  id: primaryId(),

  order: integer("order").notNull(),

  productId: varchar("product_id")
    .notNull()
    .references(() => productsTable.id, { onDelete: "no action" }),

  fabricId: varchar("fabric_id").references(() => fabricsTable.id, {
    onDelete: "no action",
  }),

  colorId: varchar("color_id").references(() => colorsTable.id, {
    onDelete: "no action",
  }),

  ...lifecycleDates,
});

// export const orderItemVariationsTable = pgTable("order_item_variations", {
//   id: primaryId(),

//   orderItemId: varchar("order_item_id")
//     .notNull()
//     .references(() => orderItemsTable.id),

//   name: varchar("name").notNull(),

//   value: varchar("value"),
// });
