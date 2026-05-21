import { getSessionFromCookie } from "@/lib/auth";
import { getPortalOrganizationUsers } from "@/lib/portal-users";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getSessionFromCookie();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizations = await getPortalOrganizationUsers();

    return NextResponse.json({
      organizations,
      totals: {
        organizations: organizations.length,
        users: organizations.reduce((sum, item) => sum + item.userCount, 0),
        employees: organizations.reduce(
          (sum, item) => sum + item.employeeCount,
          0,
        ),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch organization users", details: String(error) },
      { status: 500 },
    );
  }
}
