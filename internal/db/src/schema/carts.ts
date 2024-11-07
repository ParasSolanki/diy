import { index, pgTable, varchar } from "drizzle-orm/pg-core";
import { lifecycleDates, primaryId } from "./utils";
import { customersTable } from "./customers";
import { orderItemsTable, sampleOrderItemsTable } from "./order-items";

export const cartsTable = pgTable("carts", {
  id: primaryId(),

  customerId: varchar("customer_id").references(() => customersTable.id, {
    onDelete: "cascade",
  }),

  ...lifecycleDates,
});

export const cartOrderItemsTable = pgTable(
  "cart_order_items",
  {
    id: primaryId(),

    cartId: varchar("cart_id")
      .notNull()
      .references(() => cartsTable.id, {
        onDelete: "cascade",
      }),

    orderItemId: varchar("order_item_id")
      .notNull()
      .references(() => orderItemsTable.id, {
        onDelete: "cascade",
      }),

    ...lifecycleDates,
  },
  (t) => ({
    cartId: index("cart_order_items_cart_idx").on(t.cartId),
  })
);

export const cartSampleOrderItemsTable = pgTable(
  "cart_sample_order_items",
  {
    id: primaryId(),

    cartId: varchar("cart_id")
      .notNull()
      .references(() => cartsTable.id, {
        onDelete: "cascade",
      }),

    sampleOrderItemId: varchar("sample_order_item_id")
      .notNull()
      .references(() => sampleOrderItemsTable.id, {
        onDelete: "cascade",
      }),

    ...lifecycleDates,
  },
  (t) => ({
    cartId: index("cart_sample_order_items_cart_idx").on(t.cartId),
  })
);
