import { ReceiptForm } from "@/components/receipt/receipt-form";

export default function NewReceiptPage() {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-32 pt-6 sm:px-6 sm:pb-12 sm:pt-8 lg:px-8">
      <div className="mb-6 sm:mb-8">
        <p className="text-[13px] font-semibold uppercase tracking-widest text-brand-primary">
          Betaling
        </p>
        <h1 className="mt-1 text-[28px] font-bold tracking-tight text-foreground sm:text-[34px] lg:text-[38px]">
          Nieuwe bon
        </h1>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted sm:text-[16px]">
          Maak een betalingsbewijs nadat de klant heeft betaald.
        </p>
      </div>
      <ReceiptForm />
    </main>
  );
}
