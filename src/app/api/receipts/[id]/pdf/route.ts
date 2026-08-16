import { NextResponse } from "next/server";
import { generateReceiptPdf } from "@/lib/generate-receipt-pdf";
import { getReceiptById } from "@/lib/db/receipts";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const receipt = await getReceiptById(id);

    if (!receipt) {
      return NextResponse.json(
        { success: false, message: "Bon niet gevonden." },
        { status: 404 }
      );
    }

    const pdfBuffer = await generateReceiptPdf(receipt);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${receipt.receiptNumber}.pdf"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "PDF genereren mislukt.",
      },
      { status: 500 }
    );
  }
}
