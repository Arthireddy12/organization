import { prisma } from "@/lib/prisma";
import { getAuthCookieName, signSessionToken } from "@/lib/auth";
import { hash } from "bcryptjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type SignupBody = {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SignupBody;
    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password ?? "";
    const role = body.role?.trim() || "SUPER_ADMIN";

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "name, email and password are required" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "password must be at least 8 characters" },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: "User already exists with this email" },
        { status: 409 },
      );
    }

    const now = new Date();
    const passwordHash = await hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
        role,
        createdAt: now,
      },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
      },
    });

    const token = await signSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const cookieStore = await cookies();
    cookieStore.set(getAuthCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({
      message: "Signup successful",
      user,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to signup", details: String(error) },
      { status: 500 },
    );
  }
}
