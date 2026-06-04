import { ObjectId } from "mongodb";

export function toObjectId(value: string) {
  return ObjectId.isValid(value) ? new ObjectId(value) : null;
}

export function toPlain(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((item) => toPlain(item));
  if (value instanceof ObjectId) return value.toString();
  if (value instanceof Date || value === null || typeof value !== "object") return value;

  const result: Record<string, unknown> = {};
  Object.entries(value as Record<string, unknown>).forEach(([key, item]) => {
    if (key === "__v") return;
    if (key === "_id") result.id = toPlain(item);
    else result[key] = toPlain(item);
  });
  return result;
}

export function isDuplicateKeyError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === 11000;
}
