import { COLLECTIONS, getCollection } from "@/app/lib/mongodb/collection";
import type { DepartmentDocument } from "@/app/models/department";
import type { EmployeeDocument } from "@/app/models/employee";
import type { OrganizationDocument } from "@/app/models/organization";
import type { TeamDocument } from "@/app/models/team";
import { toObjectId, toPlain } from "@/app/utils/helper";
import type { DepartmentRecord } from "./types";

export async function listDepartments(organizationId?: string | null) {
  const [departments, organizations, employees, teams] = await Promise.all([
    getCollection<DepartmentDocument>(COLLECTIONS.DEPARTMENTS),
    getCollection<OrganizationDocument>(COLLECTIONS.ORGANIZATIONS),
    getCollection<EmployeeDocument>(COLLECTIONS.EMPLOYEES),
    getCollection<TeamDocument>(COLLECTIONS.TEAMS),
  ]);
  const organizationObjectId = organizationId ? toObjectId(organizationId) : null;
  const departmentRecords = toPlain(
    await departments
      .find(organizationObjectId ? { organizationId: organizationObjectId } : {})
      .sort({ name: 1 })
      .toArray(),
  ) as DepartmentRecord[];
  const organizationIds = departmentRecords
    .map((department) => department.organizationId ? toObjectId(department.organizationId) : null)
    .filter((id): id is NonNullable<typeof id> => id !== null);
  const organizationRecords = toPlain(
    await organizations
      .find({ _id: { $in: organizationIds } }, { projection: { name: 1 } })
      .toArray(),
  ) as Array<{ id: string; name: string }>;
  const organizationsById = new Map(
    organizationRecords.map((organization) => [organization.id, organization]),
  );

  return Promise.all(departmentRecords.map(async (department) => {
    const departmentId = toObjectId(department.id);
    const designations = Array.isArray(department.designations) ? department.designations : [];
    return {
      ...department,
      designations,
      organization: typeof department.organizationId === "string"
        ? organizationsById.get(department.organizationId) ?? null
        : null,
      employeeCount: departmentId ? await employees.countDocuments({ departmentId }) : 0,
      teamCount: departmentId ? await teams.countDocuments({ departmentId }) : 0,
    };
  }));
}
