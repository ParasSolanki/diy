import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { env } from "../env";
import * as schema from "../schema";

const PRODUCTS = [
  { name: "Roller Blind", description: "Roller blind" },
  { name: "Linked Roller Blind", description: "Linked Roller blind" },
  { name: "Double Roller Blind", description: "Double Roller blind" },
  {
    name: "Linked Double Roller Blind",
    description: "Linked Double Roller blind",
  },

  { name: "Roman Blind", description: "Roman blind" },
  { name: "Soft Roman Blind", description: "Soft Roman Blind" },

  { name: "Venetian Blind", description: "Venetian blind" },
  { name: "Vertical Blind", description: "Vertical blind" },

  { name: "Panel Glide Blind", description: "Panel Glide Blind" },

  { name: "Honeycomb Blind", description: "Honeycomb blind" },

  { name: "Curtain", description: "Curtain" },
  { name: "Curved Curtain", description: "Curved Curtain" },
  { name: "Bay Window Curtain", description: "Bay Window Curtain" },
  { name: "Lined Curtain", description: "Lined Curtain" },

  { name: "Shutter", description: "Shutter" },

  { name: "Mottor Accessories", description: "Mottor Accessories" },
  { name: "Pelmet", description: "Pelmet" },
  { name: "Scaffold", description: "Scaffold" },
  { name: "Misc", description: "Misc" },
];

const DEPARTMENTS = [
  { name: "HR", description: "Human Resources" },
  { name: "Operations", description: "Operations" },
  { name: "Sales", description: "Sales" },
  { name: "Marketing", description: "Marketing" },
  { name: "Accounts", description: "Accounts" },
  { name: "Digital", description: "Digital" },
  { name: "Director", description: "Director" },
];

const ROLES = [
  { name: "Admin", description: "Admin" },
  { name: "Tester", description: "Tester" },

  { name: "Director", description: "Director" }, // Director
  { name: "Digital Manger", description: "Digital Manger" }, // Digital
  { name: "HR", description: "HR" }, // HR

  { name: "Installer", description: "Installer" }, // Installer
  { name: "Sampler", description: "Sampler" }, // Sampler

  // Marketing
  { name: "Marketing Coordinator", description: "Marketing Coordinator" },
  { name: "Marketing Manager", description: "Marketing Manager" },

  // Accounts
  { name: "Accounts", description: "Accounts" },
  { name: "Chief Financial Officer", description: "Chief Financial Officer" },
  {
    name: "Accounts Receivable Officer",
    description: "Accounts Receivable Officer",
  },
  {
    name: "Accounts Manger or Finance Manager",
    description: "Accounts Manger or Finance Manager",
  },

  // Sales
  { name: "Sales Admin Support", description: "Sales Admin Support" },
  { name: "Sales Manager", description: "Sales Manager" },
  { name: "Design Consultant", description: "Design Consultant" },
  { name: "Senior Design Consultant", description: "Senior Design Consultant" },
  { name: "Product Specialist", description: "Product Specialist" },
  {
    name: "Senior Design Consultant / Team Leader",
    description: "Senior Design Consultant / Team Leader",
  },

  // Operations
  { name: "Operations Administator", description: "Operations Administator" },
  { name: "Operations Manager", description: "Operations Manager" },
  { name: "Operations Scheduler", description: "Operations Scheduler" },
  { name: "Operations Analyst", description: "Operations Analyst" },
  { name: "Samples Team Leader", description: "Samples Team Leader" },
  {
    name: "Operations Admin Team Leader",
    description: "Operations Admin Team Leader",
  },
];

async function seed() {
  const client = new pg.Client({
    connectionString: env.DATABASE_URL,
  });

  client.on("error", (e) => {
    console.error("Postgres client error");
    console.error(e);
    process.exit(1);
  });

  await client.connect();

  const db = drizzle(client, { schema, logger: true });

  console.log("Running init seed");

  await db
    .transaction(async (tx) => {
      console.log("Inserting products");

      await PRODUCTS.map(async (product) => {
        await tx.insert(schema.productsTable).values({
          name: product.name,
          description: product.description,
        });
      });

      console.log("Inserted products");

      console.log("Inserting departments");

      await DEPARTMENTS.map(async (department) => {
        await tx.insert(schema.departmentsTable).values({
          name: department.name,
          description: department.description,
        });
      });

      console.log("Inserted departments");

      console.log("Inserting roles");

      await ROLES.map(async (role) => {
        await tx.insert(schema.rolesTable).values({
          name: role.name,
          description: role.description,
        });
      });

      console.log("Inserted roles");
    })
    .then(() => {
      console.log("Init seed run successfully");
    })
    .catch((e) => {
      console.error("Init seed failed");
      console.error(e);
      process.exit(1);
    })
    .finally(() => {
      client.end();
    });
}

seed().catch((e) => {
  console.error("Init seed failed");
  console.error(e);
  process.exit(1);
});
