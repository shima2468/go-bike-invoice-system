import { NextResponse } from "next/server";
import { formatInvoiceNumber } from "@/lib/invoice-formatting";
import { getNextInvoiceNumber } from "@/lib/db/invoices";

export async function GET() {
  try {
    const invoiceNumber = await getNextInvoiceNumber();
    return NextResponse.json({ invoiceNumber });
  } catch {
    return NextResponse.json({ invoiceNumber: formatInvoiceNumber(1) });
  }
}
