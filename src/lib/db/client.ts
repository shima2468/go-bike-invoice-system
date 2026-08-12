import fs from "fs";
import path from "path";
import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "@/lib/db/schema";

function resolveDatabaseUrl(): string {
  if (process.env.TURSO_DATABASE_URL) {
    return process.env.TURSO_DATABASE_URL;
  }

  // On Vercel only /tmp is writable; locally use ./data
  const baseDir =
    process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
      ? "/tmp"
      : path.join(process.cwd(), "data");

  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  return `file:${path.join(baseDir, "invoices.db")}`;
}

const globalForDb = globalThis as unknown as {
  __gobikeDbClient?: Client;
  __gobikeDb?: LibSQLDatabase<typeof schema>;
  __gobikeSchemaReady?: Promise<void>;
};

function getClient(): Client {
  if (!globalForDb.__gobikeDbClient) {
    globalForDb.__gobikeDbClient = createClient({
      url: resolveDatabaseUrl(),
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return globalForDb.__gobikeDbClient;
}

export const db =
  globalForDb.__gobikeDb ??
  drizzle(getClient(), { schema });

if (!globalForDb.__gobikeDb) {
  globalForDb.__gobikeDb = db;
}

export async function ensureSchema(): Promise<void> {
  if (!globalForDb.__gobikeSchemaReady) {
    const client = getClient();
    globalForDb.__gobikeSchemaReady = (async () => {
      await client.execute(`
        CREATE TABLE IF NOT EXISTS customers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          document_id TEXT NOT NULL UNIQUE,
          customer_name TEXT NOT NULL,
          identification_number TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          phone TEXT NOT NULL,
          created_at TEXT NOT NULL
        )
      `);

      await client.execute(`
        CREATE TABLE IF NOT EXISTS invoices (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          document_id TEXT NOT NULL UNIQUE,
          invoice_number TEXT NOT NULL UNIQUE,
          invoice_date TEXT NOT NULL,
          scooter_type TEXT NOT NULL,
          warranty_duration TEXT NOT NULL,
          scooter_condition TEXT NOT NULL,
          price_ex_vat REAL NOT NULL,
          vat_rate REAL NOT NULL,
          vat_amount REAL NOT NULL,
          total REAL NOT NULL,
          customer_id INTEGER NOT NULL REFERENCES customers(id),
          created_at TEXT NOT NULL
        )
      `);
    })();
  }

  await globalForDb.__gobikeSchemaReady;
}
