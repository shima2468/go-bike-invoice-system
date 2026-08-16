import { notFound } from "next/navigation";
import { AppFooter } from "@/components/layout/app-footer";
import { AppHeader } from "@/components/layout/app-header";
import { ReceiptForm } from "@/components/receipt/receipt-form";
import { getReceiptById } from "@/lib/db/receipts";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EditReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const receipt = await getReceiptById(id);

  if (!receipt) {
    notFound();
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-32 pt-6 sm:px-6 sm:pb-12 sm:pt-8 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <p className="text-[13px] font-semibold uppercase tracking-widest text-brand-primary">
            Betaling
          </p>
          <h1 className="mt-1 text-[28px] font-bold tracking-tight text-foreground sm:text-[34px]">
            Bon bewerken
          </h1>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted sm:text-[16px]">
            Pas de gegevens van {receipt.receiptNumber} aan en sla opnieuw op.
          </p>
        </div>
        <ReceiptForm existingReceipt={receipt} />
      </main>
      <AppFooter />
    </div>
  );
}
