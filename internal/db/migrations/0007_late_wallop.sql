DROP INDEX IF EXISTS "user_passwords_user_idx";--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "departments_name_index" ON "departments" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "permissions_name_index" ON "permissions" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "roles_name_index" ON "roles" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_password_reset_tokens_token_hash_index" ON "user_password_reset_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_passwords_user_id_index" ON "user_passwords" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_index" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "customers_email_index" ON "customers" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_items_pivot_order_id_idx" ON "order_items_pivot" USING btree ("order_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "orders_code_index" ON "orders" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "sample_orders_code_index" ON "sample_orders" USING btree ("code");