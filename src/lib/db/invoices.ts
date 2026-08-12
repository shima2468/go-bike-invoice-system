import { desc, eq, or } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db, ensureSchema } from "@/lib/db/client";
import { customers, invoices } from "@/lib/db/schema";
import { calculateInvoiceTotals } from "@/lib/invoice-calculations";
import { formatInvoiceNumber } from "@/lib/invoice-formatting";
import type { Customer, Invoice } from "@/types/invoice";

function mapCustomer(row: typeof customers.$inferSelect): Customer {
  return {
    id: row.id,
    documentId: row.documentId,
    customerName: row.customerName,
    identificationNumber: row.identificationNumber,
    email: row.email,
    phone: row.phone,
  };
}

function mapInvoice(
  row: typeof invoices.$inferSelect,
  customer: typeof customers.$inferSelect | null
): Invoice {
  return {
    id: row.id,
    documentId: row.documentId,
    invoiceNumber: row.invoiceNumber,
    invoiceDate: row.invoiceDate,
    customerName: customer?.customerName ?? "",
    identificationNumber: customer?.identificationNumber ?? "",
    email: customer?.email ?? "",
    phone: customer?.phone ?? "",
    scooterType: row.scooterType,
    warrantyDuration: row.warrantyDuration,
    scooterCondition: row.scooterCondition,
    priceExVat: row.priceExVat,
    vatRate: row.vatRate,
    vatAmount: row.vatAmount,
    total: row.total,
    customerId: row.customerId,
    customerDocumentId: customer?.documentId,
  };
}

/** Always available — local SQLite or Turso. */
export function isDatabaseConfigured(): boolean {
  return true;
}

/** @deprecated Use isDatabaseConfigured */
export function isStrapiConfigured(): boolean {
  return isDatabaseConfigured();
}

export async function findCustomerByEmail(
  email: string
): Promise<Customer | null> {
  await ensureSchema();
  const row = await db.query.customers.findFirst({
    where: eq(customers.email, email),
  });
  return row ? mapCustomer(row) : null;
}

export async function createCustomer(
  customer: Omit<Customer, "id" | "documentId">
): Promise<Customer> {
  await ensureSchema();
  const documentId = randomUUID();
  const createdAt = new Date().toISOString();

  const result = await db
    .insert(customers)
    .values({
      documentId,
      customerName: customer.customerName,
      identificationNumber: customer.identificationNumber,
      email: customer.email,
      phone: customer.phone,
      createdAt,
    })
    .returning();

  return mapCustomer(result[0]);
}

export async function upsertCustomer(
  customer: Omit<Customer, "id" | "documentId">
): Promise<Customer> {
  const existing = await findCustomerByEmail(customer.email);
  if (existing?.id != null) {
    await ensureSchema();
    await db
      .update(customers)
      .set({
        customerName: customer.customerName,
        identificationNumber: customer.identificationNumber,
        phone: customer.phone,
      })
      .where(eq(customers.id, existing.id));

    const refreshed = await findCustomerByEmail(customer.email);
    return refreshed ?? {
      ...existing,
      customerName: customer.customerName,
      identificationNumber: customer.identificationNumber,
      phone: customer.phone,
    };
  }
  return createCustomer(customer);
}

export async function getNextInvoiceNumber(): Promise<string> {
  await ensureSchema();
  const latest = await db.query.invoices.findFirst({
    orderBy: [desc(invoices.id)],
  });

  if (!latest) {
    return formatInvoiceNumber(1);
  }

  const match = latest.invoiceNumber.match(/INV-(\d+)/);
  const sequence = match ? parseInt(match[1], 10) + 1 : 1;
  return formatInvoiceNumber(sequence);
}

export async function createInvoice(
  data: Omit<Invoice, "id" | "documentId" | "vatAmount" | "total"> & {
    customerId?: number;
    customerDocumentId?: string;
  }
): Promise<Invoice> {
  await ensureSchema();

  const { vatAmount, total } = calculateInvoiceTotals(
    data.priceExVat,
    data.vatRate
  );

  if (!data.customerId) {
    throw new Error("Customer reference is required to create an invoice.");
  }

  const documentId = randomUUID();
  const createdAt = new Date().toISOString();

  const result = await db
    .insert(invoices)
    .values({
      documentId,
      invoiceNumber: data.invoiceNumber,
      invoiceDate: data.invoiceDate,
      scooterType: data.scooterType,
      warrantyDuration: data.warrantyDuration,
      scooterCondition: data.scooterCondition,
      priceExVat: data.priceExVat,
      vatRate: data.vatRate,
      vatAmount,
      total,
      customerId: data.customerId,
      createdAt,
    })
    .returning();

  const customer = await db.query.customers.findFirst({
    where: eq(customers.id, data.customerId),
  });

  return mapInvoice(result[0], customer ?? null);
}

export async function listInvoices(): Promise<Invoice[]> {
  await ensureSchema();

  const rows = await db
    .select({
      invoice: invoices,
      customer: customers,
    })
    .from(invoices)
    .leftJoin(customers, eq(invoices.customerId, customers.id))
    .orderBy(desc(invoices.id));

  return rows.map(({ invoice, customer }) => mapInvoice(invoice, customer));
}

export async function getInvoiceById(id: string): Promise<Invoice | null> {
  await ensureSchema();

  const numericId = Number(id);
  const whereClause =
    Number.isFinite(numericId) && String(numericId) === id
      ? or(eq(invoices.documentId, id), eq(invoices.id, numericId))
      : eq(invoices.documentId, id);

  const row = await db
    .select({
      invoice: invoices,
      customer: customers,
    })
    .from(invoices)
    .leftJoin(customers, eq(invoices.customerId, customers.id))
    .where(whereClause)
    .limit(1);

  if (!row[0]) return null;
  return mapInvoice(row[0].invoice, row[0].customer);
}
