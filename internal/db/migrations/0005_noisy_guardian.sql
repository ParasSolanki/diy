DO $$ BEGIN
 CREATE TYPE "public"."order_quote_types" AS ENUM('off_plan', 'customer_measurements', 'check_measure');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."order_stages" AS ENUM('quote', 'order');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."order_statuses" AS ENUM('drafted', 'awaiting_approval', 'customer_approved', 'pending', 'processing', 'in_progress', 'in_review', 'awaiting_check_measure', 'check_measure_completed', 'queried', 'sent_to_factory', 'completed', 'archived');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."order_task_statuses" AS ENUM('not_started', 'in_progress', 'completed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."order_task_types" AS ENUM('customer_follow_up', 'order_follow_up', 'factory_follow_up');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."order_types" AS ENUM('install', 'delivery', 'check_measure_and_delivery');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."status" AS ENUM('pending', 'in_progress', 'processing', 'sent_to_customer', 'too_many_samples', 'archived');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."sample_order_task_statuses" AS ENUM('not_started', 'in_progress', 'completed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."sample_order_task_types" AS ENUM('customer_follow_up', 'order_follow_up', 'factory_follow_up');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "order_items" (
	"id" varchar PRIMARY KEY NOT NULL,
	"order" integer NOT NULL,
	"name" varchar(256) NOT NULL,
	"product_id" varchar NOT NULL,
	"fabric_id" varchar,
	"color_id" varchar,
	"width" integer,
	"drop" integer,
	"quantity" integer,
	"price" numeric(10, 2) NOT NULL,
	"is_external" boolean DEFAULT false NOT NULL,
	"notes" varchar(2048),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sample_order_items" (
	"id" varchar PRIMARY KEY NOT NULL,
	"order" integer NOT NULL,
	"product_id" varchar NOT NULL,
	"fabric_id" varchar,
	"color_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cart_order_items" (
	"id" varchar PRIMARY KEY NOT NULL,
	"cart_id" varchar NOT NULL,
	"order_item_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cart_sample_order_items" (
	"id" varchar PRIMARY KEY NOT NULL,
	"cart_id" varchar NOT NULL,
	"sample_order_item_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "carts" (
	"id" varchar PRIMARY KEY NOT NULL,
	"customer_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "order_items_pivot" (
	"id" varchar PRIMARY KEY NOT NULL,
	"order_id" varchar NOT NULL,
	"order_item_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "order_note_attachments" (
	"id" varchar PRIMARY KEY NOT NULL,
	"order_note_id" varchar NOT NULL,
	"filename" varchar(255) NOT NULL,
	"url" varchar(255) NOT NULL,
	"size" varchar(255) NOT NULL,
	"mime_type" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "order_notes" (
	"id" varchar PRIMARY KEY NOT NULL,
	"order_id" varchar NOT NULL,
	"subject" varchar(2048) NOT NULL,
	"source" varchar(100),
	"body" text NOT NULL,
	"is_important" boolean DEFAULT false NOT NULL,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "order_task_attachments" (
	"id" varchar PRIMARY KEY NOT NULL,
	"order_task_id" varchar NOT NULL,
	"filename" varchar(255) NOT NULL,
	"url" varchar(255) NOT NULL,
	"size" varchar(255) NOT NULL,
	"mime_type" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "order_tasks" (
	"id" varchar PRIMARY KEY NOT NULL,
	"order_id" varchar NOT NULL,
	"subject" varchar(2048) NOT NULL,
	"body" text NOT NULL,
	"task" "order_task_types" NOT NULL,
	"status" "order_task_statuses" NOT NULL,
	"date" timestamp NOT NULL,
	"created_by" varchar,
	"assigned_to" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "orders" (
	"id" varchar PRIMARY KEY NOT NULL,
	"code" varchar NOT NULL,
	"type" "order_types" NOT NULL,
	"stage" "order_stages" NOT NULL,
	"status" "order_statuses" NOT NULL,
	"date" timestamp NOT NULL,
	"quote_type" "order_quote_types",
	"email" varchar(255) NOT NULL,
	"address" varchar(1024) NOT NULL,
	"city" varchar(255) NOT NULL,
	"state" varchar(255) NOT NULL,
	"postcode" varchar(255) NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"shipping" numeric(10, 2) NOT NULL,
	"measure" numeric(10, 2) NOT NULL,
	"install" numeric(10, 2) NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"discount" numeric(10, 2) NOT NULL,
	"insurance" numeric(10, 2) NOT NULL,
	"source" numeric(10, 2) NOT NULL,
	"due_date" timestamp,
	"confirmation_date" timestamp,
	"send_to_factory_date" timestamp,
	"instructions" varchar(2048),
	"delivery_instructions" varchar(2048),
	"customer_id" varchar,
	"consultant_id" varchar,
	"created_by" varchar,
	"updated_by" varchar,
	"send_to_factory_by_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT NULL,
	CONSTRAINT "orders_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sample_order_items_pivot" (
	"id" varchar PRIMARY KEY NOT NULL,
	"sample_order_id" varchar NOT NULL,
	"sample_order_item_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sample_order_note_attachments" (
	"id" varchar PRIMARY KEY NOT NULL,
	"sample_order_note_id" varchar NOT NULL,
	"filename" varchar(255) NOT NULL,
	"url" varchar(255) NOT NULL,
	"size" varchar(255) NOT NULL,
	"mime_type" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sample_order_notes" (
	"id" varchar PRIMARY KEY NOT NULL,
	"sample_order_id" varchar NOT NULL,
	"subject" varchar(2048) NOT NULL,
	"source" varchar(100),
	"body" text NOT NULL,
	"is_important" boolean DEFAULT false NOT NULL,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sample_order_task_attachments" (
	"id" varchar PRIMARY KEY NOT NULL,
	"sample_order_task_id" varchar NOT NULL,
	"filename" varchar(255) NOT NULL,
	"url" varchar(255) NOT NULL,
	"size" varchar(255) NOT NULL,
	"mime_type" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sample_order_tasks" (
	"id" varchar PRIMARY KEY NOT NULL,
	"sample_order_id" varchar NOT NULL,
	"subject" varchar(2048) NOT NULL,
	"body" text NOT NULL,
	"task" "sample_order_task_types" NOT NULL,
	"status" "sample_order_task_statuses" NOT NULL,
	"date" timestamp NOT NULL,
	"created_by" varchar,
	"assigned_to" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sample_orders" (
	"id" varchar PRIMARY KEY NOT NULL,
	"code" varchar NOT NULL,
	"date" timestamp NOT NULL,
	"status" "status" NOT NULL,
	"email" varchar(255) NOT NULL,
	"address" varchar(1024) NOT NULL,
	"city" varchar(255) NOT NULL,
	"state" varchar(255) NOT NULL,
	"postcode" varchar(255) NOT NULL,
	"australian_post_tracking_reference" varchar(100),
	"order_id" varchar,
	"customer_id" varchar,
	"consultant_id" varchar,
	"created_by" varchar,
	"updated_by" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT NULL,
	CONSTRAINT "sample_orders_code_unique" UNIQUE("code")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_items" ADD CONSTRAINT "order_items_fabric_id_fabrics_id_fk" FOREIGN KEY ("fabric_id") REFERENCES "public"."fabrics"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_items" ADD CONSTRAINT "order_items_color_id_colors_id_fk" FOREIGN KEY ("color_id") REFERENCES "public"."colors"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sample_order_items" ADD CONSTRAINT "sample_order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sample_order_items" ADD CONSTRAINT "sample_order_items_fabric_id_fabrics_id_fk" FOREIGN KEY ("fabric_id") REFERENCES "public"."fabrics"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sample_order_items" ADD CONSTRAINT "sample_order_items_color_id_colors_id_fk" FOREIGN KEY ("color_id") REFERENCES "public"."colors"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cart_order_items" ADD CONSTRAINT "cart_order_items_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cart_order_items" ADD CONSTRAINT "cart_order_items_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cart_sample_order_items" ADD CONSTRAINT "cart_sample_order_items_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cart_sample_order_items" ADD CONSTRAINT "cart_sample_order_items_sample_order_item_id_sample_order_items_id_fk" FOREIGN KEY ("sample_order_item_id") REFERENCES "public"."sample_order_items"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "carts" ADD CONSTRAINT "carts_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_items_pivot" ADD CONSTRAINT "order_items_pivot_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_items_pivot" ADD CONSTRAINT "order_items_pivot_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_note_attachments" ADD CONSTRAINT "order_note_attachments_order_note_id_order_notes_id_fk" FOREIGN KEY ("order_note_id") REFERENCES "public"."order_notes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_notes" ADD CONSTRAINT "order_notes_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_notes" ADD CONSTRAINT "order_notes_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_task_attachments" ADD CONSTRAINT "order_task_attachments_order_task_id_order_tasks_id_fk" FOREIGN KEY ("order_task_id") REFERENCES "public"."order_tasks"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_tasks" ADD CONSTRAINT "order_tasks_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_tasks" ADD CONSTRAINT "order_tasks_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_tasks" ADD CONSTRAINT "order_tasks_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_consultant_id_users_id_fk" FOREIGN KEY ("consultant_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_send_to_factory_by_id_users_id_fk" FOREIGN KEY ("send_to_factory_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sample_order_items_pivot" ADD CONSTRAINT "sample_order_items_pivot_sample_order_id_sample_orders_id_fk" FOREIGN KEY ("sample_order_id") REFERENCES "public"."sample_orders"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sample_order_items_pivot" ADD CONSTRAINT "sample_order_items_pivot_sample_order_item_id_sample_order_items_id_fk" FOREIGN KEY ("sample_order_item_id") REFERENCES "public"."sample_order_items"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sample_order_note_attachments" ADD CONSTRAINT "sample_order_note_attachments_sample_order_note_id_sample_order_notes_id_fk" FOREIGN KEY ("sample_order_note_id") REFERENCES "public"."sample_order_notes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sample_order_notes" ADD CONSTRAINT "sample_order_notes_sample_order_id_sample_orders_id_fk" FOREIGN KEY ("sample_order_id") REFERENCES "public"."sample_orders"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sample_order_notes" ADD CONSTRAINT "sample_order_notes_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sample_order_task_attachments" ADD CONSTRAINT "sample_order_task_attachments_sample_order_task_id_sample_order_tasks_id_fk" FOREIGN KEY ("sample_order_task_id") REFERENCES "public"."sample_order_tasks"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sample_order_tasks" ADD CONSTRAINT "sample_order_tasks_sample_order_id_sample_orders_id_fk" FOREIGN KEY ("sample_order_id") REFERENCES "public"."sample_orders"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sample_order_tasks" ADD CONSTRAINT "sample_order_tasks_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sample_order_tasks" ADD CONSTRAINT "sample_order_tasks_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sample_orders" ADD CONSTRAINT "sample_orders_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sample_orders" ADD CONSTRAINT "sample_orders_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sample_orders" ADD CONSTRAINT "sample_orders_consultant_id_users_id_fk" FOREIGN KEY ("consultant_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sample_orders" ADD CONSTRAINT "sample_orders_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sample_orders" ADD CONSTRAINT "sample_orders_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cart_order_items_cart_idx" ON "cart_order_items" USING btree ("cart_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cart_sample_order_items_cart_idx" ON "cart_sample_order_items" USING btree ("cart_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_note_attachments_order_note_id_idx" ON "order_note_attachments" USING btree ("order_note_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_notes_order_id_idx" ON "order_notes" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_task_attachments_order_task_id_idx" ON "order_task_attachments" USING btree ("order_task_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_tasks_order_id_idx" ON "order_tasks" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_tasks_task_idx" ON "order_tasks" USING btree ("task");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_tasks_status_idx" ON "order_tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_tasks_date_idx" ON "order_tasks" USING btree ("date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_tasks_created_by_idx" ON "order_tasks" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_tasks_assigned_to_idx" ON "order_tasks" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_type_idx" ON "orders" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_stage_idx" ON "orders" USING btree ("stage");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_date_idx" ON "orders" USING btree ("date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "orders_created_by_idx" ON "orders" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "orders_updated_by_idx" ON "orders" USING btree ("updated_by");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_customer_id_idx" ON "orders" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_consultant_id_idx" ON "orders" USING btree ("consultant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sample_order_items_pivot_sample_order_idx" ON "sample_order_items_pivot" USING btree ("sample_order_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sample_order_note_attachments_sample_order_note_id_idx" ON "sample_order_note_attachments" USING btree ("sample_order_note_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sample_order_notes_sample_order_id_idx" ON "sample_order_notes" USING btree ("sample_order_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sample_order_task_attachments_sample_order_task_id_idx" ON "sample_order_task_attachments" USING btree ("sample_order_task_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sample_order_tasks_sample_order_id_idx" ON "sample_order_tasks" USING btree ("sample_order_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sample_order_tasks_task_idx" ON "sample_order_tasks" USING btree ("task");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sample_order_tasks_status_idx" ON "sample_order_tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sample_order_tasks_date_idx" ON "sample_order_tasks" USING btree ("date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sample_order_tasks_created_by_idx" ON "sample_order_tasks" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sample_order_tasks_assigned_to_idx" ON "sample_order_tasks" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sample_orders_date_idx" ON "sample_orders" USING btree ("date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sample_orders_status_idx" ON "sample_orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sample_orders_order_id_idx" ON "sample_orders" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sample_orders_customer_id_idx" ON "sample_orders" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sample_orders_consultant_id_idx" ON "sample_orders" USING btree ("consultant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sample_orders_created_by_idx" ON "sample_orders" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sample_orders_updated_by_idx" ON "sample_orders" USING btree ("updated_by");