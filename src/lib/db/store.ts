import fs from "fs";
import path from "path";
import { get, put } from "@vercel/blob";
import type { Customer, Invoice } from "@/types/invoice";
import type { Receipt } from "@/types/receipt";
import type { Sale } from "@/types/sale";

export interface StoreData {
  customers: Customer[];
  invoices: Invoice[];
  receipts: Receipt[];
  sales: Sale[];
  nextCustomerId: number;
  nextInvoiceId: number;
  nextReceiptId: number;
  nextSaleId: number;
}

const STORE_KEY = "gobike-invoices-store.json";
const EMPTY_STORE: StoreData = {
  customers: [],
  invoices: [],
  receipts: [],
  sales: [],
  nextCustomerId: 1,
  nextInvoiceId: 1,
  nextReceiptId: 1,
  nextSaleId: 1,
};

function normalizeStore(data: Partial<StoreData> | null | undefined): StoreData {
  return {
    customers: data?.customers ?? [],
    invoices: data?.invoices ?? [],
    receipts: data?.receipts ?? [],
    sales: data?.sales ?? [],
    nextCustomerId: data?.nextCustomerId ?? 1,
    nextInvoiceId: data?.nextInvoiceId ?? 1,
    nextReceiptId: data?.nextReceiptId ?? 1,
    nextSaleId: data?.nextSaleId ?? 1,
  };
}

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
  return normalizeStore(JSON.parse(text) as Partial<StoreData>);
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
    const fromBlob = await readFromBlob();
    if (fromBlob) return fromBlob;
    return normalizeStore(EMPTY_STORE);
  }

  if (process.env.VERCEL) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN ontbreekt. Zonder Vercel Blob gaan gegevens verloren."
    );
  }

  const filePath = localStorePath();
  if (fs.existsSync(filePath)) {
    try {
      return normalizeStore(
        JSON.parse(fs.readFileSync(filePath, "utf8")) as Partial<StoreData>
      );
    } catch {
      return normalizeStore(EMPTY_STORE);
    }
  }

  return normalizeStore(EMPTY_STORE);
}

export async function writeStore(data: StoreData): Promise<void> {
  const payload: StoreData = {
    customers: data.customers,
    invoices: data.invoices,
    receipts: data.receipts ?? [],
    sales: data.sales ?? [],
    nextCustomerId: data.nextCustomerId,
    nextInvoiceId: data.nextInvoiceId,
    nextReceiptId: data.nextReceiptId ?? 1,
    nextSaleId: data.nextSaleId ?? 1,
  };

  if (useBlob()) {
    await writeToBlob(payload);
    try {
      fs.writeFileSync(localStorePath(), JSON.stringify(payload, null, 2), "utf8");
    } catch {
      // local mirror is optional
    }
    return;
  }

  if (process.env.VERCEL) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN ontbreekt. Data kan niet duurzaam worden opgeslagen."
    );
  }

  fs.writeFileSync(localStorePath(), JSON.stringify(payload, null, 2), "utf8");
}
