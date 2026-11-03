import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  pool: Pool | undefined;
};

const connectionString =
  process.env.DATABASE_URL ?? "postgresql://localhost:5432/materialhub_dev";

export const pool =
  globalForDb.pool ??
  new Pool({
    connectionString,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}

export const db = drizzle(pool, { schema });
export type Database = typeof db;
