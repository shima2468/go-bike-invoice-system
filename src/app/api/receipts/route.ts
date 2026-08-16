import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyInvoiceCalculations } from "@/lib/invoice-calculations";
import {
  createReceipt,
  getNextReceiptNumber,
  listReceipts,
} from "@/lib/db/receipts";
import { upsertCustomer } from "@/lib/db/invoices";
import { receiptFormSchema } from "@/schemas/receipt.schema";

const saveReceiptSchema = receiptFormSchema.extend({
  receiptNumber: z.string().optional(),
});

export async function GET() {
  try {
    const receipts = await listReceipts();

    return NextResponse.json({
      success: true,
      receipts,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Bonnen ophalen mislukt.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = saveReceiptSchema.safeParse(body);

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

    const receiptNumber =
      data.receiptNumber && data.receiptNumber.length > 0
        ? data.receiptNumber
        : await getNextReceiptNumber();

    const customer = await upsertCustomer({
      customerName: data.customerName,
      identificationNumber: data.identificationNumber,
      email: data.email,
      phone: data.phone,
    });

    const receipt = await createReceipt({
      receiptNumber,
      paymentDate: data.paymentDate,
      paymentMethod: data.paymentMethod,
      customerName: data.customerName,
      identificationNumber: data.identificationNumber,
      email: data.email,
      phone: data.phone,
      scooterType: data.scooterType,
      warrantyDuration: data.warrantyDuration,
      scooterCondition: data.scooterCondition,
      priceExVat: data.priceExVat,
      vatRate: data.vatRate,
      customerId: customer.id,
      customerDocumentId: customer.documentId,
    });

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
      message: "Bon succesvol opgeslagen.",
      receipt,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Er is een onbekende fout opgetreden.",
      },
      { status: 500 }
    );
  }
}
