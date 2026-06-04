import { COLLECTIONS, getCollection } from "@/app/lib/mongodb/collection";
import type { DepartmentDocument } from "@/app/models/department";
import type { EmployeeDocument } from "@/app/models/employee";
import type { OrganizationDocument } from "@/app/models/organization";
import type { ShiftDocument } from "@/app/models/shift";
import type { TeamDocument } from "@/app/models/team";
import type { UserDocument } from "@/app/models/user";

export async function getDashboardStats() {
  const [organizations, users, departments, employees, teams, shifts] = await Promise.all([
    getCollection<OrganizationDocument>(COLLECTIONS.ORGANIZATIONS),
    getCollection<UserDocument>(COLLECTIONS.USERS),
    getCollection<DepartmentDocument>(COLLECTIONS.DEPARTMENTS),
    getCollection<EmployeeDocument>(COLLECTIONS.EMPLOYEES),
    getCollection<TeamDocument>(COLLECTIONS.TEAMS),
    getCollection<ShiftDocument>(COLLECTIONS.SHIFTS),
  ]);
  const [
    totalOrganizations,
    activeOrganizations,
    totalUsers,
    totalDepartments,
    totalEmployees,
    totalTeams,
    totalShifts,
    usersByRole,
    orgsByPlan,
  ] = await Promise.all([
    organizations.countDocuments(),
    organizations.countDocuments({ isActive: true }),
    users.countDocuments(),
    departments.countDocuments(),
    employees.countDocuments(),
    teams.countDocuments(),
    shifts.countDocuments(),
    users.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]).toArray(),
    organizations.aggregate([{ $group: { _id: "$planName", count: { $sum: 1 } } }]).toArray(),
  ]);

  return {
    totalOrganizations,
    activeOrganizations,
    totalUsers,
    totalDepartments,
    totalEmployees,
    totalTeams,
    totalShifts,
    usersByRole,
    orgsByPlan,
  };
}
