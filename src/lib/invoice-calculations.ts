import type { InvoiceCalculations } from "@/types/invoice";

const MONEY_SCALE = 100;

function toCents(value: number): number {
  return Math.round(value * MONEY_SCALE);
}

function fromCents(cents: number): number {
  return cents / MONEY_SCALE;
}

export function calculateInvoiceTotals(
  priceExVat: number,
  vatRate: number
): InvoiceCalculations {
  const priceCents = toCents(priceExVat);
  const vatCents = Math.round((priceCents * vatRate) / 100);
  const totalCents = priceCents + vatCents;

  return {
    vatAmount: fromCents(vatCents),
    total: fromCents(totalCents),
  };
}

export function verifyInvoiceCalculations(
  priceExVat: number,
  vatRate: number,
  vatAmount: number,
  total: number
): boolean {
  const expected = calculateInvoiceTotals(priceExVat, vatRate);
  return (
    toCents(expected.vatAmount) === toCents(vatAmount) &&
    toCents(expected.total) === toCents(total)
  );
}
