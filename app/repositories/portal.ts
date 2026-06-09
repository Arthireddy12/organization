import { COLLECTIONS, getCollection } from "@/app/lib/mongodb/collection";
import type { DepartmentDocument } from "@/app/models/department";
import type { EmployeeDocument } from "@/app/models/employee";
import { toObjectId, toPlain } from "@/app/utils/helper";
import { listOrganizations } from "./organization";
import { listTenantUsersByOrganizationId } from "./user";
import type { DepartmentRecord, EmployeeRecord, UserRecord } from "./types";

export async function listPortalOrganizationUsers() {
  const [employees, departments, organizations] = await Promise.all([
    getCollection<EmployeeDocument>(COLLECTIONS.EMPLOYEES),
    getCollection<DepartmentDocument>(COLLECTIONS.DEPARTMENTS),
    listOrganizations(),
  ]);

  return Promise.all(organizations.map(async (organization) => {
    const organizationId = toObjectId(organization.id);
    const userRecords = organization.tenantDatabase
      ? await listTenantUsersByOrganizationId(organization.id)
      : [] as UserRecord[];
    const employeeRecords = toPlain(
      organizationId ? await employees.find({ organizationId }).toArray() : [],
    ) as EmployeeRecord[];
    const departmentIds = employeeRecords
      .map((employee) => employee.departmentId ? toObjectId(employee.departmentId) : null)
      .filter((id): id is NonNullable<typeof id> => id !== null);
    const departmentRecords = toPlain(
      await departments
        .find({ _id: { $in: departmentIds } }, { projection: { name: 1 } })
        .toArray(),
    ) as DepartmentRecord[];
    const departmentsById = new Map(
      departmentRecords.map((department) => [department.id, department]),
    );

    return {
      organization,
      users: userRecords,
      employees: employeeRecords,
      departmentsById,
    };
  }));
}
