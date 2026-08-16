import { z } from "zod";
import { PAYMENT_METHODS } from "@/types/receipt";

export const receiptFormSchema = z.object({
  customerName: z.string().trim().min(1, "Naam is verplicht"),
  identificationNumber: z
    .string()
    .trim()
    .min(1, "ID-nummer is verplicht"),
  email: z
    .string()
    .trim()
    .min(1, "E-mailadres is verplicht")
    .email("Voer een geldig e-mailadres in"),
  phone: z.string().trim().min(1, "Telefoonnummer is verplicht"),
  scooterType: z.string().trim().min(1, "Scootertype is verplicht"),
  warrantyDuration: z
    .string()
    .trim()
    .min(1, "Garantieperiode is verplicht"),
  scooterCondition: z
    .string()
    .trim()
    .min(1, "Beschrijving van de staat is verplicht"),
  priceExVat: z.coerce
    .number({ invalid_type_error: "Prijs moet een getal zijn" })
    .min(0, "Prijs moet 0 of hoger zijn"),
  vatRate: z.coerce
    .number({ invalid_type_error: "BTW-percentage moet een getal zijn" })
    .min(0, "BTW-percentage moet 0 of hoger zijn")
    .max(100, "BTW-percentage mag niet hoger zijn dan 100"),
  paymentDate: z.string().min(1, "Betaaldatum is verplicht"),
  paymentMethod: z.enum(PAYMENT_METHODS, {
    errorMap: () => ({ message: "Betaalwijze is verplicht" }),
  }),
});

export type ReceiptFormValues = z.infer<typeof receiptFormSchema>;

export const defaultReceiptFormValues: ReceiptFormValues = {
  customerName: "",
  identificationNumber: "",
  email: "",
  phone: "",
  scooterType: "",
  warrantyDuration: "",
  scooterCondition: "",
  priceExVat: 0,
  vatRate: 21,
  paymentDate: "",
  paymentMethod: "Bancontact",
};
