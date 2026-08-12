import { NextResponse } from "next/server";
import { z } from "zod";
import {
  deleteInvoice,
  getInvoiceById,
  updateInvoice,
} from "@/lib/db/invoices";
import { verifyInvoiceCalculations } from "@/lib/invoice-calculations";
import { invoiceFormSchema } from "@/schemas/invoice.schema";

const updateInvoiceSchema = invoiceFormSchema.extend({
  invoiceNumber: z.string().optional(),
});

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

    return NextResponse.json({ success: true, invoice });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Factuur ophalen mislukt.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateInvoiceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validatiefout",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const invoice = await updateInvoice(id, data);

    if (!invoice) {
      return NextResponse.json(
        { success: false, message: "Factuur niet gevonden." },
        { status: 404 }
      );
    }

    if (
      !verifyInvoiceCalculations(
        invoice.priceExVat,
        invoice.vatRate,
        invoice.vatAmount,
        invoice.total
      )
    ) {
      return NextResponse.json(
        { success: false, message: "Berekeningsverificatie mislukt." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Factuur succesvol bijgewerkt.",
      invoice,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Factuur bijwerken mislukt.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const deleted = await deleteInvoice(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Factuur niet gevonden." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Factuur succesvol verwijderd.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Factuur verwijderen mislukt.",
      },
      { status: 500 }
    );
  }
}
