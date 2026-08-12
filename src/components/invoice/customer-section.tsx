"use client";

import { useFormContext } from "react-hook-form";
import { FormField, FormGrid, FormSection } from "@/components/ui/form-section";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { InvoiceFormValues } from "@/schemas/invoice.schema";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-[13px] text-red-500">{message}</p>;
}

export function CustomerSection() {
  const {
    register,
    formState: { errors },
  } = useFormContext<InvoiceFormValues>();

  return (
    <FormSection title="Klantgegevens">
      <FormField>
        <Label htmlFor="customerName" required>
          Klantnaam
        </Label>
        <Input id="customerName" placeholder="Volledige naam" {...register("customerName")} />
        <FieldError message={errors.customerName?.message} />
      </FormField>

      <FormGrid>
        <FormField>
          <Label htmlFor="identificationNumber" required>
            ID-nummer
          </Label>
          <Input
            id="identificationNumber"
            placeholder="Identificatienummer"
            {...register("identificationNumber")}
          />
          <FieldError message={errors.identificationNumber?.message} />
        </FormField>

        <FormField>
          <Label htmlFor="email" required>
            E-mailadres
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="naam@voorbeeld.nl"
            {...register("email")}
          />
          <FieldError message={errors.email?.message} />
        </FormField>
      </FormGrid>

      <FormField>
        <Label htmlFor="phone" required>
          Telefoonnummer
        </Label>
        <Input
          id="phone"
          type="tel"
          placeholder="06 12345678"
          {...register("phone")}
        />
        <FieldError message={errors.phone?.message} />
      </FormField>
    </FormSection>
  );
}
