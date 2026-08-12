import { randomUUID } from "crypto";
import { calculateInvoiceTotals } from "@/lib/invoice-calculations";
import { formatInvoiceNumber } from "@/lib/invoice-formatting";
import { readStore, writeStore } from "@/lib/db/store";
import type { Customer, Invoice } from "@/types/invoice";

export function isDatabaseConfigured(): boolean {
  return true;
}

export function isStrapiConfigured(): boolean {
  return isDatabaseConfigured();
}

export async function findCustomerByEmail(
  email: string
): Promise<Customer | null> {
  const store = await readStore();
  return store.customers.find((customer) => customer.email === email) ?? null;
}

export async function createCustomer(
  customer: Omit<Customer, "id" | "documentId">
): Promise<Customer> {
  const store = await readStore();
  const created: Customer = {
    id: store.nextCustomerId,
    documentId: randomUUID(),
    ...customer,
  };
  store.customers.push(created);
  store.nextCustomerId += 1;
  await writeStore(store);
  return created;
}

export async function upsertCustomer(
  customer: Omit<Customer, "id" | "documentId">
): Promise<Customer> {
  const store = await readStore();
  const index = store.customers.findIndex((row) => row.email === customer.email);

  if (index >= 0) {
    store.customers[index] = {
      ...store.customers[index],
      customerName: customer.customerName,
      identificationNumber: customer.identificationNumber,
      phone: customer.phone,
    };
    await writeStore(store);
    return store.customers[index];
  }

  return createCustomer(customer);
}

export async function getNextInvoiceNumber(): Promise<string> {
  const store = await readStore();
  if (store.invoices.length === 0) {
    return formatInvoiceNumber(1);
  }

  const latest = [...store.invoices].sort((a, b) => (b.id ?? 0) - (a.id ?? 0))[0];
  const match = latest.invoiceNumber.match(/INV-(\d+)/);
  const sequence = match ? parseInt(match[1], 10) + 1 : store.invoices.length + 1;
  return formatInvoiceNumber(sequence);
}

export async function createInvoice(
  data: Omit<Invoice, "id" | "documentId" | "vatAmount" | "total"> & {
    customerId?: number;
    customerDocumentId?: string;
  }
): Promise<Invoice> {
  const { vatAmount, total } = calculateInvoiceTotals(
    data.priceExVat,
    data.vatRate
  );

  if (!data.customerId) {
    throw new Error("Customer reference is required to create an invoice.");
  }

  const store = await readStore();
  const customer =
    store.customers.find((row) => row.id === data.customerId) ?? null;

  const created: Invoice = {
    id: store.nextInvoiceId,
    documentId: randomUUID(),
    invoiceNumber: data.invoiceNumber,
    invoiceDate: data.invoiceDate,
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

  store.invoices.unshift(created);
  store.nextInvoiceId += 1;
  await writeStore(store);
  return created;
}

export async function listInvoices(): Promise<Invoice[]> {
  const store = await readStore();
  return [...store.invoices].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
}

export async function getInvoiceById(id: string): Promise<Invoice | null> {
  const store = await readStore();
  const numericId = Number(id);

  return (
    store.invoices.find((invoice) => {
      if (invoice.documentId === id) return true;
      if (Number.isFinite(numericId) && invoice.id === numericId) return true;
      return false;
    }) ?? null
  );
}

function matchesInvoiceId(invoice: Invoice, id: string): boolean {
  if (invoice.documentId === id) return true;
  const numericId = Number(id);
  return Number.isFinite(numericId) && invoice.id === numericId;
}

export async function updateInvoice(
  id: string,
  data: Omit<Invoice, "id" | "documentId" | "vatAmount" | "total" | "invoiceNumber"> & {
    invoiceNumber?: string;
  }
): Promise<Invoice | null> {
  const store = await readStore();
  const index = store.invoices.findIndex((invoice) =>
    matchesInvoiceId(invoice, id)
  );
  if (index < 0) return null;

  const existing = store.invoices[index];
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

  const updated: Invoice = {
    ...existing,
    invoiceNumber: data.invoiceNumber ?? existing.invoiceNumber,
    invoiceDate: data.invoiceDate,
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

  store.invoices[index] = updated;
  await writeStore(store);
  return updated;
}

export async function deleteInvoice(id: string): Promise<boolean> {
  const store = await readStore();
  const before = store.invoices.length;
  store.invoices = store.invoices.filter(
    (invoice) => !matchesInvoiceId(invoice, id)
  );

  if (store.invoices.length === before) {
    return false;
  }

  await writeStore(store);
  return true;
}
