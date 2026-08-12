import { NextResponse } from "next/server";
import { formatInvoiceNumber } from "@/lib/invoice-formatting";
import { getNextInvoiceNumber, isStrapiConfigured } from "@/lib/strapi";

export async function GET() {
  try {
    if (isStrapiConfigured()) {
      const invoiceNumber = await getNextInvoiceNumber();
      return NextResponse.json({ invoiceNumber });
    }

    return NextResponse.json({ invoiceNumber: formatInvoiceNumber(1) });
  } catch {
    return NextResponse.json({ invoiceNumber: formatInvoiceNumber(1) });
  }
}
