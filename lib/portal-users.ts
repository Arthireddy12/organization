import { prisma } from "@/lib/prisma";

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
  const organizations = await prisma.organization.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      planName: true,
      isActive: true,
      users: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          employee: {
            select: {
              id: true,
              employeeId: true,
              firstName: true,
              lastName: true,
              mobile: true,
              designation: true,
              department: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
      employees: {
        select: { id: true },
      },
    },
  });

  return organizations.map((organization) => ({
    id: organization.id,
    name: organization.name,
    slug: organization.slug ?? "",
    planName: organization.planName ?? "Starter",
    isActive: organization.isActive,
    userCount: organization.users.length,
    employeeCount: organization.employees.length,
    users: organization.users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      employee: user.employee
        ? {
            id: user.employee.id,
            employeeId: user.employee.employeeId,
            fullName: `${user.employee.firstName} ${user.employee.lastName}`.trim(),
            phone: user.employee.mobile,
            designation: user.employee.designation,
            department: user.employee.department.name,
          }
        : null,
    })),
  }));
}
