import { NextResponse } from "next/server";
import { z } from "zod";
import {
  deleteReceipt,
  getReceiptById,
  updateReceipt,
} from "@/lib/db/receipts";
import { verifyInvoiceCalculations } from "@/lib/invoice-calculations";
import { receiptFormSchema } from "@/schemas/receipt.schema";

const updateReceiptSchema = receiptFormSchema.extend({
  receiptNumber: z.string().optional(),
});

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

    return NextResponse.json({ success: true, receipt });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Bon ophalen mislukt.",
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
    const parsed = updateReceiptSchema.safeParse(body);

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
    const receipt = await updateReceipt(id, data);

    if (!receipt) {
      return NextResponse.json(
        { success: false, message: "Bon niet gevonden." },
        { status: 404 }
      );
    }

    if (
      !verifyInvoiceCalculations(
        receipt.priceExVat,
        receipt.vatRate,
        receipt.vatAmount,
        receipt.total
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Berekeningsverificatie mislukt.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Bon succesvol bijgewerkt.",
      receipt,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Bon bijwerken mislukt.",
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
    const deleted = await deleteReceipt(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Bon niet gevonden." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Bon succesvol verwijderd.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Bon verwijderen mislukt.",
      },
      { status: 500 }
    );
  }
}
