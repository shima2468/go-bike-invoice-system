import { addDays, format } from "date-fns";
import { nl } from "date-fns/locale";

const currencyFormatter = new Intl.NumberFormat("nl-NL", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat("nl-NL", {
  style: "percent",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

export function formatPercent(rate: number): string {
  return percentFormatter.format(rate / 100);
}

export function formatDate(date: Date | string): string {
  const parsed = typeof date === "string" ? new Date(date) : date;
  return format(parsed, "d MMMM yyyy", { locale: nl });
}

export function formatInvoiceNumber(sequence: number): string {
  return `INV-${String(sequence).padStart(6, "0")}`;
}

export function formatReceiptNumber(sequence: number): string {
  return `BON-${String(sequence).padStart(6, "0")}`;
}

export function formatDueDate(invoiceDate: string, days = 14): string {
  const parsed = new Date(invoiceDate);
  return format(addDays(parsed, days), "d MMMM yyyy", { locale: nl });
}

export function buildScooterDescription(params: {
  scooterCondition: string;
  warrantyDuration: string;
}): string {
  return `Staat: ${params.scooterCondition} · Garantie: ${params.warrantyDuration}`;
}

export function todayIsoDate(): string {
  return format(new Date(), "yyyy-MM-dd");
}
