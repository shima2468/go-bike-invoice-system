"use client";

import { useFormContext } from "react-hook-form";
import { FormField, FormGrid, FormSection } from "@/components/ui/form-section";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/invoice-formatting";
import type { InvoiceFormValues } from "@/schemas/invoice.schema";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-[13px] text-red-500">{message}</p>;
}

export function PricingSection({
  vatAmount,
  total,
}: {
  vatAmount: number;
  total: number;
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext<InvoiceFormValues>();

  return (
    <FormSection title="Prijs en BTW">
      <FormGrid>
        <FormField>
          <Label htmlFor="priceExVat" required>
            Prijs excl. btw
          </Label>
          <Input
            id="priceExVat"
            type="number"
            min={0}
            step="0.01"
            placeholder="0,00"
            {...register("priceExVat")}
          />
          <FieldError message={errors.priceExVat?.message} />
        </FormField>

        <FormField>
          <Label htmlFor="vatRate" required>
            BTW %
          </Label>
          <Input
            id="vatRate"
            type="number"
            min={0}
            max={100}
            step="0.01"
            placeholder="21"
            {...register("vatRate")}
          />
          <FieldError message={errors.vatRate?.message} />
        </FormField>
      </FormGrid>

      <FormField>
        <Label htmlFor="vatAmount">BTW-bedrag</Label>
        <Input
          id="vatAmount"
          readOnly
          value={formatCurrency(vatAmount)}
          className="font-medium text-muted"
          tabIndex={-1}
        />
      </FormField>

      <FormField className="bg-brand-accent/40">
        <Label htmlFor="total">Totaal incl. btw</Label>
        <Input
          id="total"
          readOnly
          value={formatCurrency(total)}
          className="bg-transparent text-xl font-bold text-brand-primary focus:ring-0"
          tabIndex={-1}
        />
      </FormField>
    </FormSection>
  );
}
