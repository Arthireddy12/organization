import type { ObjectId } from "mongodb";
import type { BaseDocument } from "./shared";

export type EmployeeDocument = BaseDocument & {
  employeeId?: string | null;
  firstName?: string;
  lastName?: string;
  mobile?: string;
  image?: string | null;
  designation?: string;
  organizationId?: ObjectId | null;
  userId?: ObjectId | null;
  departmentId?: ObjectId | null;
  teamId?: ObjectId | null;
  shiftId?: ObjectId | null;
  createdAt: Date;
};
