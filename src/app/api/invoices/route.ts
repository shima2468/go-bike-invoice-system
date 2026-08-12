import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyInvoiceCalculations } from "@/lib/invoice-calculations";
import {
  createInvoice,
  getNextInvoiceNumber,
  listInvoices,
  upsertCustomer,
} from "@/lib/db/invoices";
import { invoiceFormSchema } from "@/schemas/invoice.schema";

const saveInvoiceSchema = invoiceFormSchema.extend({
  invoiceNumber: z.string().optional(),
});

export async function GET() {
  try {
    const invoices = await listInvoices();

    return NextResponse.json({
      success: true,
      invoices,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Facturen ophalen mislukt.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = saveInvoiceSchema.safeParse(body);

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

    const invoiceNumber =
      data.invoiceNumber && data.invoiceNumber.length > 0
        ? data.invoiceNumber
        : await getNextInvoiceNumber();

    const customer = await upsertCustomer({
      customerName: data.customerName,
      identificationNumber: data.identificationNumber,
      email: data.email,
      phone: data.phone,
    });

    const invoice = await createInvoice({
      invoiceNumber,
      invoiceDate: data.invoiceDate,
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
        invoice.priceExVat,
        invoice.vatRate,
        invoice.vatAmount,
        invoice.total
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
      message: "Factuur succesvol opgeslagen.",
      invoice,
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
