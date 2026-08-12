import { NextResponse } from "next/server";
import { generateInvoicePdf } from "@/lib/generate-invoice-pdf";
import { getInvoiceById } from "@/lib/strapi";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const invoice = await getInvoiceById(id);

    if (!invoice) {
      return NextResponse.json(
        { success: false, message: "Factuur niet gevonden." },
        { status: 404 }
      );
    }

    const pdfBuffer = await generateInvoicePdf(invoice);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${invoice.invoiceNumber}.pdf"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "PDF genereren mislukt.",
      },
      { status: 500 }
    );
  }
}
