"use client";

import { formatCurrency } from "@/lib/invoice-formatting";

export function InvoiceSummary({
  priceExVat,
  vatAmount,
  total,
}: {
  priceExVat: number;
  vatAmount: number;
  total: number;
}) {
  return (
    <section className="space-y-2 lg:sticky lg:top-24 lg:self-start">
      <h2 className="px-4 text-[13px] font-semibold uppercase tracking-wide text-label sm:px-1">
        Overzicht
      </h2>
      <div className="overflow-hidden rounded-2xl bg-surface shadow-ios-lg">
        <dl className="divide-y divide-separator">
          <div className="flex items-center justify-between px-5 py-4">
            <dt className="text-[15px] text-muted">Prijs excl. btw</dt>
            <dd className="text-[17px] font-medium tabular-nums text-foreground">
              {formatCurrency(priceExVat)}
            </dd>
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <dt className="text-[15px] text-muted">BTW</dt>
            <dd className="text-[17px] font-medium tabular-nums text-foreground">
              {formatCurrency(vatAmount)}
            </dd>
          </div>
        </dl>
        <div className="bg-brand-accent/50 px-5 py-5">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-[15px] font-semibold text-foreground">
              Totaal incl. btw
            </dt>
            <dd className="text-2xl font-bold tabular-nums tracking-tight text-brand-primary">
              {formatCurrency(total)}
            </dd>
          </div>
        </div>
      </div>
    </section>
  );
}
