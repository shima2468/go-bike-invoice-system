"use client";

import Link from "next/link";
import { Download, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReceiptDetailActions({
  receiptId,
  receiptNumber,
}: {
  receiptId: string;
  receiptNumber: string;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <Link href="/receipts">
        <Button type="button" variant="ghost">
          Terug naar overzicht
        </Button>
      </Link>
      <Link href={`/receipts/${receiptId}/edit`}>
        <Button type="button" variant="secondary">
          <Pencil className="h-4 w-4" />
          Bewerken
        </Button>
      </Link>
      <a href={`/api/receipts/${receiptId}/pdf`} target="_blank" rel="noreferrer">
        <Button type="button">
          <Download className="h-4 w-4" />
          PDF downloaden
        </Button>
      </a>
      <span className="sr-only">{receiptNumber}</span>
    </div>
  );
}
