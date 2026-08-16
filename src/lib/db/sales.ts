import { randomUUID } from "crypto";
import { readStore, writeStore } from "@/lib/db/store";
import type { Sale, SaleLogEntry } from "@/types/sale";

export async function createSale(
  data: Omit<Sale, "id" | "documentId">
): Promise<Sale> {
  const store = await readStore();
  const created: Sale = {
    id: store.nextSaleId,
    documentId: randomUUID(),
    soldOn: data.soldOn,
    item: data.item,
    customerName: data.customerName,
    amount: data.amount,
    notes: data.notes,
  };
  store.sales.unshift(created);
  store.nextSaleId += 1;
  await writeStore(store);
  return created;
}

export async function deleteSale(id: string): Promise<boolean> {
  const store = await readStore();
  const before = store.sales.length;
  store.sales = store.sales.filter((sale) => {
    if (sale.documentId === id) return false;
    return String(sale.id) !== id;
  });
  if (store.sales.length === before) return false;
  await writeStore(store);
  return true;
}

export async function listSaleLog(): Promise<SaleLogEntry[]> {
  const store = await readStore();

  const fromInvoices: SaleLogEntry[] = store.invoices.map((invoice) => ({
    key: `invoice-${invoice.documentId ?? invoice.id}`,
    soldOn: invoice.invoiceDate,
    item: invoice.scooterType,
    customerName: invoice.customerName,
    amount: invoice.total,
    notes: invoice.scooterCondition,
    source: "invoice",
    href: `/invoices/${invoice.documentId ?? invoice.id}`,
  }));

  const fromReceipts: SaleLogEntry[] = store.receipts.map((receipt) => ({
    key: `receipt-${receipt.documentId ?? receipt.id}`,
    soldOn: receipt.paymentDate,
    item: receipt.scooterType,
    customerName: receipt.customerName,
    amount: receipt.total,
    notes: receipt.scooterCondition,
    source: "receipt",
    href: `/receipts/${receipt.documentId ?? receipt.id}`,
  }));

  const fromSales: SaleLogEntry[] = store.sales.map((sale) => ({
    key: `sale-${sale.documentId}`,
    soldOn: sale.soldOn,
    item: sale.item,
    customerName: sale.customerName,
    amount: sale.amount,
    notes: sale.notes,
    source: "manual",
    canDelete: true,
  }));

  return [...fromSales, ...fromInvoices, ...fromReceipts].sort((a, b) => {
    if (a.soldOn === b.soldOn) return b.key.localeCompare(a.key);
    return a.soldOn < b.soldOn ? 1 : -1;
  });
}
