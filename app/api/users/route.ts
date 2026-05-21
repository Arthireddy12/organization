import { prisma } from "@/lib/prisma";
import { getSessionFromCookie } from "@/lib/auth";
import { Role } from "@prisma/client";
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
    const roleFilter = role && Object.values(Role).includes(role as Role)
      ? (role as Role)
      : undefined;

    const users = await prisma.user.findMany({
      where: {
        ...(organizationId ? { organizationId } : {}),
        ...(roleFilter ? { role: roleFilter } : {}),
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        organizationId: true,
        organization: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch users", details: String(error) },
      { status: 500 },
    );
  }
}
