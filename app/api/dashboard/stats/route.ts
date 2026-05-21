import { prisma } from "@/lib/prisma";
import { getSessionFromCookie } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getSessionFromCookie();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [
      totalOrganizations,
      activeOrganizations,
      totalUsers,
      totalDepartments,
      totalEmployees,
      totalTeams,
      totalShifts,
    ] = await Promise.all([
      prisma.organization.count(),
      prisma.organization.count({ where: { isActive: true } }),
      prisma.user.count(),
      prisma.department.count(),
      prisma.employee.count(),
      prisma.team.count(),
      prisma.shift.count(),
    ]);

    // Get user distribution by role
    const usersByRole = await prisma.user.groupBy({
      by: ["role"],
      _count: { id: true },
    });

    // Get organization plan distribution
    const orgsByPlan = await prisma.organization.groupBy({
      by: ["planName"],
      _count: { id: true },
    });

    return NextResponse.json({
      organizations: {
        total: totalOrganizations,
        active: activeOrganizations,
        inactive: totalOrganizations - activeOrganizations,
      },
      users: {
        total: totalUsers,
        byRole: usersByRole.map((r) => ({
          role: r.role,
          count: r._count.id,
        })),
      },
      departments: {
        total: totalDepartments,
      },
      employees: {
        total: totalEmployees,
      },
      teams: {
        total: totalTeams,
      },
      shifts: {
        total: totalShifts,
      },
      plans: {
        byName: orgsByPlan.map((p) => ({
          name: p.planName ?? "Starter",
          count: p._count.id,
        })),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats", details: String(error) },
      { status: 500 },
    );
  }
}
