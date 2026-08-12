import Link from "next/link";
import { AppFooter } from "@/components/layout/app-footer";
import { AppHeader } from "@/components/layout/app-header";
import { InvoiceListActions } from "@/components/invoice/invoice-list-actions";
import { formatCurrency, formatDate } from "@/lib/invoice-formatting";
import { listInvoices } from "@/lib/db/invoices";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function InvoicesPage() {
  let invoices: Awaited<ReturnType<typeof listInvoices>> = [];
  let error: string | null = null;

  try {
    invoices = await listInvoices();
  } catch (err) {
    error =
      err instanceof Error ? err.message : "Facturen ophalen mislukt.";
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-widest text-brand-primary">
              Overzicht
            </p>
            <h1 className="mt-1 text-[28px] font-bold text-foreground sm:text-[34px]">
              Opgeslagen facturen
            </h1>
            <p className="mt-2 text-[15px] text-muted">
              Alle opgeslagen facturen. Bekijken, bewerken of verwijderen.
            </p>
          </div>
          <Link
            href="/invoices/new"
            className="inline-flex min-h-10 items-center justify-center rounded-full bg-brand-primary px-5 text-[14px] font-semibold text-brand-primary-foreground shadow-sm hover:bg-brand-primary-hover"
          >
            Nieuwe factuur
          </Link>
        </div>

        {error ? (
          <div className="rounded-2xl bg-red-50 px-4 py-3 text-[15px] text-red-600">
            {error}
          </div>
        ) : invoices.length === 0 ? (
          <div className="rounded-2xl bg-surface px-6 py-12 text-center shadow-ios">
            <p className="text-[15px] text-muted">Nog geen facturen opgeslagen.</p>
            <Link
              href="/invoices/new"
              className="mt-4 inline-block text-[15px] font-semibold text-brand-primary hover:underline"
            >
              Eerste factuur aanmaken
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-surface shadow-ios">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-[14px]">
                <thead className="border-b border-separator bg-surface-secondary/80">
                  <tr>
                    <th className="px-5 py-3 font-semibold text-label">Factuur</th>
                    <th className="px-5 py-3 font-semibold text-label">Klant</th>
                    <th className="px-5 py-3 font-semibold text-label">Datum</th>
                    <th className="px-5 py-3 font-semibold text-label">Scooter</th>
                    <th className="px-5 py-3 text-right font-semibold text-label">
                      Totaal
                    </th>
                    <th className="px-5 py-3 text-right font-semibold text-label">
                      Acties
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-separator">
                  {invoices.map((invoice) => (
                    <tr
                      key={invoice.documentId ?? invoice.id}
                      className="hover:bg-surface-secondary/40"
                    >
                      <td className="px-5 py-4">
                        <Link
                          href={`/invoices/${invoice.documentId ?? invoice.id}`}
                          className="font-semibold text-brand-primary hover:underline"
                        >
                          {invoice.invoiceNumber}
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-foreground">
                        {invoice.customerName}
                      </td>
                      <td className="px-5 py-4 text-muted">
                        {formatDate(invoice.invoiceDate)}
                      </td>
                      <td className="px-5 py-4 text-muted">
                        {invoice.scooterType}
                      </td>
                      <td className="px-5 py-4 text-right font-semibold tabular-nums text-foreground">
                        {formatCurrency(invoice.total)}
                      </td>
                      <td className="px-5 py-4">
                        <InvoiceListActions invoice={invoice} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
      <AppFooter />
    </div>
  );
}
