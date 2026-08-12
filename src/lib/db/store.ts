import fs from "fs";
import path from "path";
import { get, put } from "@vercel/blob";
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

async function streamToString(
  stream: ReadableStream<Uint8Array>
): Promise<string> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  return new TextDecoder().decode(merged);
}

async function readFromBlob(): Promise<StoreData | null> {
  const result = await get(STORE_KEY, {
    access: "private",
    useCache: false,
  });
  if (!result || result.statusCode === 304 || !result.stream) return null;

  const text = await streamToString(result.stream);
  return JSON.parse(text) as StoreData;
}

async function writeToBlob(data: StoreData): Promise<void> {
  await put(STORE_KEY, JSON.stringify(data, null, 2), {
    access: "private",
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
    // Keep a local mirror when possible (local/dev)
    try {
      fs.writeFileSync(localStorePath(), JSON.stringify(data, null, 2), "utf8");
    } catch {
      // ignore local mirror failures on read-only filesystems
    }
    return;
  }

  fs.writeFileSync(localStorePath(), JSON.stringify(data, null, 2), "utf8");
}
