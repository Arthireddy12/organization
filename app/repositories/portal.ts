import { COLLECTIONS, getCollection } from "@/app/lib/mongodb/collection";
import type { DepartmentDocument } from "@/app/models/department";
import type { EmployeeDocument } from "@/app/models/employee";
import type { UserDocument } from "@/app/models/user";
import { toObjectId, toPlain } from "@/app/utils/helper";
import { listOrganizations } from "./organization";
import type { DepartmentRecord, EmployeeRecord, UserRecord } from "./types";

export async function listPortalOrganizationUsers() {
  const [users, employees, departments, organizations] = await Promise.all([
    getCollection<UserDocument>(COLLECTIONS.USERS),
    getCollection<EmployeeDocument>(COLLECTIONS.EMPLOYEES),
    getCollection<DepartmentDocument>(COLLECTIONS.DEPARTMENTS),
    listOrganizations(),
  ]);

  return Promise.all(organizations.map(async (organization) => {
    const organizationId = toObjectId(organization.id);
    const userRecords = toPlain(
      organizationId
        ? await users.find({ organizationId }).sort({ createdAt: -1 }).toArray()
        : [],
    ) as UserRecord[];
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
