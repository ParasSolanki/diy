CREATE TABLE IF NOT EXISTS "customer_accounts" (
	"id" varchar PRIMARY KEY NOT NULL,
	"customer_id" varchar NOT NULL,
	"provider_key" varchar(100) NOT NULL,
	"provider_id" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT NULL,
	CONSTRAINT "customer_accounts_customer_id_provider_key_unique" UNIQUE("customer_id","provider_key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "customer_password_reset_tokens" (
	"id" varchar PRIMARY KEY NOT NULL,
	"customer_id" varchar NOT NULL,
	"token_hash" varchar(512) NOT NULL,
	"expires_at" timestamp NOT NULL,
	CONSTRAINT "customer_password_reset_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "customer_passwords" (
	"id" varchar PRIMARY KEY NOT NULL,
	"customer_id" varchar NOT NULL,
	"hashed_password" varchar(2048) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT NULL,
	CONSTRAINT "customer_passwords_customer_id_unique" UNIQUE("customer_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "customer_sessions" (
	"id" varchar PRIMARY KEY NOT NULL,
	"customer_id" varchar NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "customers" (
	"id" varchar PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"display_name" varchar(255),
	"avatar_url" varchar,
	"address" varchar(1024) NOT NULL,
	"city" varchar(255) NOT NULL,
	"state" varchar(255) NOT NULL,
	"postcode" varchar(255) NOT NULL,
	"billing_address" varchar(1024),
	"billing_city" varchar(255),
	"billing_state" varchar(255),
	"billing_postcode" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT NULL,
	CONSTRAINT "customers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "customer_accounts" ADD CONSTRAINT "customer_accounts_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "customer_password_reset_tokens" ADD CONSTRAINT "customer_password_reset_tokens_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "customer_passwords" ADD CONSTRAINT "customer_passwords_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "customer_sessions" ADD CONSTRAINT "customer_sessions_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "customer_accounts_customer_idx" ON "customer_accounts" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "customer_accounts_provider_key_idx" ON "customer_accounts" USING btree ("provider_key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "customer_accounts_provider_id_idx" ON "customer_accounts" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "customer_password_reset_tokens_customer_idx" ON "customer_password_reset_tokens" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "customer_passwords_customer_idx" ON "customer_passwords" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "customer_sessions_customer_idx" ON "customer_sessions" USING btree ("customer_id");