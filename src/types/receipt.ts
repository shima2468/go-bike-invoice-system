export const PAYMENT_METHODS = [
  "Cash",
  "Bancontact",
  "Overschrijving",
  "Overig",
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export interface ReceiptFormData {
  customerName: string;
  identificationNumber: string;
  email: string;
  phone: string;
  scooterType: string;
  warrantyDuration: string;
  scooterCondition: string;
  priceExVat: number;
  vatRate: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
}

export interface Receipt extends ReceiptFormData {
  id?: number;
  documentId?: string;
  receiptNumber: string;
  vatAmount: number;
  total: number;
  customerId?: number;
  customerDocumentId?: string;
}
