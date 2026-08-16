import { renderToBuffer } from "@react-pdf/renderer";
import { ReceiptDocument } from "@/pdf/receipt-document";
import type { Receipt } from "@/types/receipt";

export async function generateReceiptPdf(receipt: Receipt): Promise<Buffer> {
  const buffer = await renderToBuffer(<ReceiptDocument receipt={receipt} />);
  return Buffer.from(buffer);
}
