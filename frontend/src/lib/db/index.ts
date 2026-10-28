import { neon } from "@neondatabase/serverless";

const dbUrl = process.env.DATABASE_URL || process.env.DATABASE_URL_UNPOOLED || process.env.POSTGRES_URL;

if (!dbUrl && process.env.NODE_ENV === "production") {
  console.warn("Neon DATABASE_URL is not configured.");
}

export const sql = neon(dbUrl || "postgresql://localhost:5432/neondb");

export interface DatabaseHealthResult {
  connected: boolean;
  database: string;
  version: string;
  serverTime: string;
  branch: string;
}

export async function getDatabaseHealth(): Promise<DatabaseHealthResult> {
  const rows = await sql`
    SELECT 
      1 as connected, 
      current_database() as db_name, 
      version() as pg_version, 
      NOW() as server_time;
  `;
  const row = rows[0] as { connected: number; db_name: string; pg_version: string; server_time: string };
  return {
    connected: row.connected === 1,
    database: row.db_name,
    version: row.pg_version,
    serverTime: row.server_time,
    branch: process.env.NEON_BRANCH || "production",
  };
}
