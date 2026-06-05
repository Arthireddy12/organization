import type { ObjectId } from "mongodb";
import type { BaseDocument } from "./shared";

export type DepartmentDocument = BaseDocument & {
  name: string;
  designations: string[];
  organizationId?: ObjectId | null;
};
