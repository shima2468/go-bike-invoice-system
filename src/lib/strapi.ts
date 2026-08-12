import type { Customer, Invoice } from "@/types/invoice";
import { calculateInvoiceTotals } from "@/lib/invoice-calculations";
import { formatInvoiceNumber } from "@/lib/invoice-formatting";

const STRAPI_URL = process.env.STRAPI_URL ?? "http://localhost:1337";
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN ?? "";

interface StrapiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      total: number;
    };
  };
}

type StrapiEntity<T> = T & {
  id: number;
  documentId?: string;
  attributes?: T;
};

type StrapiCustomerRecord = Omit<Customer, "id" | "documentId">;
type StrapiInvoiceRecord = Omit<
  Invoice,
  "id" | "documentId" | "customerId" | "customerDocumentId"
> & {
  customer?: { data: StrapiEntity<StrapiCustomerRecord> | null };
};

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (STRAPI_API_TOKEN) {
    headers.Authorization = `Bearer ${STRAPI_API_TOKEN}`;
  }

  return headers;
}

async function strapiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${STRAPI_URL}/api${path}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Strapi request failed (${response.status}): ${errorBody || response.statusText}`
    );
  }

  return response.json() as Promise<T>;
}

function unwrapEntity<T extends Record<string, unknown>>(
  entity: StrapiEntity<T>
): T & { id: number; documentId?: string } {
  if (entity.attributes) {
    return {
      id: entity.id,
      documentId: entity.documentId,
      ...entity.attributes,
    };
  }

  const { id, documentId, ...rest } = entity;
  return {
    id,
    documentId,
    ...(rest as T),
  };
}

function toNumber(value: unknown): number {
  return typeof value === "number" ? value : Number(value);
}

function mapCustomer(entity: StrapiEntity<StrapiCustomerRecord>): Customer {
  const customer = unwrapEntity(entity);
  return {
    id: customer.id,
    documentId: customer.documentId,
    customerName: String(customer.customerName),
    identificationNumber: String(customer.identificationNumber),
    email: String(customer.email),
    phone: String(customer.phone),
  };
}

function extractCustomerFromInvoice(
  entity: StrapiEntity<StrapiInvoiceRecord>,
  invoice: StrapiInvoiceRecord & { id: number; documentId?: string }
): Customer | null {
  const rawCustomer = entity.customer ?? invoice.customer;

  if (!rawCustomer) {
    return null;
  }

  if ("data" in rawCustomer && rawCustomer.data) {
    return mapCustomer(rawCustomer.data);
  }

  if ("customerName" in rawCustomer) {
    return mapCustomer(rawCustomer as StrapiEntity<StrapiCustomerRecord>);
  }

  return null;
}

function mapInvoiceEntity(entity: StrapiEntity<StrapiInvoiceRecord>): Invoice {
  const invoice = unwrapEntity(entity);
  const customer = extractCustomerFromInvoice(entity, invoice);

  return {
    id: invoice.id,
    documentId: invoice.documentId,
    invoiceNumber: String(invoice.invoiceNumber),
    invoiceDate: String(invoice.invoiceDate),
    customerName: customer?.customerName ?? "",
    identificationNumber: customer?.identificationNumber ?? "",
    email: customer?.email ?? "",
    phone: customer?.phone ?? "",
    scooterType: String(invoice.scooterType),
    warrantyDuration: String(invoice.warrantyDuration),
    scooterCondition: String(invoice.scooterCondition),
    priceExVat: toNumber(invoice.priceExVat),
    vatRate: toNumber(invoice.vatRate),
    vatAmount: toNumber(invoice.vatAmount),
    total: toNumber(invoice.total),
    customerId: customer?.id,
    customerDocumentId: customer?.documentId,
  };
}

export function isStrapiConfigured(): boolean {
  return Boolean(STRAPI_URL && STRAPI_API_TOKEN);
}

export async function findCustomerByEmail(
  email: string
): Promise<Customer | null> {
  const response = await strapiFetch<
    StrapiResponse<StrapiEntity<StrapiCustomerRecord>[]>
  >(
    `/customers?filters[email][$eq]=${encodeURIComponent(email)}&pagination[limit]=1`
  );

  const entity = response.data[0];
  if (!entity) return null;

  return mapCustomer(entity);
}

export async function createCustomer(
  customer: Omit<Customer, "id" | "documentId">
): Promise<Customer> {
  const response = await strapiFetch<
    StrapiResponse<StrapiEntity<StrapiCustomerRecord>>
  >("/customers", {
    method: "POST",
    body: JSON.stringify({ data: customer }),
  });

  return mapCustomer(response.data);
}

export async function upsertCustomer(
  customer: Omit<Customer, "id" | "documentId">
): Promise<Customer> {
  const existing = await findCustomerByEmail(customer.email);
  if (existing) {
    return existing;
  }
  return createCustomer(customer);
}

export async function getNextInvoiceNumber(): Promise<string> {
  const response = await strapiFetch<
    StrapiResponse<StrapiEntity<{ invoiceNumber: string }>[]>
  >("/invoices?sort=createdAt:desc&pagination[limit]=1&fields[0]=invoiceNumber");

  const latest = response.data[0];
  if (!latest) {
    return formatInvoiceNumber(1);
  }

  const latestNumber = unwrapEntity(latest).invoiceNumber;
  const match = latestNumber.match(/INV-(\d+)/);
  const sequence = match ? parseInt(match[1], 10) + 1 : 1;
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

  const customerRef =
    data.customerDocumentId ??
    (data.customerId ? String(data.customerId) : undefined);

  if (!customerRef) {
    throw new Error("Customer reference is required to create an invoice.");
  }

  const payload = {
    invoiceNumber: data.invoiceNumber,
    invoiceDate: data.invoiceDate,
    scooterType: data.scooterType,
    warrantyDuration: data.warrantyDuration,
    scooterCondition: data.scooterCondition,
    priceExVat: data.priceExVat,
    vatRate: data.vatRate,
    vatAmount,
    total,
    customer: {
      connect: [customerRef],
    },
  };

  const response = await strapiFetch<
    StrapiResponse<StrapiEntity<StrapiInvoiceRecord>>
  >("/invoices", {
    method: "POST",
    body: JSON.stringify({ data: payload }),
  });

  const created = unwrapEntity(response.data);
  return {
    id: created.id,
    documentId: created.documentId,
    invoiceNumber: String(created.invoiceNumber),
    invoiceDate: String(created.invoiceDate),
    customerName: data.customerName,
    identificationNumber: data.identificationNumber,
    email: data.email,
    phone: data.phone,
    scooterType: String(created.scooterType),
    warrantyDuration: String(created.warrantyDuration),
    scooterCondition: String(created.scooterCondition),
    priceExVat: toNumber(created.priceExVat),
    vatRate: toNumber(created.vatRate),
    vatAmount: toNumber(created.vatAmount),
    total: toNumber(created.total),
    customerId: data.customerId,
    customerDocumentId: data.customerDocumentId,
  };
}

export async function listInvoices(): Promise<Invoice[]> {
  const response = await strapiFetch<
    StrapiResponse<StrapiEntity<StrapiInvoiceRecord>[]>
  >(
    "/invoices?populate=customer&sort=createdAt:desc&pagination[pageSize]=100"
  );

  return response.data.map((entity) => mapInvoiceEntity(entity));
}

export async function getInvoiceById(id: string): Promise<Invoice | null> {
  const response = await strapiFetch<
    StrapiResponse<StrapiEntity<StrapiInvoiceRecord>>
  >(`/invoices/${id}?populate=customer`);

  const entity = response.data;
  if (!entity) return null;

  return mapInvoiceEntity(entity);
}
