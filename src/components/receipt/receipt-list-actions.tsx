"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Download, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Receipt } from "@/types/receipt";

export function ReceiptListActions({ receipt }: { receipt: Receipt }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const id = receipt.documentId ?? String(receipt.id);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Bon ${receipt.receiptNumber} definitief verwijderen?`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/receipts/${id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message ?? "Verwijderen mislukt.");
      }
      router.refresh();
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Verwijderen mislukt."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <Link
        href={`/api/receipts/${id}/pdf`}
        target="_blank"
        className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full bg-surface px-3 text-[13px] font-semibold text-foreground shadow-ios hover:bg-surface-secondary"
        title="PDF downloaden"
      >
        <Download className="h-3.5 w-3.5" />
        PDF
      </Link>
      <Link
        href={`/receipts/${id}/edit`}
        className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full bg-surface px-3 text-[13px] font-semibold text-foreground shadow-ios hover:bg-surface-secondary"
        title="Bewerken"
      >
        <Pencil className="h-3.5 w-3.5" />
        Bewerken
      </Link>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={handleDelete}
        disabled={isDeleting}
        className="text-red-600 hover:bg-red-50"
        title="Verwijderen"
      >
        <Trash2 className="h-3.5 w-3.5" />
        {isDeleting ? "..." : "Verwijderen"}
      </Button>
    </div>
  );
}
