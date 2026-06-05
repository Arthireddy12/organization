import { listDepartments } from "@/app/repositories/department";
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

    return NextResponse.json(await listDepartments(organizationId));
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch departments", details: String(error) },
      { status: 500 },
    );
  }
}
