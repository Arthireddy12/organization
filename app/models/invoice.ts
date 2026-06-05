import type { BaseDocument } from "./shared";

export type InvoiceDocument = BaseDocument & {
  invoiceNumber: string;
  organizationName: string;
  mobileNumber: string;
  address: string;
  gstNumber?: string | null;
  amount: number;
  discount: number;
  gst: number;
  sgst: number;
  taxableAmount: number;
  finalAmount: number;
  createdAt: Date;
  updatedAt: Date;
};
