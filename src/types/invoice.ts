export interface Customer {
  id?: number;
  documentId?: string;
  customerName: string;
  identificationNumber: string;
  email: string;
  phone: string;
}

export interface InvoiceFormData {
  customerName: string;
  identificationNumber: string;
  email: string;
  phone: string;
  scooterType: string;
  warrantyDuration: string;
  scooterCondition: string;
  priceExVat: number;
  vatRate: number;
  invoiceDate: string;
}

export interface InvoiceCalculations {
  vatAmount: number;
  total: number;
}

export interface Invoice extends InvoiceFormData, InvoiceCalculations {
  id?: number;
  documentId?: string;
  invoiceNumber: string;
  customerId?: number;
  customerDocumentId?: string;
}

export interface SaveInvoiceResponse {
  success: boolean;
  invoice?: Invoice;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  details?: string;
}
