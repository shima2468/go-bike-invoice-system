import Link from "next/link";
import { ReceiptListActions } from "@/components/receipt/receipt-list-actions";
import { formatCurrency, formatDate } from "@/lib/invoice-formatting";
import { listReceipts } from "@/lib/db/receipts";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ReceiptsPage() {
  let receipts: Awaited<ReturnType<typeof listReceipts>> = [];
  let error: string | null = null;

  try {
    receipts = await listReceipts();
  } catch (err) {
    error = err instanceof Error ? err.message : "Bonnen ophalen mislukt.";
  }

  return (
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-widest text-brand-primary">
              Overzicht
            </p>
            <h1 className="mt-1 text-[28px] font-bold text-foreground sm:text-[34px]">
              Opgeslagen bonnen
            </h1>
            <p className="mt-2 text-[15px] text-muted">
              Alle betalingsbewijzen. Bekijken, bewerken of verwijderen.
            </p>
          </div>
          <Link
            href="/receipts/new"
            className="inline-flex min-h-10 items-center justify-center rounded-full bg-brand-primary px-5 text-[14px] font-semibold text-brand-primary-foreground shadow-sm hover:bg-brand-primary-hover"
          >
            Nieuwe bon
          </Link>
        </div>

        {error ? (
          <div className="rounded-2xl bg-red-50 px-4 py-3 text-[15px] text-red-600">
            {error}
          </div>
        ) : receipts.length === 0 ? (
          <div className="rounded-2xl bg-surface px-6 py-12 text-center shadow-ios">
            <p className="text-[15px] text-muted">Nog geen bonnen opgeslagen.</p>
            <Link
              href="/receipts/new"
              className="mt-4 inline-block text-[15px] font-semibold text-brand-primary hover:underline"
            >
              Eerste bon aanmaken
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-surface shadow-ios">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-[14px]">
                <thead className="border-b border-separator bg-surface-secondary/80">
                  <tr>
                    <th className="px-5 py-3 font-semibold text-label">Bon</th>
                    <th className="px-5 py-3 font-semibold text-label">Klant</th>
                    <th className="px-5 py-3 font-semibold text-label">Datum</th>
                    <th className="px-5 py-3 font-semibold text-label">Betaalwijze</th>
                    <th className="px-5 py-3 text-right font-semibold text-label">
                      Totaal
                    </th>
                    <th className="px-5 py-3 text-right font-semibold text-label">
                      Acties
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-separator">
                  {receipts.map((receipt) => (
                    <tr
                      key={receipt.documentId ?? receipt.id}
                      className="hover:bg-surface-secondary/40"
                    >
                      <td className="px-5 py-4">
                        <Link
                          href={`/receipts/${receipt.documentId ?? receipt.id}`}
                          className="font-semibold text-brand-primary hover:underline"
                        >
                          {receipt.receiptNumber}
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-foreground">
                        {receipt.customerName}
                      </td>
                      <td className="px-5 py-4 text-muted">
                        {formatDate(receipt.paymentDate)}
                      </td>
                      <td className="px-5 py-4 text-muted">
                        {receipt.paymentMethod}
                      </td>
                      <td className="px-5 py-4 text-right font-semibold tabular-nums text-foreground">
                        {formatCurrency(receipt.total)}
                      </td>
                      <td className="px-5 py-4">
                        <ReceiptListActions receipt={receipt} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
  );
}
