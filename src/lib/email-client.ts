import { companyConfig } from "@/lib/company";

export function buildInvoiceEmailGreeting(params: {
  customerName: string;
  invoiceNumber: string;
  totalFormatted: string;
}): string {
  const firstName = params.customerName.trim().split(/\s+/)[0] || "klant";

  return `Beste ${firstName},

Bedankt voor uw aankoop bij ons.
In de bijlage vindt u uw factuur ${params.invoiceNumber}.
Totaal: ${params.totalFormatted}.

Met vriendelijke groet
${companyConfig.name}
${companyConfig.phone}`;
}

export function buildMailtoUrl(params: {
  to: string;
  subject: string;
  body: string;
}): string {
  const query = new URLSearchParams({
    subject: params.subject,
    body: params.body,
  });
  // Do not encode the email address itself — mailto clients expect a raw address
  return `mailto:${params.to}?${query.toString()}`;
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
 * Same flow as WhatsApp: download PDF + open mail app with a ready Dutch message.
 */
export async function openInvoiceEmailClient(params: {
  to: string;
  customerName: string;
  invoiceNumber: string;
  totalFormatted: string;
  pdfUrl: string;
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
  });
  const subject = `Factuur ${params.invoiceNumber} — ${companyConfig.name}`;

  const response = await fetch(params.pdfUrl);
  if (!response.ok) {
    throw new Error("PDF ophalen mislukt.");
  }

  const blob = await response.blob();
  const filename = `${params.invoiceNumber}.pdf`;
  downloadPdfFile(blob, filename);

  window.open(
    buildMailtoUrl({
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
      "E-mail geopend met een klaar bericht. Voeg het gedownloade PDF-bestand toe als bijlage.",
  };
}
