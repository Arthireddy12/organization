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
  organizationEmail?: string;
  phoneNumber?: string;
  industry?: string;
  address?: string;
  adminPhone?: string;
  designation?: string;
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
  email: string | null;
  phone: string | null;
  industry: string | null;
  address: string | null;
  adminName: string | null;
  adminEmail: string | null;
  adminPhone: string | null;
  adminDesignation: string | null;
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
  apiAccess: boolean | null;
  customBranding: boolean | null;
  payrollEnabled: boolean | null;
  attendanceEnabled: boolean | null;
  recruitmentEnabled: boolean | null;
  notes: string | null;
}) {
  return {
    id: org.id,
    name: org.name,
    email: org.email,
    phone: org.phone,
    industry: org.industry,
    address: org.address,
    adminName: org.adminName,
    adminEmail: org.adminEmail,
    adminPhone: org.adminPhone,
    adminDesignation: org.adminDesignation,
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
      apiAccess: org.apiAccess ?? false,
      customBranding: org.customBranding ?? false,
      payrollEnabled: org.payrollEnabled ?? true,
      attendanceEnabled: org.attendanceEnabled ?? true,
      recruitmentEnabled: org.recruitmentEnabled ?? false,
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
    const organizationEmail = body.organizationEmail?.trim().toLowerCase();
    const phoneNumber = body.phoneNumber?.trim();
    const industry = body.industry?.trim();
    const address = body.address?.trim();
    const adminPhone = body.adminPhone?.trim();
    const designation = body.designation?.trim();
    const userLimit = 25;
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
    if (!organizationEmail) {
      return NextResponse.json(
        { error: "organizationEmail is required" },
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
    const slug = baseSlug.length > 0 ? baseSlug : `org-${Date.now().toString(36)}`;

    const existingOrganization = await prisma.organization.findFirst({
      where: {
        OR: [
          { name: organizationName },
          { email: organizationEmail },
          { adminEmail: superAdminEmail },
          { slug },
        ],
      },
      select: { id: true },
    });
    if (existingOrganization) {
      return NextResponse.json(
        { error: "Organization already exists" },
        { status: 409 },
      );
    }

    const passwordHash = await hash(superAdminPassword, 10);

    const created = await prisma.organization.create({
      data: {
        name: organizationName,
        email: organizationEmail,
        phone: phoneNumber,
        industry,
        address,
        adminName: superAdminName,
        adminEmail: superAdminEmail,
        adminPhone,
        adminDesignation: designation,
        slug,
        createdAt: now,
        updatedAt: now,
        userLimit,
        moduleAccess,
        isActive: true,
        startDate: now,
        autoDeactivateDate,
      },
    });

    try {
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
    } catch (userCreateError) {
      await prisma.organization.delete({ where: { id: created.id } });
      if (
        typeof userCreateError === "object" &&
        userCreateError !== null &&
        "code" in userCreateError &&
        userCreateError.code === "P2002"
      ) {
        return NextResponse.json(
          {
            error:
              "Admin email already exists. Use a different admin email for this organization.",
          },
          { status: 409 },
        );
      }
      throw userCreateError;
    }

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create organization", details: String(error) },
      { status: 500 },
    );
  }
}
