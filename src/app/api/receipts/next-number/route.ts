import { NextResponse } from "next/server";
import { formatReceiptNumber } from "@/lib/invoice-formatting";
import { getNextReceiptNumber } from "@/lib/db/receipts";

export async function GET() {
  try {
    const receiptNumber = await getNextReceiptNumber();
    return NextResponse.json({ receiptNumber });
  } catch {
    return NextResponse.json({ receiptNumber: formatReceiptNumber(1) });
  }
}
