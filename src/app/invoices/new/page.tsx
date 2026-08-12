import { AppFooter } from "@/components/layout/app-footer";
import { AppHeader } from "@/components/layout/app-header";
import { InvoiceForm } from "@/components/invoice/invoice-form";

export default function NewInvoicePage() {
  return (
    <div className="flex min-h-full flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-32 pt-6 sm:px-6 sm:pb-12 sm:pt-8 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <p className="text-[13px] font-semibold uppercase tracking-widest text-brand-primary">
            Facturatie
          </p>
          <h1 className="mt-1 text-[28px] font-bold tracking-tight text-foreground sm:text-[34px] lg:text-[38px]">
            Nieuwe factuur
          </h1>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted sm:text-[16px]">
            Vul de gegevens in om een professionele factuur te maken.
          </p>
        </div>
        <InvoiceForm />
      </main>
      <AppFooter />
    </div>
  );
}
