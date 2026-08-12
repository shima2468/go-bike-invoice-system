import { Resend } from "resend";
import { companyConfig } from "@/lib/company";

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const RESEND_FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? companyConfig.email ?? "";
const RESEND_REPLY_TO = process.env.RESEND_REPLY_TO ?? RESEND_FROM_EMAIL;

function getFromAddress(): string | null {
  if (!RESEND_FROM_EMAIL) return null;
  if (RESEND_FROM_EMAIL.includes("<")) return RESEND_FROM_EMAIL;
  return `${companyConfig.name} <${RESEND_FROM_EMAIL}>`;
}

export function getResendConfigStatus(): {
  configured: boolean;
  missing: string[];
} {
  const missing: string[] = [];

  if (!RESEND_API_KEY) missing.push("RESEND_API_KEY");
  if (!RESEND_FROM_EMAIL) missing.push("RESEND_FROM_EMAIL");

  return {
    configured: missing.length === 0,
    missing,
  };
}

export async function sendInvoiceEmail(params: {
  to: string;
  customerName: string;
  invoiceNumber: string;
  totalFormatted: string;
  pdfBuffer: Buffer;
}): Promise<{ success: boolean; message: string }> {
  const config = getResendConfigStatus();

  if (!config.configured) {
    return {
      success: false,
      message: `E-mailconfiguratie ontbreekt: ${config.missing.join(", ")}`,
    };
  }

  const resend = new Resend(RESEND_API_KEY);
  const firstName = params.customerName.split(" ")[0];

  const from = getFromAddress();
  if (!from) {
    return {
      success: false,
      message: "E-mailconfiguratie ontbreekt: RESEND_FROM_EMAIL",
    };
  }

  const { error } = await resend.emails.send({
    from,
    replyTo: RESEND_REPLY_TO || undefined,
    to: params.to,
    subject: `Factuur ${params.invoiceNumber} — ${companyConfig.name}`,
    html: `
      <p>Beste ${firstName},</p>
      <p>In de bijlage vindt u uw factuur ${params.invoiceNumber}.</p>
      <p>Totaal: ${params.totalFormatted}</p>
      <p>Bedankt voor uw aankoop.</p>
      <p>Met vriendelijke groet,<br/>${companyConfig.name}<br/>${companyConfig.phone}${companyConfig.email ? `<br/>${companyConfig.email}` : ""}</p>
    `,
    attachments: [
      {
        filename: `${params.invoiceNumber}.pdf`,
        content: params.pdfBuffer,
      },
    ],
  });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  return {
    success: true,
    message: `E-mail met PDF verzonden vanaf ${from}.`,
  };
}
