import { renderToBuffer } from "@react-pdf/renderer";
import { InvoiceDocument } from "@/pdf/invoice-document";
import type { Invoice } from "@/types/invoice";

export async function generateInvoicePdf(invoice: Invoice): Promise<Buffer> {
  const buffer = await renderToBuffer(<InvoiceDocument invoice={invoice} />);
  return Buffer.from(buffer);
}
