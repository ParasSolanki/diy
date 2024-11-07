CREATE TABLE IF NOT EXISTS "colors" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"twc_name" varchar(255) NOT NULL,
	"description" varchar(1024),
	"fabric_id" varchar NOT NULL,
	"is_express" boolean DEFAULT false NOT NULL,
	"small_image_url" varchar(1024),
	"large_image_url" varchar(1024),
	"archived_at" timestamp,
	"archived_by" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT NULL,
	CONSTRAINT "colors_name_fabric_id_unique" UNIQUE("name","fabric_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fabric_categories" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(1024),
	"product_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT NULL,
	CONSTRAINT "fabric_categories_name_product_id_unique" UNIQUE("name","product_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fabric_groups" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(1024),
	"product_id" varchar NOT NULL,
	"archived_at" timestamp,
	"archived_by" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT NULL,
	CONSTRAINT "fabric_groups_name_product_id_unique" UNIQUE("name","product_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fabrics" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"twc_name" varchar(255) NOT NULL,
	"description" varchar(1024),
	"fabric_group_id" varchar NOT NULL,
	"fabric_category_id" varchar NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"small_image_url" varchar(1024),
	"large_image_url" varchar(1024),
	"min_width" integer DEFAULT 0,
	"min_drop" integer DEFAULT 0,
	"max_width" integer DEFAULT 0,
	"max_drop" integer DEFAULT 0,
	"archived_at" timestamp,
	"archived_by" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT NULL,
	CONSTRAINT "fabrics_name_fabric_group_id_unique" UNIQUE("name","fabric_group_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "colors" ADD CONSTRAINT "colors_fabric_id_fabrics_id_fk" FOREIGN KEY ("fabric_id") REFERENCES "public"."fabrics"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "colors" ADD CONSTRAINT "colors_archived_by_users_id_fk" FOREIGN KEY ("archived_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fabric_categories" ADD CONSTRAINT "fabric_categories_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fabric_groups" ADD CONSTRAINT "fabric_groups_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fabric_groups" ADD CONSTRAINT "fabric_groups_archived_by_users_id_fk" FOREIGN KEY ("archived_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fabrics" ADD CONSTRAINT "fabrics_fabric_group_id_fabric_groups_id_fk" FOREIGN KEY ("fabric_group_id") REFERENCES "public"."fabric_groups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fabrics" ADD CONSTRAINT "fabrics_fabric_category_id_fabric_categories_id_fk" FOREIGN KEY ("fabric_category_id") REFERENCES "public"."fabric_categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fabrics" ADD CONSTRAINT "fabrics_archived_by_users_id_fk" FOREIGN KEY ("archived_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "colors_name_idx" ON "colors" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "fabrics_fabric_idx" ON "colors" USING btree ("fabric_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "colors_archived_by_idx" ON "colors" USING btree ("archived_by");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "colors_name_fabric_id_index" ON "colors" USING btree ("name","fabric_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "fabric_categories_name_idx" ON "fabric_categories" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "fabric_categories_product_idx" ON "fabric_categories" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "fabric_categories_name_product_id_index" ON "fabric_categories" USING btree ("name","product_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "fabric_groups_name_idx" ON "fabric_groups" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "fabric_groups_product_idx" ON "fabric_groups" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "fabric_groups_archived_by_idx" ON "fabric_groups" USING btree ("archived_by");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "fabric_groups_name_product_id_index" ON "fabric_groups" USING btree ("name","product_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "fabrics_name_idx" ON "fabrics" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "fabrics_fabric_group_idx" ON "fabrics" USING btree ("fabric_group_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "fabrics_fabric_category_idx" ON "fabrics" USING btree ("fabric_category_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "fabrics_archived_by_idx" ON "fabrics" USING btree ("archived_by");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "fabrics_name_fabric_group_id_index" ON "fabrics" USING btree ("name","fabric_group_id");