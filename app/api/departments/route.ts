import { prisma } from "@/lib/prisma";
import { getSessionFromCookie } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await getSessionFromCookie();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");

    const departments = await prisma.department.findMany({
      where: organizationId ? { organizationId } : undefined,
      orderBy: { name: "asc" },
      include: {
        organization: {
          select: { id: true, name: true },
        },
        _count: {
          select: {
            employees: true,
            teams: true,
          },
        },
      },
    });

    return NextResponse.json(
      departments.map((dept) => ({
        id: dept.id,
        name: dept.name,
        designations: dept.designations,
        organizationId: dept.organizationId,
        organization: dept.organization,
        employeeCount: dept._count.employees,
        teamCount: dept._count.teams,
      })),
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch departments", details: String(error) },
      { status: 500 },
    );
  }
}
