import fs from "fs";
import path from "path";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "@/lib/db/schema";

function resolveDatabaseUrl(): string {
  if (process.env.TURSO_DATABASE_URL) {
    return process.env.TURSO_DATABASE_URL;
  }

  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  return `file:${path.join(dataDir, "invoices.db")}`;
}

const client = createClient({
  url: resolveDatabaseUrl(),
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });

let schemaReady: Promise<void> | null = null;

export async function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
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

  await schemaReady;
}
