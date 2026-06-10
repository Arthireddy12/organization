import {
  createOrganization,
  deleteOrganizationById,
  findOrganizationByAny,
  listOrganizations,
  updateOrganizationById,
} from "@/app/repositories/organization";
import { createTenantUser } from "@/app/repositories/user";
import {
  createTenantDatabaseName,
  dropTenantDatabase,
  provisionTenantDatabase,
} from "@/app/lib/mongodb/tenant";
import { isDuplicateKeyError } from "@/app/utils/helper";
import { getSessionFromCookie } from "@/lib/auth";
import { ensureOrganizationSlugs } from "@/lib/organization-server";
import { NextResponse } from "next/server";
import {
  buildSystemDomain,
  normalizeCustomDomain,
  type ModuleAccessObject,
  normalizeModuleAccessToArray,
  normalizeModuleAccessToObject,
} from "@/lib/organization";
import {
  normalizeOrganizationRoleAccessSetup,
  type OrganizationRoleAccessSetup,
} from "@/lib/organization-role-access";
import {
  normalizeOrganizationAttributeSetup,
  type OrganizationAttributeSetup,
} from "@/lib/organization-attributes";
import {
  normalizeOrganizationGroupDefinitionSetup,
  type OrganizationGroupDefinitionSetup,
} from "@/lib/organization-group-definition";
import {
  normalizeOrganizationPacketSetup,
  type OrganizationPacketSetup,
} from "@/lib/organization-packets";
import {
  buildOrganizationAddressFromSetupProfile,
  normalizeOrganizationSetupProfile,
  type OrganizationSetupProfile,
} from "@/lib/organization-setup";
import { hash } from "bcryptjs";

type CreateOrganizationBody = {
  organizationName?: string;
  organizationEmail?: string;
  phoneNumber?: string;
  industry?: string;
  address?: string;
  adminPhone?: string;
  designation?: string;
  systemDomain?: string;
  customDomain?: string | null;
  moduleAccess?: string[] | Record<string, boolean> | ModuleAccessObject;
  autoDeactivateDate?: string | null;
  superAdminName?: string;
  superAdminEmail?: string;
  superAdminPassword?: string;
  setupProfile?: OrganizationSetupProfile;
  attributeSetup?: OrganizationAttributeSetup;
  roleAccessSetup?: OrganizationRoleAccessSetup;
  groupDefinitionSetup?: OrganizationGroupDefinitionSetup;
  packetSetup?: OrganizationPacketSetup;
};

function slugifyOrganizationName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function getTodayDateInputValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isPastDateInput(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? value < getTodayDateInputValue()
    : new Date(value).getTime() < new Date(getTodayDateInputValue()).getTime();
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
  systemDomain: string | null;
  customDomain: string | null;
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
  setupProfile: OrganizationSetupProfile | null;
  attributeSetup: OrganizationAttributeSetup | null;
  roleAccessSetup: OrganizationRoleAccessSetup | null;
  groupDefinitionSetup: OrganizationGroupDefinitionSetup | null;
  packetSetup: OrganizationPacketSetup | null;
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
    systemDomain: org.systemDomain,
    customDomain: org.customDomain,
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
      setupProfile: org.setupProfile ?? null,
      attributeSetup: org.attributeSetup ?? null,
      roleAccessSetup: org.roleAccessSetup ?? null,
      groupDefinitionSetup: org.groupDefinitionSetup ?? null,
      packetSetup: org.packetSetup ?? null,
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

    const organizations = await listOrganizations() as Parameters<typeof mapOrgToPayload>[0][];

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
    const normalizedSetupProfile = normalizeOrganizationSetupProfile(body.setupProfile);
    const normalizedAttributeSetup = normalizeOrganizationAttributeSetup(body.attributeSetup);
    const normalizedRoleAccessSetup = normalizeOrganizationRoleAccessSetup(body.roleAccessSetup);
    const normalizedGroupDefinitionSetup = normalizeOrganizationGroupDefinitionSetup(
      body.groupDefinitionSetup,
    );
    const normalizedPacketSetup = normalizeOrganizationPacketSetup(body.packetSetup);
    const address =
      buildOrganizationAddressFromSetupProfile(normalizedSetupProfile) ||
      body.address?.trim();
    const adminPhone = body.adminPhone?.trim();
    const designation = body.designation?.trim();
    const systemDomain = buildSystemDomain(body.systemDomain ?? "");
    const customDomain = normalizeCustomDomain(body.customDomain);
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
    const hasSystemDomain = Boolean(systemDomain);
    const hasCustomDomain = Boolean(customDomain);

    if (hasSystemDomain === hasCustomDomain) {
      return NextResponse.json(
        { error: "Select either systemDomain or customDomain, but not both" },
        { status: 400 },
      );
    }
    if (customDomain && systemDomain && customDomain === systemDomain) {
      return NextResponse.json(
        { error: "customDomain must be different from systemDomain" },
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
      if (isPastDateInput(autoDeactivateDateInput)) {
        return NextResponse.json(
          { error: "Subscription end date cannot be before today" },
          { status: 400 },
        );
      }
      autoDeactivateDate = parsed;
    }

    const baseSlug = slugifyOrganizationName(organizationName);
    const slug = baseSlug.length > 0 ? baseSlug : `org-${Date.now().toString(36)}`;

    const existingOrganization = await findOrganizationByAny([
          { name: organizationName },
          { email: organizationEmail },
          { adminEmail: superAdminEmail },
          { slug },
          ...(systemDomain
            ? [{ systemDomain }, { customDomain: systemDomain }]
            : []),
          ...(customDomain ? [{ customDomain }, { systemDomain: customDomain }] : []),
    ]);
    if (existingOrganization) {
      return NextResponse.json(
        { error: "Organization, admin email, or domain already exists" },
        { status: 409 },
      );
    }

    const passwordHash = await hash(superAdminPassword, 10);

    let created = await createOrganization({
        name: organizationName,
        email: organizationEmail,
        phone: phoneNumber,
        industry,
        address,
        adminName: superAdminName,
        adminEmail: superAdminEmail,
        adminPhone,
        adminDesignation: designation,
        setupProfile: normalizedSetupProfile,
        attributeSetup: normalizedAttributeSetup,
        roleAccessSetup: normalizedRoleAccessSetup,
        groupDefinitionSetup: normalizedGroupDefinitionSetup,
        packetSetup: normalizedPacketSetup,
        slug,
        systemDomain,
        customDomain,
        createdAt: now,
        updatedAt: now,
        userLimit,
        moduleAccess,
        isActive: true,
        startDate: now,
        autoDeactivateDate,
    }) as Parameters<typeof mapOrgToPayload>[0] & { tenantDatabase?: string };

    const tenantDatabase = createTenantDatabaseName(
      systemDomain || customDomain || organizationName,
      created.id,
    );

    try {
      await provisionTenantDatabase(tenantDatabase, { id: created.id, slug });
      console.info("Tenant database created", {
        organizationName,
        organizationId: created.id,
        tenantDatabase,
      });
      created = await updateOrganizationById(created.id, { tenantDatabase }) as typeof created;

      await createTenantUser(tenantDatabase, {
        name: superAdminName,
        email: superAdminEmail,
        password: passwordHash,
        role: "SUPER_ADMIN",
        organizationId: created.id,
        createdAt: now,
      });

    } catch (userCreateError) {
      await deleteOrganizationById(created.id);
      await dropTenantDatabase(tenantDatabase).catch(() => undefined);
      if (isDuplicateKeyError(userCreateError)) {
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
