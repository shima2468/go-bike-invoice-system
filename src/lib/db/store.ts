import fs from "fs";
import path from "path";
import { put, list } from "@vercel/blob";
import type { Customer, Invoice } from "@/types/invoice";

export interface StoreData {
  customers: Customer[];
  invoices: Invoice[];
  nextCustomerId: number;
  nextInvoiceId: number;
}

const STORE_KEY = "gobike-invoices-store.json";
const EMPTY_STORE: StoreData = {
  customers: [],
  invoices: [],
  nextCustomerId: 1,
  nextInvoiceId: 1,
};

function localStorePath(): string {
  const dir =
    process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
      ? "/tmp"
      : path.join(process.cwd(), "data");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return path.join(dir, STORE_KEY);
}

function useBlob(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function readFromBlob(): Promise<StoreData | null> {
  const result = await list({ prefix: STORE_KEY, limit: 1 });
  const blob = result.blobs.find((item) => item.pathname === STORE_KEY);
  if (!blob) return null;

  const response = await fetch(blob.url, { cache: "no-store" });
  if (!response.ok) return null;
  return (await response.json()) as StoreData;
}

async function writeToBlob(data: StoreData): Promise<void> {
  await put(STORE_KEY, JSON.stringify(data, null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

export async function readStore(): Promise<StoreData> {
  if (useBlob()) {
    try {
      const fromBlob = await readFromBlob();
      if (fromBlob) return fromBlob;
    } catch {
      // fall through to local/empty
    }
  }

  const filePath = localStorePath();
  if (fs.existsSync(filePath)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, "utf8")) as StoreData;
    } catch {
      return { ...EMPTY_STORE, customers: [], invoices: [] };
    }
  }

  return { ...EMPTY_STORE, customers: [], invoices: [] };
}

export async function writeStore(data: StoreData): Promise<void> {
  if (useBlob()) {
    await writeToBlob(data);
    return;
  }

  fs.writeFileSync(localStorePath(), JSON.stringify(data, null, 2), "utf8");
}
