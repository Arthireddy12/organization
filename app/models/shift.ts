import type { ObjectId } from "mongodb";
import type { BaseDocument } from "./shared";

export type ShiftDocument = BaseDocument & {
  name?: string;
  organizationId?: ObjectId | null;
  startTime?: string;
  endTime?: string;
  bufferMins: number;
  isNight: boolean;
};
