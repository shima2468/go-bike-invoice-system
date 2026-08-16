import { companyConfig } from "@/lib/company";

export function buildInvoiceEmailGreeting(params: {
  customerName: string;
  invoiceNumber: string;
  totalFormatted: string;
  documentKind?: "invoice" | "receipt";
}): string {
  const firstName = params.customerName.trim().split(/\s+/)[0] || "klant";
  const isReceipt = params.documentKind === "receipt";

  return `Beste ${firstName},

Bedankt voor uw aankoop bij ons.
In de bijlage vindt u ${isReceipt ? "uw betalingsbewijs" : "uw factuur"} ${params.invoiceNumber}.
Totaal: ${params.totalFormatted}.

Met vriendelijke groet
${companyConfig.name}
${companyConfig.phone}`;
}

export function buildGmailComposeUrl(params: {
  to: string;
  subject: string;
  body: string;
}): string {
  const query = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: params.to,
    su: params.subject,
    body: params.body,
  });
  return `https://mail.google.com/mail/?${query.toString()}`;
}

function downloadPdfFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Same flow as WhatsApp: download PDF + open Gmail Web with a ready Dutch message.
 */
export async function openInvoiceEmailClient(params: {
  to: string;
  customerName: string;
  invoiceNumber: string;
  totalFormatted: string;
  pdfUrl: string;
  documentKind?: "invoice" | "receipt";
}): Promise<{ success: boolean; message: string }> {
  if (!params.to?.trim()) {
    return {
      success: false,
      message: "Geen e-mailadres voor deze klant.",
    };
  }

  const body = buildInvoiceEmailGreeting({
    customerName: params.customerName,
    invoiceNumber: params.invoiceNumber,
    totalFormatted: params.totalFormatted,
    documentKind: params.documentKind,
  });
  const isReceipt = params.documentKind === "receipt";
  const subject = `${isReceipt ? "Bon" : "Factuur"} ${params.invoiceNumber} — ${companyConfig.name}`;

  const response = await fetch(params.pdfUrl);
  if (!response.ok) {
    throw new Error("PDF ophalen mislukt.");
  }

  const blob = await response.blob();
  downloadPdfFile(blob, `${params.invoiceNumber}.pdf`);

  window.open(
    buildGmailComposeUrl({
      to: params.to.trim(),
      subject,
      body,
    }),
    "_blank",
    "noopener,noreferrer"
  );

  return {
    success: true,
    message:
      "Gmail is geopend met een klaar bericht. Voeg het gedownloade PDF-bestand toe als bijlage.",
  };
}
