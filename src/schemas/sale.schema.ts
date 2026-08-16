import { z } from "zod";

export const saleFormSchema = z.object({
  soldOn: z.string().min(1, "Datum is verplicht"),
  item: z.string().trim().min(1, "Wat u verkocht heeft is verplicht"),
  customerName: z.string().trim(),
  amount: z.coerce
    .number({ invalid_type_error: "Bedrag moet een getal zijn" })
    .min(0, "Bedrag moet 0 of hoger zijn"),
  notes: z.string().trim(),
});

export type SaleFormValues = z.infer<typeof saleFormSchema>;
