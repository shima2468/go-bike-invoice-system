import { CompanyLogo } from "@/components/layout/company-logo";
import { companyConfig, getCompanyAddressLines } from "@/lib/company";
import {
  buildScooterDescription,
  formatCurrency,
  formatDate,
  formatPercent,
} from "@/lib/invoice-formatting";
import type { ReceiptFormValues } from "@/schemas/receipt.schema";

function InfoColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-white/10 p-4 last:border-b-0 md:border-b-0 md:border-r md:border-white/10 md:p-5 md:last:border-r-0">
      <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wide text-zinc-500">
        {title}
      </h3>
      <div className="space-y-1 text-[13px] leading-relaxed text-zinc-200">
        {children}
      </div>
    </div>
  );
}

export function ReceiptPreview({
  data,
  receiptNumber,
  vatAmount,
  total,
}: {
  data: ReceiptFormValues;
  receiptNumber: string;
  vatAmount: number;
  total: number;
}) {
  const description = buildScooterDescription({
    scooterCondition: data.scooterCondition || "—",
    warrantyDuration: data.warrantyDuration || "—",
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111111]">
      <div className="flex flex-col gap-5 border-b border-white/10 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div>
          {companyConfig.logoExists && (
            <div className="mb-3 inline-flex rounded-xl bg-black p-2">
              <CompanyLogo className="h-14 sm:h-16" />
            </div>
          )}
          <p className="text-[14px] font-bold text-white">{companyConfig.name}</p>
          {getCompanyAddressLines().map((line) => (
            <p key={line} className="text-[12px] text-zinc-400">
              {line}
            </p>
          ))}
          {companyConfig.phone && (
            <p className="mt-1 text-[12px] text-zinc-400">{companyConfig.phone}</p>
          )}
        </div>

        <div className="sm:text-right">
          <p className="text-[13px] font-medium text-brand-primary">Bon</p>
          <h2 className="text-[26px] font-bold tracking-tight text-white sm:text-[30px]">
            {receiptNumber}
          </h2>
        </div>
      </div>

      <div className="grid border-b border-white/10 md:grid-cols-3">
        <InfoColumn title="Betalingsgegevens">
          <p>
            <span className="text-zinc-500">Betaaldatum: </span>
            {data.paymentDate ? formatDate(data.paymentDate) : "—"}
          </p>
          <p>
            <span className="text-zinc-500">Betaalwijze: </span>
            {data.paymentMethod || "—"}
          </p>
          <p className="pt-1 font-semibold text-white">
            <span className="font-normal text-zinc-500">Betaald: </span>
            <span className="text-brand-primary">{formatCurrency(total)}</span>
          </p>
        </InfoColumn>

        <InfoColumn title="Leverancier">
          <p className="font-semibold text-white">{companyConfig.name}</p>
          {getCompanyAddressLines().map((line) => (
            <p key={line}>{line}</p>
          ))}
          {companyConfig.phone && <p>Tel: {companyConfig.phone}</p>}
        </InfoColumn>

        <InfoColumn title="Ontvangen van">
          <p className="font-semibold text-white">{data.customerName || "—"}</p>
          <p>ID: {data.identificationNumber || "—"}</p>
          <p>{data.email || "—"}</p>
          <p>Tel: {data.phone || "—"}</p>
        </InfoColumn>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="border-r border-white/10 px-4 py-3 text-left font-bold text-zinc-300">
                Product
              </th>
              <th className="border-r border-white/10 px-4 py-3 text-left font-bold text-zinc-300">
                Omschrijving
              </th>
              <th className="w-20 border-r border-white/10 px-4 py-3 text-center font-bold text-zinc-300">
                Aantal
              </th>
              <th className="w-28 border-r border-white/10 px-4 py-3 text-right font-bold text-zinc-300">
                Prijs
              </th>
              <th className="w-28 px-4 py-3 text-right font-bold text-zinc-300">Bedrag</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-white/10">
              <td className="border-r border-white/10 px-4 py-4 align-top font-medium text-white">
                {data.scooterType || "Scooter"}
              </td>
              <td className="border-r border-white/10 px-4 py-4 align-top text-zinc-400">
                {description}
              </td>
              <td className="border-r border-white/10 px-4 py-4 text-center align-top text-zinc-300">
                1
              </td>
              <td className="border-r border-white/10 px-4 py-4 text-right align-top tabular-nums text-zinc-300">
                {formatCurrency(data.priceExVat || 0)}
              </td>
              <td className="px-4 py-4 text-right align-top font-medium tabular-nums text-white">
                {formatCurrency(data.priceExVat || 0)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex justify-end border-t border-white/10 p-5 sm:p-6">
        <dl className="w-full max-w-xs space-y-2 text-[13px]">
          <div className="flex justify-between gap-6">
            <dt className="text-zinc-500">Subtotaal excl. btw</dt>
            <dd className="font-medium tabular-nums text-white">
              {formatCurrency(data.priceExVat || 0)}
            </dd>
          </div>
          <div className="flex justify-between gap-6">
            <dt className="text-zinc-500">BTW ({formatPercent(data.vatRate || 0)})</dt>
            <dd className="font-medium tabular-nums text-white">
              {formatCurrency(vatAmount)}
            </dd>
          </div>
          <div className="flex justify-between gap-6 border-t border-white/10 pt-2">
            <dt className="font-semibold text-white">Totaal incl. btw</dt>
            <dd className="font-semibold tabular-nums text-white">
              {formatCurrency(total)}
            </dd>
          </div>
          <div className="flex justify-between gap-6 pt-1">
            <dt className="text-[15px] font-bold text-white">Betaald</dt>
            <dd className="text-[15px] font-bold tabular-nums text-brand-primary">
              {formatCurrency(total)}
            </dd>
          </div>
        </dl>
      </div>

      <p className="border-t border-white/10 px-5 py-4 text-center text-[13px] text-zinc-500 sm:px-6">
        Bedankt voor uw betaling.
      </p>
    </div>
  );
}
