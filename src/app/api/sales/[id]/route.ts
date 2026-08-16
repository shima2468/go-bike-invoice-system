import { NextResponse } from "next/server";
import { deleteSale } from "@/lib/db/sales";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const deleted = await deleteSale(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Verkoop niet gevonden." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verkoop verwijderd.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Verkoop verwijderen mislukt.",
      },
      { status: 500 }
    );
  }
}
