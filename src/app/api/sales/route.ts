import { NextResponse } from "next/server";
import { createSale, listSaleLog } from "@/lib/db/sales";
import { saleFormSchema } from "@/schemas/sale.schema";

export async function GET() {
  try {
    const sales = await listSaleLog();
    return NextResponse.json({ success: true, sales });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Verkoop ophalen mislukt.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = saleFormSchema.safeParse(body);

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

    const sale = await createSale({
      soldOn: parsed.data.soldOn,
      item: parsed.data.item,
      customerName: parsed.data.customerName,
      amount: parsed.data.amount,
      notes: parsed.data.notes,
    });

    return NextResponse.json({
      success: true,
      message: "Verkoop opgeslagen.",
      sale,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Verkoop opslaan mislukt.",
      },
      { status: 500 }
    );
  }
}
