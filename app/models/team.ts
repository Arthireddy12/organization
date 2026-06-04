import type { ObjectId } from "mongodb";
import type { BaseDocument } from "./shared";

export type TeamDocument = BaseDocument & {
  name?: string;
  organizationId?: ObjectId | null;
  departmentId?: ObjectId | null;
  createdAt: Date;
};
