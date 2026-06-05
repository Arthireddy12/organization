export type DatabaseRecord = {
  id: string;
  [key: string]: unknown;
};

export type OrganizationRecord = DatabaseRecord & {
  name: string;
  email?: string | null;
  phone?: string | null;
  industry?: string | null;
  address?: string | null;
  adminName?: string | null;
  adminEmail?: string | null;
  adminPhone?: string | null;
  adminDesignation?: string | null;
  slug?: string | null;
  tenantDatabase?: string | null;
  planName?: string | null;
  userLimit?: number | null;
  isActive: boolean;
  startDate?: Date | null;
  autoDeactivateDate?: Date | null;
  moduleAccess?: unknown;
  apiAccess?: boolean | null;
  customBranding?: boolean | null;
  payrollEnabled?: boolean | null;
  attendanceEnabled?: boolean | null;
  recruitmentEnabled?: boolean | null;
  storageLimitGb?: number | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type UserRecord = DatabaseRecord & {
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  organizationId?: string | null;
};

export type DepartmentRecord = DatabaseRecord & {
  name: string;
  designations: string[];
  organizationId?: string | null;
};

export type EmployeeRecord = DatabaseRecord & {
  employeeId?: string | null;
  firstName?: string;
  lastName?: string;
  mobile?: string;
  designation?: string;
  organizationId?: string | null;
  userId?: string | null;
  departmentId?: string | null;
};
