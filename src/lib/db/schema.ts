import { randomUUID } from "crypto";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const customers = sqliteTable("customers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  documentId: text("document_id")
    .notNull()
    .unique()
    .$defaultFn(() => randomUUID()),
  customerName: text("customer_name").notNull(),
  identificationNumber: text("identification_number").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const invoices = sqliteTable("invoices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  documentId: text("document_id")
    .notNull()
    .unique()
    .$defaultFn(() => randomUUID()),
  invoiceNumber: text("invoice_number").notNull().unique(),
  invoiceDate: text("invoice_date").notNull(),
  scooterType: text("scooter_type").notNull(),
  warrantyDuration: text("warranty_duration").notNull(),
  scooterCondition: text("scooter_condition").notNull(),
  priceExVat: real("price_ex_vat").notNull(),
  vatRate: real("vat_rate").notNull(),
  vatAmount: real("vat_amount").notNull(),
  total: real("total").notNull(),
  customerId: integer("customer_id")
    .notNull()
    .references(() => customers.id),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});
