import {
  boolean,
  index,
  integer,
  pgTable,
  timestamp,
  unique,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { lifecycleDates, price, primaryId } from "./utils";
import { usersTable } from "./users";
import { productsTable } from "./products";

export const fabricCategoriesTable = pgTable(
  "fabric_categories",
  {
    id: primaryId(),
    name: varchar("name", { length: 255 }).notNull(),
    description: varchar("description", { length: 1024 }),

    productId: varchar("product_id")
      .notNull()
      .references(() => productsTable.id, { onDelete: "no action" }),

    ...lifecycleDates,
  },
  (t) => ({
    name: index("fabric_categories_name_idx").on(t.name),
    productId: index("fabric_categories_product_idx").on(t.productId),
    nameAndProductId: unique().on(t.name, t.productId),
    uniqueNameAndProductId: uniqueIndex().on(t.name, t.productId),
  })
);

export const fabricGroupsTable = pgTable(
  "fabric_groups",
  {
    id: primaryId(),
    name: varchar("name", { length: 255 }).notNull(),
    description: varchar("description", { length: 1024 }),

    productId: varchar("product_id")
      .notNull()
      .references(() => productsTable.id, { onDelete: "no action" }),

    smallImageUrl: varchar("small_image_url", { length: 1024 }),
    largeImageUrl: varchar("large_image_url", { length: 1024 }),

    archivedAt: timestamp("archived_at"),
    archivedBy: varchar("archived_by").references(() => usersTable.id, {
      onDelete: "no action",
    }),
    ...lifecycleDates,
  },
  (t) => ({
    name: index("fabric_groups_name_idx").on(t.name),
    productId: index("fabric_groups_product_idx").on(t.productId),
    archivedBy: index("fabric_groups_archived_by_idx").on(t.archivedBy),
    nameAndProductId: unique().on(t.name, t.productId),
    uniqueNameAndProductId: uniqueIndex().on(t.name, t.productId),
  })
);

export const fabricsTable = pgTable(
  "fabrics",
  {
    id: primaryId(),
    name: varchar("name", { length: 255 }).notNull(),
    twcName: varchar("twc_name", { length: 255 }).notNull(),
    description: varchar("description", { length: 1024 }),

    fabricGroupId: varchar("fabric_group_id")
      .notNull()
      .references(() => fabricGroupsTable.id, { onDelete: "no action" }),

    fabricCategoryId: varchar("fabric_category_id")
      .notNull()
      .references(() => fabricCategoriesTable.id, { onDelete: "no action" }),

    price: price("price").notNull(),

    smallImageUrl: varchar("small_image_url", { length: 1024 }),
    largeImageUrl: varchar("large_image_url", { length: 1024 }),

    minWidth: integer("min_width").default(0),
    minDrop: integer("min_drop").default(0),
    maxWidth: integer("max_width").default(0),
    maxDrop: integer("max_drop").default(0),

    archivedAt: timestamp("archived_at"),
    archivedBy: varchar("archived_by").references(() => usersTable.id, {
      onDelete: "no action",
    }),
    ...lifecycleDates,
  },
  (t) => ({
    name: index("fabrics_name_idx").on(t.name),
    fabricGroupId: index("fabrics_fabric_group_idx").on(t.fabricGroupId),
    fabricCategoryId: index("fabrics_fabric_category_idx").on(
      t.fabricCategoryId
    ),
    archivedBy: index("fabrics_archived_by_idx").on(t.archivedBy),
    nameAndFabricGroupId: unique().on(t.name, t.fabricGroupId),
    uniqueNameAndFabricGroupId: uniqueIndex().on(t.name, t.fabricGroupId),
  })
);

export const colorsTable = pgTable(
  "colors",
  {
    id: primaryId(),
    name: varchar("name", { length: 255 }).notNull(),
    twcName: varchar("twc_name", { length: 255 }).notNull(),
    description: varchar("description", { length: 1024 }),

    fabricId: varchar("fabric_id")
      .notNull()
      .references(() => fabricsTable.id, { onDelete: "no action" }),

    isExpress: boolean("is_express").notNull().default(false),

    smallImageUrl: varchar("small_image_url", { length: 1024 }),
    largeImageUrl: varchar("large_image_url", { length: 1024 }),

    archivedAt: timestamp("archived_at"),
    archivedBy: varchar("archived_by").references(() => usersTable.id, {
      onDelete: "no action",
    }),
    ...lifecycleDates,
  },
  (t) => ({
    name: index("colors_name_idx").on(t.name),
    fabricId: index("fabrics_fabric_idx").on(t.fabricId),
    archivedBy: index("colors_archived_by_idx").on(t.archivedBy),
    nameAndFabricId: unique().on(t.name, t.fabricId),
    uniqueNameAndFabricId: uniqueIndex().on(t.name, t.fabricId),
  })
);
