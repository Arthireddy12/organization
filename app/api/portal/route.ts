import { prisma } from "@/lib/prisma";
import { getSessionFromCookie } from "@/lib/auth";
import { NextResponse } from "next/server";
import {
  ensureOrganizationSlugs,
  normalizeModuleAccessToArray,
  normalizeModuleAccessToObject,
} from "@/lib/organization";
import { hash } from "bcryptjs";

type CreateOrganizationBody = {
  organizationName?: string;
  planName?: string;
  userLimit?: number;
  moduleAccess?: string[] | Record<string, boolean>;
  autoDeactivateDate?: string | null;
  superAdminName?: string;
  superAdminEmail?: string;
  superAdminPassword?: string;
};

function slugifyOrganizationName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function mapOrgToPayload(org: {
  id: string;
  name: string;
  slug: string | null;
  createdAt: Date;
  updatedAt: Date;
  planName: string | null;
  userLimit: number | null;
  isActive: boolean;
  startDate: Date | null;
  autoDeactivateDate: Date | null;
  moduleAccess: unknown;
  storageLimitGb: number | null;
  apiAccess: boolean;
  customBranding: boolean;
  payrollEnabled: boolean;
  attendanceEnabled: boolean;
  recruitmentEnabled: boolean;
  notes: string | null;
}) {
  return {
    id: org.id,
    name: org.name,
    slug: org.slug,
    createdAt: org.createdAt,
    updatedAt: org.updatedAt,
    portal: {
      id: org.id,
      planName: org.planName ?? "Starter",
      userLimit: org.userLimit ?? 25,
      moduleAccess: normalizeModuleAccessToArray(org.moduleAccess),
      isActive: org.isActive,
      startDate: org.startDate,
      autoDeactivateDate: org.autoDeactivateDate,
      storageLimitGb: org.storageLimitGb,
      apiAccess: org.apiAccess,
      customBranding: org.customBranding,
      payrollEnabled: org.payrollEnabled,
      attendanceEnabled: org.attendanceEnabled,
      recruitmentEnabled: org.recruitmentEnabled,
      notes: org.notes,
    },
  };
}

export async function GET() {
  try {
    const session = await getSessionFromCookie();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureOrganizationSlugs();

    const organizations = await prisma.organization.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    const payload = organizations.map(mapOrgToPayload);

    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch organizations", details: String(error) },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionFromCookie();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as CreateOrganizationBody;

    const organizationName = body.organizationName?.trim();
    const planName = body.planName?.trim() || "Starter";
    const userLimit = Number(body.userLimit ?? 25);
    const moduleAccess = normalizeModuleAccessToObject(body.moduleAccess ?? []);
    const superAdminName = body.superAdminName?.trim();
    const superAdminEmail = body.superAdminEmail?.trim().toLowerCase();
    const superAdminPassword = body.superAdminPassword ?? "";
    const autoDeactivateDateInput = body.autoDeactivateDate ?? null;

    if (!organizationName) {
      return NextResponse.json(
        { error: "organizationName is required" },
        { status: 400 },
      );
    }
    if (!superAdminName || !superAdminEmail || !superAdminPassword) {
      return NextResponse.json(
        {
          error:
            "superAdminName, superAdminEmail and superAdminPassword are required",
        },
        { status: 400 },
      );
    }
    if (superAdminPassword.length < 8) {
      return NextResponse.json(
        { error: "superAdminPassword must be at least 8 characters" },
        { status: 400 },
      );
    }

    if (!Number.isFinite(userLimit) || userLimit < 1) {
      return NextResponse.json(
        { error: "userLimit must be a positive number" },
        { status: 400 },
      );
    }

    const now = new Date();
    let autoDeactivateDate: Date | null = null;
    if (typeof autoDeactivateDateInput === "string" && autoDeactivateDateInput) {
      const parsed = new Date(autoDeactivateDateInput);
      if (Number.isNaN(parsed.getTime())) {
        return NextResponse.json(
          { error: "Invalid subscription end date" },
          { status: 400 },
        );
      }
      autoDeactivateDate = parsed;
    }

    const baseSlug = slugifyOrganizationName(organizationName);
    const slug =
      baseSlug.length > 0
        ? `${baseSlug}-${Date.now().toString(36)}`
        : `org-${Date.now().toString(36)}`;

    const existingUser = await prisma.user.findUnique({
      where: { email: superAdminEmail },
      select: { id: true },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "Super admin email already exists" },
        { status: 409 },
      );
    }

    const passwordHash = await hash(superAdminPassword, 10);

    const created = await prisma.organization.create({
      data: {
        name: organizationName,
        slug,
        createdAt: now,
        updatedAt: now,
        planName,
        userLimit: Math.trunc(userLimit),
        moduleAccess,
        isActive: true,
        startDate: now,
        autoDeactivateDate,
        apiAccess: false,
        customBranding: false,
        payrollEnabled: true,
        attendanceEnabled: true,
        recruitmentEnabled: false,
      },
    });

    await prisma.user.create({
      data: {
        name: superAdminName,
        email: superAdminEmail,
        password: passwordHash,
        role: "SUPER_ADMIN",
        organizationId: created.id,
        createdAt: now,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create organization", details: String(error) },
      { status: 500 },
    );
  }
}
