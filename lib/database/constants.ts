export const roles = ["SUPER_ADMIN", "ADMIN", "HR", "EMPLOYEE"] as const;
export type Role = (typeof roles)[number];
