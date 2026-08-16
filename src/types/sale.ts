export type SaleSource = "manual" | "invoice" | "receipt";

export interface Sale {
  id: number;
  documentId: string;
  soldOn: string;
  item: string;
  customerName: string;
  amount: number;
  notes: string;
}

export interface SaleLogEntry {
  key: string;
  soldOn: string;
  item: string;
  customerName: string;
  amount: number;
  notes: string;
  source: SaleSource;
  href?: string;
  canDelete?: boolean;
}
