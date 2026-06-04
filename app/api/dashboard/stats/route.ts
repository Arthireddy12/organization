import { getDashboardStats } from "@/app/repositories/dashboard";
import { getSessionFromCookie } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getSessionFromCookie();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      totalOrganizations,
      activeOrganizations,
      totalUsers,
      totalDepartments,
      totalEmployees,
      totalTeams,
      totalShifts,
      usersByRole,
      orgsByPlan,
    } = await getDashboardStats();

    return NextResponse.json({
      organizations: {
        total: totalOrganizations,
        active: activeOrganizations,
        inactive: totalOrganizations - activeOrganizations,
      },
      users: {
        total: totalUsers,
        byRole: usersByRole.map((r) => ({
          role: r._id,
          count: r.count,
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
          name: p._id ?? "Starter",
          count: p.count,
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
