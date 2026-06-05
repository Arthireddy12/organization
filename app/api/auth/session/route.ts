import { getSessionFromCookie } from "@/lib/auth";
import { findUserById } from "@/app/repositories/user";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSessionFromCookie();
  if (!session) {
    return NextResponse.json({ authenticated: false });
  }

  // Fetch full user info including name from the database
  const user = await findUserById(session.userId, "name email role");

  if (!user) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}
