import { getSessionFromCookie } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSessionFromCookie();
  if (!session) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({
    authenticated: true,
    session,
  });
}
