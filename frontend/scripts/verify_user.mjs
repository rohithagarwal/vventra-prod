import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8');
const match = env.match(/DATABASE_URL="([^"]+)"/);
if (!match) {
  console.error("DATABASE_URL not found");
  process.exit(1);
}

const sql = neon(match[1]);

async function main() {
    const users = await sql`SELECT id, email, role, status, created_at FROM users ORDER BY created_at ASC`;
    console.log("All Registered Users in Neon DB:\n", JSON.stringify(users, null, 2));
}

main().catch(console.error);
