import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import path from "node:path";

async function runMigrations() {
  const connectionString =
    process.env.DATABASE_URL ?? "postgresql://localhost:5432/materialhub_dev";

  const pool = new Pool({ connectionString });
  const db = drizzle(pool);

  console.log("Running database migrations...");
  await migrate(db, {
    migrationsFolder: path.resolve(process.cwd(), "src/db/migrations"),
  });
  console.log("Database migrations completed successfully.");

  await pool.end();
}

runMigrations().catch((error) => {
  console.error("Database migration failed:", error);
  process.exit(1);
});
