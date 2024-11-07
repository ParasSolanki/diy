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
import { lifecycleDates, primaryId } from "./utils";
import { customersTable } from "./customers";
import { usersTable } from "./users";
import { sampleOrderItemsTable } from "./order-items";
import { ordersTable } from "./orders";

export const sampleOrderStatuses = pgEnum("status", [
  "pending",
  "in_progress",
  "processing",
  "sent_to_customer",
  "too_many_samples",
  "archived",
]);

export const sampleOrdersTable = pgTable(
  "sample_orders",
  {
    id: primaryId(),
    code: varchar("code").notNull().unique(),
    date: timestamp("date").notNull(),
    status: sampleOrderStatuses("status").notNull(),

    email: varchar("email", { length: 255 }).notNull(),
    address: varchar("address", { length: 1024 }).notNull(),
    city: varchar("city", { length: 255 }).notNull(),
    state: varchar("state", { length: 255 }).notNull(),
    postcode: varchar("postcode", { length: 255 }).notNull(),

    australianPostTrackingReference: varchar(
      "australian_post_tracking_reference",
      {
        length: 100,
      }
    ),

    orderId: varchar("order_id").references(() => ordersTable.id, {
      onDelete: "cascade",
    }),

    customerId: varchar("customer_id").references(() => customersTable.id, {
      onDelete: "cascade",
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

    ...lifecycleDates,
  },
  (t) => ({
    code: uniqueIndex().on(t.code),
    date: index("sample_orders_date_idx").on(t.date),
    status: index("sample_orders_status_idx").on(t.status),
    orderId: index("sample_orders_order_id_idx").on(t.orderId),
    customerId: index("sample_orders_customer_id_idx").on(t.customerId),
    consultantId: index("sample_orders_consultant_id_idx").on(t.consultantId),
    createdBy: index("sample_orders_created_by_idx").on(t.createdBy),
    updatedBy: index("sample_orders_updated_by_idx").on(t.updatedBy),
  })
);

export const sampleOrderItemsPivotTable = pgTable(
  "sample_order_items_pivot",
  {
    id: primaryId(),

    sampleOrderId: varchar("sample_order_id")
      .notNull()
      .references(() => sampleOrdersTable.id, { onDelete: "cascade" }),

    sampleOrderItemId: varchar("sample_order_item_id")
      .notNull()
      .references(() => sampleOrderItemsTable.id, { onDelete: "cascade" }),

    ...lifecycleDates,
  },
  (t) => ({
    sampleOrderId: index("sample_order_items_pivot_sample_order_idx").on(
      t.sampleOrderId
    ),
  })
);

export const sampleOrderNotesTable = pgTable(
  "sample_order_notes",
  {
    id: primaryId(),
    sampleOrderId: varchar("sample_order_id")
      .notNull()
      .references(() => sampleOrdersTable.id, { onDelete: "cascade" }),
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
    sampleOrderId: index("sample_order_notes_sample_order_id_idx").on(
      t.sampleOrderId
    ),
  })
);

export const sampleOrderNoteAttachmentsTable = pgTable(
  "sample_order_note_attachments",
  {
    id: primaryId(),
    sampleOrderNoteId: varchar("sample_order_note_id")
      .notNull()
      .references(() => sampleOrderNotesTable.id, { onDelete: "cascade" }),

    filename: varchar("filename", { length: 255 }).notNull(),
    url: varchar("url", { length: 255 }).notNull(),
    size: varchar("size", { length: 255 }).notNull(),
    mimeType: varchar("mime_type", { length: 255 }).notNull(),

    ...lifecycleDates,
  },
  (t) => ({
    sampleOrderNoteId: index(
      "sample_order_note_attachments_sample_order_note_id_idx"
    ).on(t.sampleOrderNoteId),
  })
);

export const sampleOrderTaskStatuses = pgEnum("sample_order_task_statuses", [
  "not_started",
  "in_progress",
  "completed",
]);

export const sampleOrderTasks = pgEnum("sample_order_task_types", [
  "customer_follow_up",
  "order_follow_up",
  "factory_follow_up",
]);

export const sampleOrderTasksTable = pgTable(
  "sample_order_tasks",
  {
    id: primaryId(),
    sampleOrderId: varchar("sample_order_id")
      .notNull()
      .references(() => sampleOrdersTable.id, { onDelete: "cascade" }),
    subject: varchar("subject", { length: 2048 }).notNull(),
    body: text("body").notNull(),
    task: sampleOrderTasks("task").notNull(),
    status: sampleOrderTaskStatuses("status").notNull(),
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
    sampleOrderId: index("sample_order_tasks_sample_order_id_idx").on(
      t.sampleOrderId
    ),
    task: index("sample_order_tasks_task_idx").on(t.task),
    status: index("sample_order_tasks_status_idx").on(t.status),
    date: index("sample_order_tasks_date_idx").on(t.date),
    createdBy: index("sample_order_tasks_created_by_idx").on(t.createdBy),
    assignedTo: index("sample_order_tasks_assigned_to_idx").on(t.assignedTo),
  })
);

export const sampleOrderTaskAttachmentsTable = pgTable(
  "sample_order_task_attachments",
  {
    id: primaryId(),
    sampleOrderTaskId: varchar("sample_order_task_id")
      .notNull()
      .references(() => sampleOrderTasksTable.id, { onDelete: "cascade" }),

    filename: varchar("filename", { length: 255 }).notNull(),
    url: varchar("url", { length: 255 }).notNull(),
    size: varchar("size", { length: 255 }).notNull(),
    mimeType: varchar("mime_type", { length: 255 }).notNull(),

    ...lifecycleDates,
  },
  (t) => ({
    sampleOrderTaskId: index(
      "sample_order_task_attachments_sample_order_task_id_idx"
    ).on(t.sampleOrderTaskId),
  })
);
