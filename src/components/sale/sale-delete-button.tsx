"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SaleDeleteButton({ saleId }: { saleId: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm("Deze verkoop verwijderen?");
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/sales/${saleId}`, { method: "DELETE" });
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
    <Button
      type="button"
      variant="secondary"
      size="sm"
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 hover:bg-red-50"
    >
      <Trash2 className="h-3.5 w-3.5" />
      {isDeleting ? "..." : "Verwijderen"}
    </Button>
  );
}
