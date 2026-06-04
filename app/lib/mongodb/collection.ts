import type { Collection, Document } from "mongodb";
import clientPromise from "./db";

export const COLLECTIONS = {
  USERS: "User",
  ORGANIZATIONS: "Organization",
  DEPARTMENTS: "Department",
  EMPLOYEES: "employee",
  TEAMS: "Team",
  SHIFTS: "Shift",
  INVOICES: "Invoice",
} as const;

export async function getCollection<T extends Document>(
  collectionName: string,
): Promise<Collection<T>> {
  if (!collectionName) {
    throw new Error("Collection name is required");
  }

  const client = await clientPromise;
  const databaseName = client.options.dbName;
  if (!databaseName) {
    throw new Error("MASTER_DATABASE_URL must include a database name");
  }

  return client.db(databaseName).collection<T>(collectionName);
}
