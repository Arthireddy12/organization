import { COLLECTIONS, getCollection } from "@/app/lib/mongodb/collection";
import type { InvoiceDocument } from "@/app/models/invoice";
import { toObjectId, toPlain } from "@/app/utils/helper";
import type { DatabaseRecord } from "./types";

export async function listInvoices(limit?: number) {
  const invoices = await getCollection<InvoiceDocument>(COLLECTIONS.INVOICES);
  const query = invoices.find().sort({ createdAt: -1 });
  if (limit) query.limit(limit);
  return toPlain(await query.toArray()) as DatabaseRecord[];
}

export async function findInvoiceById(id: string) {
  const objectId = toObjectId(id);
  if (!objectId) return null;
  const invoices = await getCollection<InvoiceDocument>(COLLECTIONS.INVOICES);
  return toPlain(await invoices.findOne({ _id: objectId })) as DatabaseRecord | null;
}

export async function createInvoice(data: Record<string, unknown>) {
  const invoices = await getCollection<InvoiceDocument>(COLLECTIONS.INVOICES);
  const now = new Date();
  const invoice = {
    gstNumber: null,
    discount: 0,
    gst: 0,
    sgst: 0,
    createdAt: now,
    updatedAt: now,
    ...data,
  } as unknown as InvoiceDocument;
  const result = await invoices.insertOne(invoice);
  return toPlain({ ...invoice, _id: result.insertedId }) as DatabaseRecord;
}

export async function updateInvoiceById(id: string, updates: Record<string, unknown>) {
  const objectId = toObjectId(id);
  if (!objectId) return null;
  const invoices = await getCollection<InvoiceDocument>(COLLECTIONS.INVOICES);
  return toPlain(
    await invoices.findOneAndUpdate(
      { _id: objectId },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: "after" },
    ),
  ) as DatabaseRecord | null;
}

export async function deleteInvoiceById(id: string) {
  const objectId = toObjectId(id);
  if (!objectId) return null;
  const invoices = await getCollection<InvoiceDocument>(COLLECTIONS.INVOICES);
  return invoices.findOneAndDelete({ _id: objectId });
}
