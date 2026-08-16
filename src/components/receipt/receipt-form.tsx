"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
import { InvoiceSummary } from "@/components/invoice/invoice-summary";
import { PricingSection } from "@/components/invoice/pricing-section";
import { ScooterSection } from "@/components/invoice/scooter-section";
import { ReceiptPreview } from "@/components/receipt/receipt-preview";
import { Button } from "@/components/ui/button";
import { FormField, FormGrid, FormSection } from "@/components/ui/form-section";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateInvoiceTotals } from "@/lib/invoice-calculations";
import {
  formatCurrency,
  formatReceiptNumber,
  todayIsoDate,
} from "@/lib/invoice-formatting";
import { openInvoiceEmailClient } from "@/lib/email-client";
import {
  defaultReceiptFormValues,
  receiptFormSchema,
  type ReceiptFormValues,
} from "@/schemas/receipt.schema";
import type { Receipt } from "@/types/receipt";
import { PAYMENT_METHODS } from "@/types/receipt";
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

export function ReceiptForm({
  existingReceipt = null,
}: {
  existingReceipt?: Receipt | null;
}) {
  const router = useRouter();
  const isEditMode = Boolean(existingReceipt);
  const [previewMode, setPreviewMode] = useState(false);
  const [savedReceipt, setSavedReceipt] = useState<Receipt | null>(
    existingReceipt
  );
  const [receiptNumber, setReceiptNumber] = useState(
    existingReceipt?.receiptNumber ?? formatReceiptNumber(1)
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isSharingWhatsApp, setIsSharingWhatsApp] = useState(false);

  const form = useForm<ReceiptFormValues>({
    resolver: zodResolver(receiptFormSchema),
    defaultValues: existingReceipt
      ? {
          customerName: existingReceipt.customerName,
          identificationNumber: existingReceipt.identificationNumber,
          email: existingReceipt.email,
          phone: existingReceipt.phone,
          scooterType: existingReceipt.scooterType,
          warrantyDuration: existingReceipt.warrantyDuration,
          scooterCondition: existingReceipt.scooterCondition,
          priceExVat: existingReceipt.priceExVat,
          vatRate: existingReceipt.vatRate,
          paymentDate: existingReceipt.paymentDate,
          paymentMethod: existingReceipt.paymentMethod,
        }
      : {
          ...defaultReceiptFormValues,
          paymentDate: todayIsoDate(),
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
    if (isEditMode) return;

    async function fetchReceiptNumber() {
      try {
        const response = await fetch("/api/receipts/next-number");
        if (response.ok) {
          const data = (await response.json()) as { receiptNumber: string };
          setReceiptNumber(data.receiptNumber);
        }
      } catch {
        // Keep local fallback number
      }
    }

    fetchReceiptNumber();
  }, [isEditMode]);

  const handlePreview = async () => {
    const valid = await form.trigger();
    if (!valid) {
      setErrorMessage(
        "Controleer de formuliergegevens voordat u een voorbeeld bekijkt."
      );
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
      const editId =
        existingReceipt?.documentId ??
        (existingReceipt?.id != null ? String(existingReceipt.id) : null);

      const response = await fetch(
        isEditMode && editId ? `/api/receipts/${editId}` : "/api/receipts",
        {
          method: isEditMode ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...values,
            receiptNumber,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message ?? "Opslaan mislukt.");
      }

      setSavedReceipt(result.receipt);
      setReceiptNumber(result.receipt.receiptNumber);
      setStatusMessage(
        isEditMode ? "Bon succesvol bijgewerkt." : "Bon succesvol opgeslagen."
      );
      setPreviewMode(true);
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Opslaan mislukt."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!savedReceipt?.documentId && !savedReceipt?.id) {
      setErrorMessage("Sla de bon eerst op voordat u een PDF downloadt.");
      return;
    }

    const id = savedReceipt.documentId ?? String(savedReceipt.id);
    window.open(`/api/receipts/${id}/pdf`, "_blank");
  };

  const handleSendEmail = async () => {
    if (!savedReceipt?.documentId && !savedReceipt?.id) {
      setErrorMessage("Sla de bon eerst op voordat u een e-mail verstuurt.");
      return;
    }

    setIsSendingEmail(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const values = form.getValues();
      const number = savedReceipt.receiptNumber ?? receiptNumber;
      const id = savedReceipt.documentId ?? String(savedReceipt.id);

      const emailResult = await openInvoiceEmailClient({
        to: values.email || savedReceipt.email,
        customerName: values.customerName || savedReceipt.customerName,
        invoiceNumber: number,
        totalFormatted: formatCurrency(savedReceipt.total ?? total),
        pdfUrl: `/api/receipts/${id}/pdf`,
        documentKind: "receipt",
      });

      if (!emailResult.success) {
        setErrorMessage(emailResult.message);
        return;
      }

      setStatusMessage(emailResult.message);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "E-mail verzenden mislukt."
      );
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleWhatsApp = async () => {
    if (!savedReceipt?.documentId && !savedReceipt?.id) {
      setErrorMessage("Sla de bon eerst op voordat u via WhatsApp verstuurt.");
      return;
    }

    setIsSharingWhatsApp(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const values = form.getValues();
      const number = savedReceipt.receiptNumber ?? receiptNumber;
      const id = savedReceipt.documentId ?? String(savedReceipt.id);

      const result = await shareInvoicePdfViaWhatsApp({
        phone: values.phone,
        customerName: values.customerName,
        invoiceNumber: number,
        totalFormatted: formatCurrency(savedReceipt.total ?? total),
        pdfUrl: `/api/receipts/${id}/pdf`,
        documentKind: "receipt",
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
        {isSaving ? "Opslaan..." : isEditMode ? "Wijzigingen opslaan" : "Opslaan"}
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
      {!savedReceipt && (
        <Button type="button" onClick={handleSave} disabled={isSaving} className="flex-1 sm:flex-none">
          <Save className="h-4 w-4" />
          {isSaving ? "Opslaan..." : isEditMode ? "Wijzigingen opslaan" : "Opslaan"}
        </Button>
      )}
      {savedReceipt && (
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
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/receipts")}
            className="flex-1 sm:flex-none"
          >
            Naar overzicht
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
              <FormSection title="Bongegevens">
                <FormGrid>
                  <FormField>
                    <Label htmlFor="receiptNumber">Bonnummer</Label>
                    <Input
                      id="receiptNumber"
                      readOnly
                      value={receiptNumber}
                      className="font-medium text-muted"
                      tabIndex={-1}
                    />
                  </FormField>
                  <FormField>
                    <Label htmlFor="paymentDate" required>
                      Betaaldatum
                    </Label>
                    <Input
                      id="paymentDate"
                      type="date"
                      {...form.register("paymentDate")}
                    />
                    {form.formState.errors.paymentDate && (
                      <p className="mt-1.5 text-[13px] text-red-500">
                        {form.formState.errors.paymentDate.message}
                      </p>
                    )}
                  </FormField>
                  <FormField>
                    <Label htmlFor="paymentMethod" required>
                      Betaalwijze
                    </Label>
                    <select
                      id="paymentMethod"
                      className="min-h-11 w-full rounded-xl border border-separator bg-surface px-3 text-[15px] text-foreground outline-none focus:ring-2 focus:ring-brand-primary/30"
                      {...form.register("paymentMethod")}
                    >
                      {PAYMENT_METHODS.map((method) => (
                        <option key={method} value={method}>
                          {method}
                        </option>
                      ))}
                    </select>
                    {form.formState.errors.paymentMethod && (
                      <p className="mt-1.5 text-[13px] text-red-500">
                        {form.formState.errors.paymentMethod.message}
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
            <ReceiptPreview
              data={formValues}
              receiptNumber={savedReceipt?.receiptNumber ?? receiptNumber}
              vatAmount={savedReceipt?.vatAmount ?? vatAmount}
              total={savedReceipt?.total ?? total}
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
            vatAmount={savedReceipt?.vatAmount ?? vatAmount}
            total={savedReceipt?.total ?? total}
          />
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-separator bg-surface/90 px-4 py-3 ios-blur sm:hidden">
        <div className="flex gap-2">{actionButtons}</div>
      </div>
    </FormProvider>
  );
}
