import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { env } from "./env";

async function main() {
  const client = new pg.Client({
    connectionString: env.DATABASE_URL,
  });

  client.on("error", (e) => {
    console.error("Postgres client error");
    console.error(e);
    process.exit(1);
  });

  await client.connect();

  const db = drizzle(client, { logger: true });

  console.log("Running migrations");

  await migrate(db, { migrationsFolder: "./migrations" });

  client.end();

  console.log("Migrated successfully");

  process.exit(0);
}

main().catch((e) => {
  console.error("Migration failed");
  console.error(e);
  process.exit(1);
});
