import Link from "next/link";
import { AppFooter } from "@/components/layout/app-footer";
import { AppHeader } from "@/components/layout/app-header";
import { SaleDeleteButton } from "@/components/sale/sale-delete-button";
import { SaleLogForm } from "@/components/sale/sale-log-form";
import { listSaleLog } from "@/lib/db/sales";
import { formatCurrency, formatDate, todayIsoDate } from "@/lib/invoice-formatting";
import type { SaleLogEntry } from "@/types/sale";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SOURCE_LABELS = {
  manual: "Notitie",
  invoice: "Factuur",
  receipt: "Bon",
} as const;

function groupByDate(entries: SaleLogEntry[]) {
  const groups = new Map<string, SaleLogEntry[]>();
  for (const entry of entries) {
    const list = groups.get(entry.soldOn) ?? [];
    list.push(entry);
    groups.set(entry.soldOn, list);
  }
  return [...groups.entries()];
}

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const selectedDate = date || todayIsoDate();
  const today = todayIsoDate();

  let entries: SaleLogEntry[] = [];
  let error: string | null = null;

  try {
    entries = await listSaleLog();
  } catch (err) {
    error = err instanceof Error ? err.message : "Verkoop ophalen mislukt.";
  }

  const filtered = entries.filter((entry) => entry.soldOn === selectedDate);
  const dayTotal = filtered.reduce((sum, entry) => sum + entry.amount, 0);
  const grouped = groupByDate(entries);

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-[13px] font-semibold uppercase tracking-widest text-brand-primary">
            Verkoop
          </p>
          <h1 className="mt-1 text-[28px] font-bold text-foreground sm:text-[34px]">
            Wat is er verkocht
          </h1>
          <p className="mt-2 max-w-2xl text-[15px] text-muted">
            Noteer wat u verkocht heeft op welke datum. Facturen en bonnen
            verschijnen hier automatisch.
          </p>
        </div>

        <div className="mb-10">
          <SaleLogForm />
        </div>

        <form className="mb-6 flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="date" className="mb-1 block text-[13px] font-medium text-label">
              Toon datum
            </label>
            <input
              id="date"
              name="date"
              type="date"
              defaultValue={selectedDate}
              className="min-h-11 rounded-xl bg-surface-secondary px-3.5 text-[16px] text-foreground"
            />
          </div>
          <button
            type="submit"
            className="inline-flex min-h-11 items-center rounded-full bg-brand-primary px-5 text-[14px] font-semibold text-brand-primary-foreground"
          >
            Filteren
          </button>
          {selectedDate !== today && (
            <Link
              href="/sales"
              className="inline-flex min-h-11 items-center text-[14px] font-semibold text-brand-primary"
            >
              Vandaag
            </Link>
          )}
        </form>

        {error ? (
          <div className="rounded-2xl bg-red-50 px-4 py-3 text-[15px] text-red-600">
            {error}
          </div>
        ) : (
          <>
            <div className="mb-4 rounded-2xl bg-surface px-5 py-4 shadow-ios">
              <p className="text-[13px] text-muted">
                {selectedDate === today ? "Vandaag" : formatDate(selectedDate)}
              </p>
              <p className="mt-1 text-[22px] font-bold text-foreground">
                {filtered.length} verkoop
                {filtered.length === 1 ? "" : "en"} · {formatCurrency(dayTotal)}
              </p>
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-2xl bg-surface px-6 py-10 text-center shadow-ios">
                <p className="text-[15px] text-muted">
                  Nog niets opgeslagen voor deze datum.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl bg-surface shadow-ios">
                <ul className="divide-y divide-separator">
                  {filtered.map((entry) => (
                    <li
                      key={entry.key}
                      className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-semibold text-foreground">{entry.item}</p>
                        <p className="text-[13px] text-muted">
                          {SOURCE_LABELS[entry.source]}
                          {entry.customerName ? ` · ${entry.customerName}` : ""}
                          {entry.notes ? ` · ${entry.notes}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-semibold tabular-nums">
                          {formatCurrency(entry.amount)}
                        </p>
                        {entry.href ? (
                          <Link
                            href={entry.href}
                            className="text-[13px] font-semibold text-brand-primary hover:underline"
                          >
                            Openen
                          </Link>
                        ) : null}
                        {entry.canDelete ? (
                          <SaleDeleteButton saleId={entry.key.replace("sale-", "")} />
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {grouped.length > 1 && (
              <div className="mt-10">
                <h2 className="mb-3 text-[16px] font-semibold text-foreground">
                  Andere dagen
                </h2>
                <ul className="space-y-2">
                  {grouped
                    .filter(([day]) => day !== selectedDate)
                    .slice(0, 14)
                    .map(([day, dayEntries]) => {
                      const total = dayEntries.reduce(
                        (sum, entry) => sum + entry.amount,
                        0
                      );
                      return (
                        <li key={day}>
                          <Link
                            href={`/sales?date=${day}`}
                            className="flex items-center justify-between rounded-2xl bg-surface px-5 py-3 shadow-ios hover:bg-surface-secondary"
                          >
                            <span className="font-medium">{formatDate(day)}</span>
                            <span className="text-[14px] text-muted">
                              {dayEntries.length} · {formatCurrency(total)}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                </ul>
              </div>
            )}
          </>
        )}
      </main>
      <AppFooter />
    </div>
  );
}
