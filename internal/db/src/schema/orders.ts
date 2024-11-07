import {
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { lifecycleDates, price, primaryId } from "./utils";
import { customersTable } from "./customers";
import { usersTable } from "./users";
import { orderItemsTable } from "./order-items";

export const orderStages = pgEnum("order_stages", ["quote", "order"]);
export const orderTypes = pgEnum("order_types", [
  "install",
  "delivery",
  "check_measure_and_delivery",
]);
export const orderQuoteTypes = pgEnum("order_quote_types", [
  "off_plan",
  "customer_measurements",
  "check_measure",
]);
export const orderStatuses = pgEnum("order_statuses", [
  "drafted",
  "awaiting_approval",
  "customer_approved",
  "pending",
  "processing",
  "in_progress",
  "in_review",
  "awaiting_check_measure",
  "check_measure_completed",
  "queried",
  "sent_to_factory",
  "completed",
  "archived",
]);

export const ordersTable = pgTable(
  "orders",
  {
    id: primaryId(),
    code: varchar("code").notNull().unique(),
    type: orderTypes("type").notNull(),
    stage: orderStages("stage").notNull(),
    status: orderStatuses("status").notNull(),
    date: timestamp("date").notNull(),

    quoteType: orderQuoteTypes("quote_type"),

    email: varchar("email", { length: 255 }).notNull(),
    address: varchar("address", { length: 1024 }).notNull(),
    city: varchar("city", { length: 255 }).notNull(),
    state: varchar("state", { length: 255 }).notNull(),
    postcode: varchar("postcode", { length: 255 }).notNull(),

    // pricing
    total: price("total").notNull(),
    shipping: price("shipping").notNull(),
    measure: price("measure").notNull(),
    install: price("install").notNull(),
    subtotal: price("subtotal").notNull(),
    discount: price("discount").notNull(),
    insurance: price("insurance").notNull(),

    source: varchar("source").notNull(),

    dueDate: timestamp("due_date"),
    confirmationDate: timestamp("confirmation_date"),
    sendToFactoryDate: timestamp("send_to_factory_date"),
    instructions: varchar("instructions", { length: 2048 }),
    deliveryInstructions: varchar("delivery_instructions", { length: 2048 }),

    customerId: varchar("customer_id").references(() => customersTable.id, {
      onDelete: "no action",
    }),

    consultantId: varchar("consultant_id").references(() => usersTable.id, {
      onDelete: "no action",
    }),

    createdBy: varchar("created_by").references(() => usersTable.id, {
      onDelete: "no action",
    }),
    updatedBy: varchar("updated_by").references(() => usersTable.id, {
      onDelete: "no action",
    }),

    sendToFactoryById: varchar("send_to_factory_by_id").references(
      () => usersTable.id,
      {
        onDelete: "no action",
      }
    ),

    ...lifecycleDates,
  },
  (t) => ({
    code: uniqueIndex().on(t.code),
    type: index("order_type_idx").on(t.type),
    stage: index("order_stage_idx").on(t.stage),
    date: index("order_date_idx").on(t.date),
    status: index("order_status_idx").on(t.status),
    createdBy: index("orders_created_by_idx").on(t.createdBy),
    updatedBy: index("orders_updated_by_idx").on(t.updatedBy),
    customerId: index("order_customer_id_idx").on(t.customerId),
    consultantId: index("order_consultant_id_idx").on(t.consultantId),
  })
);

export const orderItemsPivotTable = pgTable(
  "order_items_pivot",
  {
    id: primaryId(),

    orderId: varchar("order_id")
      .notNull()
      .references(() => ordersTable.id, { onDelete: "cascade" }),

    orderItemId: varchar("order_item_id")
      .notNull()
      .references(() => orderItemsTable.id, { onDelete: "cascade" }),

    ...lifecycleDates,
  },
  (t) => ({
    orderId: index("order_items_pivot_order_id_idx").on(t.orderId),
  })
);

export const orderNotesTable = pgTable(
  "order_notes",
  {
    id: primaryId(),
    orderId: varchar("order_id")
      .notNull()
      .references(() => ordersTable.id, { onDelete: "cascade" }),

    subject: varchar("subject", { length: 2048 }).notNull(),
    source: varchar("source", { length: 100 }),
    body: text("body").notNull(),
    isImportant: boolean("is_important").notNull().default(false),
    createdBy: varchar("created_by").references(() => usersTable.id, {
      onDelete: "no action",
    }),
    ...lifecycleDates,
  },
  (t) => ({
    orderId: index("order_notes_order_id_idx").on(t.orderId),
  })
);

export const orderNoteAttachmentsTable = pgTable(
  "order_note_attachments",
  {
    id: primaryId(),
    orderNoteId: varchar("order_note_id")
      .notNull()
      .references(() => orderNotesTable.id, { onDelete: "cascade" }),

    filename: varchar("filename", { length: 255 }).notNull(),
    url: varchar("url", { length: 255 }).notNull(),
    size: varchar("size", { length: 255 }).notNull(),
    mimeType: varchar("mime_type", { length: 255 }).notNull(),

    ...lifecycleDates,
  },
  (t) => ({
    orderNoteId: index("order_note_attachments_order_note_id_idx").on(
      t.orderNoteId
    ),
  })
);

export const orderTaskStatuses = pgEnum("order_task_statuses", [
  "not_started",
  "in_progress",
  "completed",
]);

export const orderTasks = pgEnum("order_task_types", [
  "customer_follow_up",
  "order_follow_up",
  "factory_follow_up",
]);

export const orderTasksTable = pgTable(
  "order_tasks",
  {
    id: primaryId(),
    orderId: varchar("order_id")
      .notNull()
      .references(() => ordersTable.id, { onDelete: "cascade" }),

    subject: varchar("subject", { length: 2048 }).notNull(),
    body: text("body").notNull(),
    task: orderTasks("task").notNull(),
    status: orderTaskStatuses("status").notNull(),
    date: timestamp("date").notNull(),

    createdBy: varchar("created_by").references(() => usersTable.id, {
      onDelete: "no action",
    }),
    assignedTo: varchar("assigned_to").references(() => usersTable.id, {
      onDelete: "no action",
    }),
    ...lifecycleDates,
  },
  (t) => ({
    orderId: index("order_tasks_order_id_idx").on(t.orderId),
    task: index("order_tasks_task_idx").on(t.task),
    status: index("order_tasks_status_idx").on(t.status),
    date: index("order_tasks_date_idx").on(t.date),
    createdBy: index("order_tasks_created_by_idx").on(t.createdBy),
    assignedTo: index("order_tasks_assigned_to_idx").on(t.assignedTo),
  })
);

export const orderTaskAttachmentsTable = pgTable(
  "order_task_attachments",
  {
    id: primaryId(),
    orderTaskId: varchar("order_task_id")
      .notNull()
      .references(() => orderTasksTable.id, { onDelete: "cascade" }),

    filename: varchar("filename", { length: 255 }).notNull(),
    url: varchar("url", { length: 255 }).notNull(),
    size: varchar("size", { length: 255 }).notNull(),
    mimeType: varchar("mime_type", { length: 255 }).notNull(),

    ...lifecycleDates,
  },
  (t) => ({
    orderTaskId: index("order_task_attachments_order_task_id_idx").on(
      t.orderTaskId
    ),
  })
);
