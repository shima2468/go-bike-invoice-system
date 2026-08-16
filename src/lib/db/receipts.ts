import { randomUUID } from "crypto";
import { calculateInvoiceTotals } from "@/lib/invoice-calculations";
import { formatReceiptNumber } from "@/lib/invoice-formatting";
import { readStore, writeStore } from "@/lib/db/store";
import { upsertCustomer } from "@/lib/db/invoices";
import type { Receipt } from "@/types/receipt";

function matchesReceiptId(receipt: Receipt, id: string): boolean {
  if (receipt.documentId === id) return true;
  const numericId = Number(id);
  return Number.isFinite(numericId) && receipt.id === numericId;
}

export async function getNextReceiptNumber(): Promise<string> {
  const store = await readStore();
  if (store.receipts.length === 0) {
    return formatReceiptNumber(1);
  }

  const latest = [...store.receipts].sort((a, b) => (b.id ?? 0) - (a.id ?? 0))[0];
  const match = latest.receiptNumber.match(/BON-(\d+)/);
  const sequence = match ? parseInt(match[1], 10) + 1 : store.receipts.length + 1;
  return formatReceiptNumber(sequence);
}

export async function createReceipt(
  data: Omit<Receipt, "id" | "documentId" | "vatAmount" | "total"> & {
    customerId?: number;
    customerDocumentId?: string;
  }
): Promise<Receipt> {
  const { vatAmount, total } = calculateInvoiceTotals(
    data.priceExVat,
    data.vatRate
  );

  if (!data.customerId) {
    throw new Error("Customer reference is required to create a receipt.");
  }

  const store = await readStore();
  const customer =
    store.customers.find((row) => row.id === data.customerId) ?? null;

  const created: Receipt = {
    id: store.nextReceiptId,
    documentId: randomUUID(),
    receiptNumber: data.receiptNumber,
    paymentDate: data.paymentDate,
    paymentMethod: data.paymentMethod,
    customerName: customer?.customerName ?? data.customerName,
    identificationNumber:
      customer?.identificationNumber ?? data.identificationNumber,
    email: customer?.email ?? data.email,
    phone: customer?.phone ?? data.phone,
    scooterType: data.scooterType,
    warrantyDuration: data.warrantyDuration,
    scooterCondition: data.scooterCondition,
    priceExVat: data.priceExVat,
    vatRate: data.vatRate,
    vatAmount,
    total,
    customerId: data.customerId,
    customerDocumentId: customer?.documentId ?? data.customerDocumentId,
  };

  store.receipts.unshift(created);
  store.nextReceiptId += 1;
  await writeStore(store);
  return created;
}

export async function listReceipts(): Promise<Receipt[]> {
  const store = await readStore();
  return [...store.receipts].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
}

export async function getReceiptById(id: string): Promise<Receipt | null> {
  const store = await readStore();
  return store.receipts.find((receipt) => matchesReceiptId(receipt, id)) ?? null;
}

export async function updateReceipt(
  id: string,
  data: Omit<Receipt, "id" | "documentId" | "vatAmount" | "total" | "receiptNumber"> & {
    receiptNumber?: string;
  }
): Promise<Receipt | null> {
  const store = await readStore();
  const index = store.receipts.findIndex((receipt) =>
    matchesReceiptId(receipt, id)
  );
  if (index < 0) return null;

  const existing = store.receipts[index];
  const customer = await upsertCustomer({
    customerName: data.customerName,
    identificationNumber: data.identificationNumber,
    email: data.email,
    phone: data.phone,
  });

  const { vatAmount, total } = calculateInvoiceTotals(
    data.priceExVat,
    data.vatRate
  );

  const updated: Receipt = {
    ...existing,
    receiptNumber: data.receiptNumber ?? existing.receiptNumber,
    paymentDate: data.paymentDate,
    paymentMethod: data.paymentMethod,
    customerName: data.customerName,
    identificationNumber: data.identificationNumber,
    email: data.email,
    phone: data.phone,
    scooterType: data.scooterType,
    warrantyDuration: data.warrantyDuration,
    scooterCondition: data.scooterCondition,
    priceExVat: data.priceExVat,
    vatRate: data.vatRate,
    vatAmount,
    total,
    customerId: customer.id,
    customerDocumentId: customer.documentId,
  };

  store.receipts[index] = updated;
  await writeStore(store);
  return updated;
}

export async function deleteReceipt(id: string): Promise<boolean> {
  const store = await readStore();
  const before = store.receipts.length;
  store.receipts = store.receipts.filter(
    (receipt) => !matchesReceiptId(receipt, id)
  );

  if (store.receipts.length === before) {
    return false;
  }

  await writeStore(store);
  return true;
}
