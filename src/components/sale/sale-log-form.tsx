"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField, FormGrid, FormSection } from "@/components/ui/form-section";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { todayIsoDate } from "@/lib/invoice-formatting";
import {
  saleFormSchema,
  type SaleFormValues,
} from "@/schemas/sale.schema";

export function SaleLogForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: {
      soldOn: todayIsoDate(),
      item: "",
      customerName: "",
      amount: 0,
      notes: "",
    },
  });

  const onSubmit = async (values: SaleFormValues) => {
    setIsSaving(true);
    setErrorMessage(null);
    try {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message ?? "Opslaan mislukt.");
      }
      form.reset({
        soldOn: values.soldOn,
        item: "",
        customerName: "",
        amount: 0,
        notes: "",
      });
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Opslaan mislukt."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormSection title="Vandaag / deze datum opslaan">
        <FormGrid>
          <FormField>
            <Label htmlFor="soldOn" required>
              Datum
            </Label>
            <Input id="soldOn" type="date" {...form.register("soldOn")} />
            {form.formState.errors.soldOn && (
              <p className="mt-1.5 text-[13px] text-red-500">
                {form.formState.errors.soldOn.message}
              </p>
            )}
          </FormField>
          <FormField>
            <Label htmlFor="item" required>
              Wat verkocht
            </Label>
            <Input
              id="item"
              placeholder="bijv. Segway Ninebot G30"
              {...form.register("item")}
            />
            {form.formState.errors.item && (
              <p className="mt-1.5 text-[13px] text-red-500">
                {form.formState.errors.item.message}
              </p>
            )}
          </FormField>
        </FormGrid>
        <FormGrid>
          <FormField>
            <Label htmlFor="customerName">Klant (optioneel)</Label>
            <Input
              id="customerName"
              placeholder="Naam klant"
              {...form.register("customerName")}
            />
          </FormField>
          <FormField>
            <Label htmlFor="amount" required>
              Bedrag incl. btw
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              {...form.register("amount")}
            />
            {form.formState.errors.amount && (
              <p className="mt-1.5 text-[13px] text-red-500">
                {form.formState.errors.amount.message}
              </p>
            )}
          </FormField>
        </FormGrid>
        <FormField>
          <Label htmlFor="notes">Notitie</Label>
          <Textarea
            id="notes"
            rows={2}
            placeholder="Optioneel, bijv. kleur of extra info"
            {...form.register("notes")}
          />
        </FormField>
      </FormSection>

      {errorMessage && (
        <p className="text-[14px] text-red-600">{errorMessage}</p>
      )}

      <Button type="submit" disabled={isSaving}>
        <Save className="h-4 w-4" />
        {isSaving ? "Opslaan..." : "Verkoop opslaan"}
      </Button>
    </form>
  );
}
