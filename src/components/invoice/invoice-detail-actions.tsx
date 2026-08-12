"use client";

import Link from "next/link";
import { Download, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InvoiceDetailActions({
  invoiceId,
  invoiceNumber,
}: {
  invoiceId: string;
  invoiceNumber: string;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <Link href="/invoices">
        <Button type="button" variant="ghost">
          Terug naar overzicht
        </Button>
      </Link>
      <Link href={`/invoices/${invoiceId}/edit`}>
        <Button type="button" variant="secondary">
          <Pencil className="h-4 w-4" />
          Bewerken
        </Button>
      </Link>
      <a href={`/api/invoices/${invoiceId}/pdf`} target="_blank" rel="noreferrer">
        <Button type="button">
          <Download className="h-4 w-4" />
          PDF downloaden
        </Button>
      </a>
      <span className="sr-only">{invoiceNumber}</span>
    </div>
  );
}
