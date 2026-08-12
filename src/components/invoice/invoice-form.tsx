"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import {
  Download,
  Eye,
  Mail,
  MessageCircle,
  Save,
} from "lucide-react";
import { CustomerSection } from "@/components/invoice/customer-section";
import { InvoicePreview } from "@/components/invoice/invoice-preview";
import { InvoiceSummary } from "@/components/invoice/invoice-summary";
import { PricingSection } from "@/components/invoice/pricing-section";
import { ScooterSection } from "@/components/invoice/scooter-section";
import { Button } from "@/components/ui/button";
import { FormField, FormGrid, FormSection } from "@/components/ui/form-section";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateInvoiceTotals } from "@/lib/invoice-calculations";
import {
  formatCurrency,
  formatInvoiceNumber,
  todayIsoDate,
} from "@/lib/invoice-formatting";
import { openInvoiceEmailClient } from "@/lib/email-client";
import {
  defaultInvoiceFormValues,
  invoiceFormSchema,
  type InvoiceFormValues,
} from "@/schemas/invoice.schema";
import type { Invoice } from "@/types/invoice";
import { shareInvoicePdfViaWhatsApp } from "@/lib/whatsapp";

function StatusBanner({
  message,
  type,
}: {
  message: string;
  type: "success" | "error";
}) {
  return (
    <div
      className={`rounded-2xl px-4 py-3.5 text-[15px] shadow-ios ${
        type === "error"
          ? "bg-red-50 text-red-600"
          : "bg-brand-accent text-brand-secondary"
      }`}
    >
      {message}
    </div>
  );
}

export function InvoiceForm() {
  const [previewMode, setPreviewMode] = useState(false);
  const [savedInvoice, setSavedInvoice] = useState<Invoice | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState(formatInvoiceNumber(1));
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isSharingWhatsApp, setIsSharingWhatsApp] = useState(false);

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      ...defaultInvoiceFormValues,
      invoiceDate: todayIsoDate(),
    },
    mode: "onChange",
  });

  const watchedValues = useWatch({ control: form.control });
  const priceExVat = Number(watchedValues.priceExVat) || 0;
  const vatRate = Number(watchedValues.vatRate) || 0;

  const { vatAmount, total } = useMemo(
    () => calculateInvoiceTotals(priceExVat, vatRate),
    [priceExVat, vatRate]
  );

  useEffect(() => {
    async function fetchInvoiceNumber() {
      try {
        const response = await fetch("/api/invoices/next-number");
        if (response.ok) {
          const data = (await response.json()) as { invoiceNumber: string };
          setInvoiceNumber(data.invoiceNumber);
        }
      } catch {
        // Keep local fallback number
      }
    }

    fetchInvoiceNumber();
  }, []);

  const handlePreview = async () => {
    const valid = await form.trigger();
    if (!valid) {
      setErrorMessage("Controleer de formuliergegevens voordat u een voorbeeld bekijkt.");
      return;
    }
    setErrorMessage(null);
    setPreviewMode(true);
  };

  const handleSave = async () => {
    const valid = await form.trigger();
    if (!valid) {
      setErrorMessage("Controleer de formuliergegevens voordat u opslaat.");
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const values = form.getValues();
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          invoiceNumber,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message ?? "Opslaan mislukt.");
      }

      setSavedInvoice(result.invoice);
      setInvoiceNumber(result.invoice.invoiceNumber);
      setStatusMessage("Factuur succesvol opgeslagen in Strapi.");
      setPreviewMode(true);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Opslaan mislukt."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!savedInvoice?.documentId && !savedInvoice?.id) {
      setErrorMessage("Sla de factuur eerst op voordat u een PDF downloadt.");
      return;
    }

    const id = savedInvoice.documentId ?? String(savedInvoice.id);
    window.open(`/api/invoices/${id}/pdf`, "_blank");
  };

  const handleSendEmail = async () => {
    if (!savedInvoice?.documentId && !savedInvoice?.id) {
      setErrorMessage("Sla de factuur eerst op voordat u een e-mail verstuurt.");
      return;
    }

    setIsSendingEmail(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const values = form.getValues();
      const id = savedInvoice.documentId ?? String(savedInvoice.id);
      const response = await fetch(`/api/invoices/${id}/send-email`, {
        method: "POST",
      });
      const result = await response.json();

      if (result.success) {
        setStatusMessage(result.message);
        return;
      }

      // Geen Resend-config: open mail-app met klaar bericht + download PDF
      if (result.fallback) {
        const emailResult = await openInvoiceEmailClient({
          to: result.invoice?.email ?? values.email,
          customerName: result.invoice?.customerName ?? values.customerName,
          invoiceNumber:
            result.invoice?.invoiceNumber ??
            savedInvoice.invoiceNumber ??
            invoiceNumber,
          totalFormatted:
            result.invoice?.totalFormatted ??
            formatCurrency(savedInvoice.total ?? total),
          pdfUrl: `/api/invoices/${id}/pdf`,
        });

        if (!emailResult.success) {
          setErrorMessage(emailResult.message);
          return;
        }

        setStatusMessage(emailResult.message);
        return;
      }

      throw new Error(result.message ?? "E-mail verzenden mislukt.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "E-mail verzenden mislukt."
      );
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleWhatsApp = async () => {
    if (!savedInvoice?.documentId && !savedInvoice?.id) {
      setErrorMessage("Sla de factuur eerst op voordat u via WhatsApp verstuurt.");
      return;
    }

    setIsSharingWhatsApp(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const values = form.getValues();
      const number = savedInvoice.invoiceNumber ?? invoiceNumber;
      const id = savedInvoice.documentId ?? String(savedInvoice.id);

      const result = await shareInvoicePdfViaWhatsApp({
        phone: values.phone,
        customerName: values.customerName,
        invoiceNumber: number,
        totalFormatted: formatCurrency(savedInvoice.total ?? total),
        pdfUrl: `/api/invoices/${id}/pdf`,
      });

      if (!result.success) {
        setErrorMessage(result.message);
        return;
      }

      setStatusMessage(result.message);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "WhatsApp delen mislukt."
      );
    } finally {
      setIsSharingWhatsApp(false);
    }
  };

  const formValues = form.getValues();

  const actionButtons = !previewMode ? (
    <>
      <Button type="button" variant="secondary" onClick={handlePreview} className="flex-1 sm:flex-none">
        <Eye className="h-4 w-4" />
        Voorbeeld
      </Button>
      <Button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className="flex-1 sm:flex-none"
      >
        <Save className="h-4 w-4" />
        {isSaving ? "Opslaan..." : "Opslaan"}
      </Button>
    </>
  ) : (
    <>
      <Button
        type="button"
        variant="ghost"
        onClick={() => setPreviewMode(false)}
        className="flex-1 sm:flex-none"
      >
        Terug
      </Button>
      {!savedInvoice && (
        <Button type="button" onClick={handleSave} disabled={isSaving} className="flex-1 sm:flex-none">
          <Save className="h-4 w-4" />
          {isSaving ? "Opslaan..." : "Opslaan"}
        </Button>
      )}
      {savedInvoice && (
        <>
          <Button type="button" onClick={handleDownloadPdf} className="flex-1 sm:flex-none">
            <Download className="h-4 w-4" />
            PDF
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleSendEmail}
            disabled={isSendingEmail}
            className="flex-1 sm:flex-none"
          >
            <Mail className="h-4 w-4" />
            E-mail
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleWhatsApp}
            disabled={isSharingWhatsApp}
            className="flex-1 sm:flex-none"
          >
            <MessageCircle className="h-4 w-4" />
            {isSharingWhatsApp ? "Openen..." : "Via WhatsApp versturen"}
          </Button>
        </>
      )}
    </>
  );

  return (
    <FormProvider {...form}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-5 sm:space-y-6">
          {!previewMode ? (
            <>
              <FormSection title="Factuurgegevens">
                <FormGrid>
                  <FormField>
                    <Label htmlFor="invoiceNumber">Factuurnummer</Label>
                    <Input
                      id="invoiceNumber"
                      readOnly
                      value={invoiceNumber}
                      className="font-medium text-muted"
                      tabIndex={-1}
                    />
                  </FormField>
                  <FormField>
                    <Label htmlFor="invoiceDate" required>
                      Factuurdatum
                    </Label>
                    <Input
                      id="invoiceDate"
                      type="date"
                      {...form.register("invoiceDate")}
                    />
                    {form.formState.errors.invoiceDate && (
                      <p className="mt-1.5 text-[13px] text-red-500">
                        {form.formState.errors.invoiceDate.message}
                      </p>
                    )}
                  </FormField>
                </FormGrid>
              </FormSection>

              <CustomerSection />
              <ScooterSection />
              <PricingSection vatAmount={vatAmount} total={total} />
            </>
          ) : (
            <InvoicePreview
              data={formValues}
              invoiceNumber={savedInvoice?.invoiceNumber ?? invoiceNumber}
              vatAmount={savedInvoice?.vatAmount ?? vatAmount}
              total={savedInvoice?.total ?? total}
            />
          )}

          {(statusMessage || errorMessage) && (
            <StatusBanner
              message={errorMessage ?? statusMessage ?? ""}
              type={errorMessage ? "error" : "success"}
            />
          )}

          <div className="hidden flex-wrap gap-3 sm:flex">{actionButtons}</div>
        </div>

        <aside>
          <InvoiceSummary
            priceExVat={priceExVat}
            vatAmount={savedInvoice?.vatAmount ?? vatAmount}
            total={savedInvoice?.total ?? total}
          />
        </aside>
      </div>

      {/* iOS-style sticky bottom bar on mobile */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-separator bg-surface/90 px-4 py-3 ios-blur sm:hidden">
        <div className="flex gap-2">{actionButtons}</div>
      </div>
    </FormProvider>
  );
}
