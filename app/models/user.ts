import type { ObjectId } from "mongodb";
import type { Role } from "@/lib/database/constants";
import type { BaseDocument } from "./shared";

export type UserDocument = BaseDocument & {
  name: string;
  email: string;
  password: string;
  role: Role;
  organizationId?: ObjectId | null;
  resetOtpHash?: string | null;
  resetOtpExpiresAt?: Date | null;
  resetOtpRequestedAt?: Date | null;
  createdAt: Date;
};
