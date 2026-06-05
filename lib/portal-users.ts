import { listPortalOrganizationUsers } from "@/app/repositories/portal";

export type PortalOrganizationUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  employee: {
    id: string;
    employeeId: string | null;
    fullName: string;
    phone: string;
    designation: string;
    department: string;
  } | null;
};

export type PortalOrganizationUsers = {
  id: string;
  name: string;
  slug: string;
  planName: string;
  isActive: boolean;
  userCount: number;
  employeeCount: number;
  users: PortalOrganizationUser[];
};

export async function getPortalOrganizationUsers(): Promise<
  PortalOrganizationUsers[]
> {
  const organizationData = await listPortalOrganizationUsers();
  return organizationData.map(({ organization, users, employees, departmentsById }) => {
    return {
      id: organization.id,
      name: String(organization.name),
      slug: String(organization.slug ?? ""),
      planName: String(organization.planName ?? "Starter"),
      isActive: organization.isActive !== false,
      userCount: users.length,
      employeeCount: employees.length,
      users: users.map((user) => {
        const employee = employees.find(
          (item) => String(item.userId ?? "") === user.id,
        );
        const department = employee?.departmentId
          ? departmentsById.get(employee.departmentId)
          : null;

        return {
          id: user.id,
          name: String(user.name),
          email: String(user.email),
          role: String(user.role),
          createdAt: new Date(user.createdAt as Date).toISOString(),
          employee: employee
            ? {
                id: employee.id,
                employeeId: employee.employeeId ? String(employee.employeeId) : null,
                fullName: `${String(employee.firstName ?? "")} ${String(employee.lastName ?? "")}`.trim(),
                phone: String(employee.mobile ?? ""),
                designation: String(employee.designation ?? ""),
                department: String(department?.name ?? ""),
              }
            : null,
        };
      }),
    };
  });
}
