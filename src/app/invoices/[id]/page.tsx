import { notFound } from "next/navigation";
import { AppFooter } from "@/components/layout/app-footer";
import { AppHeader } from "@/components/layout/app-header";
import { InvoicePreview } from "@/components/invoice/invoice-preview";
import { getInvoiceById } from "@/lib/db/invoices";

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

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-[13px] font-semibold uppercase tracking-widest text-brand-primary">
            Facturatie
          </p>
          <h1 className="mt-1 text-[28px] font-bold text-foreground sm:text-[32px]">
            Factuur {invoice.invoiceNumber}
          </h1>
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
      </main>
      <AppFooter />
    </div>
  );
}
