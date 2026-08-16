import Link from "next/link";
import { notFound } from "next/navigation";
import { InvoiceDetailActions } from "@/components/invoice/invoice-detail-actions";
import { InvoicePreview } from "@/components/invoice/invoice-preview";
import { getInvoiceById } from "@/lib/db/invoices";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = await getInvoiceById(id);

  if (!invoice) {
    notFound();
  }

  const invoiceId = invoice.documentId ?? String(invoice.id);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-widest text-brand-primary">
              Facturatie
            </p>
            <h1 className="mt-1 text-[28px] font-bold text-foreground sm:text-[32px]">
              Factuur {invoice.invoiceNumber}
            </h1>
            <p className="mt-2 text-[15px] text-muted">
              Voorbeeld van de opgeslagen factuur.
            </p>
          </div>
          <InvoiceDetailActions
            invoiceId={invoiceId}
            invoiceNumber={invoice.invoiceNumber}
          />
        </div>

        <InvoicePreview
          data={{
            customerName: invoice.customerName,
            identificationNumber: invoice.identificationNumber,
            email: invoice.email,
            phone: invoice.phone,
            scooterType: invoice.scooterType,
            warrantyDuration: invoice.warrantyDuration,
            scooterCondition: invoice.scooterCondition,
            priceExVat: invoice.priceExVat,
            vatRate: invoice.vatRate,
            invoiceDate: invoice.invoiceDate,
          }}
          invoiceNumber={invoice.invoiceNumber}
          vatAmount={invoice.vatAmount}
          total={invoice.total}
        />

        <div className="mt-6 sm:hidden">
          <Link
            href={`/api/invoices/${invoiceId}/pdf`}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-brand-primary px-5 text-[15px] font-semibold text-brand-primary-foreground"
          >
            PDF downloaden
          </Link>
        </div>
      </main>
  );
}
