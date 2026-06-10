import { roles } from "@/lib/database/constants";
import { listTenantUsersByOrganizationId, listUsers } from "@/app/repositories/user";
import { getSessionFromCookie } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await getSessionFromCookie();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");
    const role = searchParams.get("role");
    const roleFilter = role && roles.includes(role as typeof roles[number])
      ? role
      : undefined;

    if (organizationId) {
      return NextResponse.json(
        await listTenantUsersByOrganizationId(organizationId, { role: roleFilter }),
      );
    }

    return NextResponse.json(await listUsers({ role: roleFilter }));
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch users", details: String(error) },
      { status: 500 },
    );
  }
}
