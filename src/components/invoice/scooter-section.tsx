"use client";

import { useFormContext } from "react-hook-form";
import { FormField, FormGrid, FormSection } from "@/components/ui/form-section";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { InvoiceFormValues } from "@/schemas/invoice.schema";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-[13px] text-red-500">{message}</p>;
}

export function ScooterSection() {
  const {
    register,
    formState: { errors },
  } = useFormContext<InvoiceFormValues>();

  return (
    <FormSection title="Scootergegevens">
      <FormGrid>
        <FormField>
          <Label htmlFor="scooterType" required>
            Scootertype
          </Label>
          <Input id="scooterType" placeholder="Merk en model" {...register("scooterType")} />
          <FieldError message={errors.scooterType?.message} />
        </FormField>

        <FormField>
          <Label htmlFor="warrantyDuration" required>
            Garantieperiode
          </Label>
          <Input
            id="warrantyDuration"
            placeholder="bijv. 6 maanden"
            {...register("warrantyDuration")}
          />
          <FieldError message={errors.warrantyDuration?.message} />
        </FormField>
      </FormGrid>

      <FormField>
        <Label htmlFor="scooterCondition" required>
          Beschrijving van de staat van de scooter
        </Label>
        <Textarea
          id="scooterCondition"
          rows={4}
          placeholder="Beschrijf de huidige staat van de scooter..."
          {...register("scooterCondition")}
        />
        <FieldError message={errors.scooterCondition?.message} />
      </FormField>
    </FormSection>
  );
}
