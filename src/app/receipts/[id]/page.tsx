import Link from "next/link";
import { notFound } from "next/navigation";
import { AppFooter } from "@/components/layout/app-footer";
import { AppHeader } from "@/components/layout/app-header";
import { ReceiptDetailActions } from "@/components/receipt/receipt-detail-actions";
import { ReceiptPreview } from "@/components/receipt/receipt-preview";
import { getReceiptById } from "@/lib/db/receipts";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ReceiptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const receipt = await getReceiptById(id);

  if (!receipt) {
    notFound();
  }

  const receiptId = receipt.documentId ?? String(receipt.id);

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-widest text-brand-primary">
              Betaling
            </p>
            <h1 className="mt-1 text-[28px] font-bold text-foreground sm:text-[32px]">
              Bon {receipt.receiptNumber}
            </h1>
            <p className="mt-2 text-[15px] text-muted">
              Voorbeeld van het opgeslagen betalingsbewijs.
            </p>
          </div>
          <ReceiptDetailActions
            receiptId={receiptId}
            receiptNumber={receipt.receiptNumber}
          />
        </div>

        <ReceiptPreview
          data={{
            customerName: receipt.customerName,
            identificationNumber: receipt.identificationNumber,
            email: receipt.email,
            phone: receipt.phone,
            scooterType: receipt.scooterType,
            warrantyDuration: receipt.warrantyDuration,
            scooterCondition: receipt.scooterCondition,
            priceExVat: receipt.priceExVat,
            vatRate: receipt.vatRate,
            paymentDate: receipt.paymentDate,
            paymentMethod: receipt.paymentMethod,
          }}
          receiptNumber={receipt.receiptNumber}
          vatAmount={receipt.vatAmount}
          total={receipt.total}
        />

        <div className="mt-6 sm:hidden">
          <Link
            href={`/api/receipts/${receiptId}/pdf`}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-brand-primary px-5 text-[15px] font-semibold text-brand-primary-foreground"
          >
            PDF downloaden
          </Link>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
