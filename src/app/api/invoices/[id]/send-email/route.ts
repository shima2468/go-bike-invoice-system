import { NextResponse } from "next/server";
import { generateInvoicePdf } from "@/lib/generate-invoice-pdf";
import { formatCurrency } from "@/lib/invoice-formatting";
import { getResendConfigStatus, sendInvoiceEmail } from "@/lib/resend";
import { getInvoiceById } from "@/lib/strapi";

export async function POST(
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

    if (!invoice.email) {
      return NextResponse.json(
        { success: false, message: "Geen e-mailadres voor deze klant." },
        { status: 400 }
      );
    }

    const config = getResendConfigStatus();
    if (!config.configured) {
      return NextResponse.json({
        success: false,
        fallback: true,
        message: `E-mailconfiguratie ontbreekt: ${config.missing.join(", ")}`,
        invoice: {
          email: invoice.email,
          customerName: invoice.customerName,
          invoiceNumber: invoice.invoiceNumber,
          totalFormatted: formatCurrency(invoice.total),
        },
      });
    }

    const pdfBuffer = await generateInvoicePdf(invoice);
    const result = await sendInvoiceEmail({
      to: invoice.email,
      customerName: invoice.customerName,
      invoiceNumber: invoice.invoiceNumber,
      totalFormatted: formatCurrency(invoice.total),
      pdfBuffer,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 503 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "E-mail verzenden mislukt.",
      },
      { status: 500 }
    );
  }
}
