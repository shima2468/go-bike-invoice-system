export function normalizePhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");

  if (digits.startsWith("00")) {
    return digits.slice(2);
  }

  if (digits.startsWith("32") || digits.startsWith("31")) {
    return digits;
  }

  if (digits.startsWith("04")) {
    return `32${digits.slice(1)}`;
  }

  if (digits.startsWith("06")) {
    return `31${digits.slice(1)}`;
  }

  if (digits.startsWith("0")) {
    return `32${digits.slice(1)}`;
  }

  return digits;
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const normalized = normalizePhoneNumber(phone);
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${normalized}?text=${encoded}`;
}

export function buildWhatsAppGreeting(params: {
  customerName: string;
  invoiceNumber: string;
  totalFormatted?: string;
}): string {
  const firstName = params.customerName.trim().split(/\s+/)[0] || "klant";
  const totalLine = params.totalFormatted
    ? `\nTotaal: ${params.totalFormatted}.`
    : "";

  return `Hallo ${firstName},

Bedankt voor uw aankoop bij ons.
In de bijlage vindt u uw factuur ${params.invoiceNumber}.${totalLine}

Met vriendelijke groet
GO BIKE`;
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
 * Opens WhatsApp (wa.me) with a ready Dutch message, and downloads the PDF
 * so the employee can attach it manually. No Meta API / Web Share sheet.
 */
export async function shareInvoicePdfViaWhatsApp(params: {
  phone: string;
  customerName: string;
  invoiceNumber: string;
  totalFormatted?: string;
  pdfUrl: string;
}): Promise<{ success: boolean; message: string }> {
  const greetingMessage = buildWhatsAppGreeting({
    customerName: params.customerName,
    invoiceNumber: params.invoiceNumber,
    totalFormatted: params.totalFormatted,
  });

  const response = await fetch(params.pdfUrl);
  if (!response.ok) {
    throw new Error("PDF ophalen mislukt.");
  }

  const blob = await response.blob();
  const filename = `${params.invoiceNumber}.pdf`;

  downloadPdfFile(blob, filename);
  window.open(
    buildWhatsAppUrl(params.phone, greetingMessage),
    "_blank",
    "noopener,noreferrer"
  );

  return {
    success: true,
    message:
      "WhatsApp geopend met een klaar bericht. Voeg het gedownloade PDF-bestand toe aan het gesprek.",
  };
}
