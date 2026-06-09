import {
  createOrganization,
  findOrganizationByAny,
  findOrganizationById,
  updateOrganizationById,
} from "@/app/repositories/organization";
import { upsertTenantSuperAdminUser } from "@/app/repositories/user";
import {
  createTenantDatabaseName,
  provisionTenantDatabase,
} from "@/app/lib/mongodb/tenant";
import { getSessionFromCookie } from "@/lib/auth";
import { NextResponse } from "next/server";
import {
  buildSystemDomain,
  normalizeCustomDomain,
  normalizeModuleAccessToObject,
  type ModuleAccessObject,
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

type SetupStep = 1 | 2 | 3 | 4 | 5;

type SaveOrganizationSetupStepBody = {
  organizationId?: string;
  step?: number;
  finalize?: boolean;
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

function normalizeStep(value: unknown): SetupStep | null {
  return value === 1 || value === 2 || value === 3 || value === 4 || value === 5
    ? value
    : null;
}

function mergeCompletedSteps(current: unknown, step: SetupStep) {
  const steps = Array.isArray(current)
    ? current.filter((item): item is number => typeof item === "number")
    : [];

  return Array.from(new Set([...steps, step])).sort((left, right) => left - right);
}

function buildStepResponse(organization: {
  id: string;
  setupStatus?: "DRAFT" | "COMPLETED" | null;
  setupCurrentStep?: number | null;
  setupCompletedSteps?: number[] | null;
}) {
  return {
    organizationId: organization.id,
    setupStatus: organization.setupStatus ?? "DRAFT",
    setupCurrentStep: organization.setupCurrentStep ?? 1,
    setupCompletedSteps: organization.setupCompletedSteps ?? [],
  };
}

async function validateStepOnePayload(
  body: SaveOrganizationSetupStepBody,
  excludeOrganizationId?: string,
) {
  const organizationName = body.organizationName?.trim();
  const organizationEmail = body.organizationEmail?.trim().toLowerCase();
  const systemDomain = buildSystemDomain(body.systemDomain ?? "");
  const customDomain = normalizeCustomDomain(body.customDomain);
  const superAdminName = body.superAdminName?.trim();
  const superAdminEmail = body.superAdminEmail?.trim().toLowerCase();
  const superAdminPassword = body.superAdminPassword ?? "";
  const autoDeactivateDateInput = body.autoDeactivateDate ?? null;

  if (!organizationName) {
    throw new Error("organizationName is required");
  }
  if (!organizationEmail) {
    throw new Error("organizationEmail is required");
  }

  const hasSystemDomain = Boolean(systemDomain);
  const hasCustomDomain = Boolean(customDomain);

  if (hasSystemDomain === hasCustomDomain) {
    throw new Error("Select either systemDomain or customDomain, but not both");
  }
  if (customDomain && systemDomain && customDomain === systemDomain) {
    throw new Error("customDomain must be different from systemDomain");
  }
  if (!superAdminName || !superAdminEmail) {
    throw new Error("superAdminName and superAdminEmail are required");
  }
  if (!excludeOrganizationId && !superAdminPassword) {
    throw new Error("superAdminPassword is required");
  }
  if (superAdminPassword && superAdminPassword.length < 8) {
    throw new Error("superAdminPassword must be at least 8 characters");
  }
  if (typeof autoDeactivateDateInput === "string" && autoDeactivateDateInput) {
    const parsed = new Date(autoDeactivateDateInput);
    if (Number.isNaN(parsed.getTime())) {
      throw new Error("Invalid subscription end date");
    }
    if (isPastDateInput(autoDeactivateDateInput)) {
      throw new Error("Subscription end date cannot be before today");
    }
  }

  const slug = slugifyOrganizationName(organizationName);
  const existingOrganization = await findOrganizationByAny(
    [
      { name: organizationName },
      { email: organizationEmail },
      { adminEmail: superAdminEmail },
      { slug: slug.length > 0 ? slug : `org-${Date.now().toString(36)}` },
      ...(systemDomain ? [{ systemDomain }, { customDomain: systemDomain }] : []),
      ...(customDomain ? [{ customDomain }, { systemDomain: customDomain }] : []),
    ],
    excludeOrganizationId,
  );

  if (existingOrganization) {
    throw new Error("Organization, admin email, or domain already exists");
  }

  return {
    organizationName,
    organizationEmail,
    superAdminName,
    superAdminEmail,
    superAdminPassword,
    systemDomain,
    customDomain,
    autoDeactivateDateInput,
    slug: slug.length > 0 ? slug : `org-${Date.now().toString(36)}`,
  };
}

export async function POST(request: Request) {
  try {
    const session = await getSessionFromCookie();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as SaveOrganizationSetupStepBody;
    const step = normalizeStep(body.step);

    if (!step) {
      return NextResponse.json({ error: "Valid step is required" }, { status: 400 });
    }

    const normalizedSetupProfile = normalizeOrganizationSetupProfile(body.setupProfile);
    const normalizedAttributeSetup = normalizeOrganizationAttributeSetup(body.attributeSetup);
    const normalizedRoleAccessSetup = normalizeOrganizationRoleAccessSetup(body.roleAccessSetup);
    const normalizedGroupDefinitionSetup = normalizeOrganizationGroupDefinitionSetup(
      body.groupDefinitionSetup,
    );
    const normalizedPacketSetup = normalizeOrganizationPacketSetup(body.packetSetup);
    const moduleAccess = normalizeModuleAccessToObject(body.moduleAccess ?? []);

    if (step === 1) {
      const validated = await validateStepOnePayload(body, body.organizationId);
      const address =
        buildOrganizationAddressFromSetupProfile(normalizedSetupProfile) ||
        body.address?.trim() ||
        "";
      const autoDeactivateDate =
        typeof validated.autoDeactivateDateInput === "string" &&
        validated.autoDeactivateDateInput
          ? new Date(validated.autoDeactivateDateInput)
          : null;
      const now = new Date();

      if (!body.organizationId) {
        const created = await createOrganization({
          name: validated.organizationName,
          email: validated.organizationEmail,
          phone: body.phoneNumber?.trim() ?? "",
          industry: body.industry?.trim() ?? "",
          address,
          adminName: validated.superAdminName,
          adminEmail: validated.superAdminEmail,
          adminPhone: body.adminPhone?.trim() ?? "",
          adminDesignation: body.designation?.trim() ?? "",
          setupProfile: normalizedSetupProfile,
          attributeSetup: normalizedAttributeSetup,
          roleAccessSetup: normalizedRoleAccessSetup,
          groupDefinitionSetup: normalizedGroupDefinitionSetup,
          packetSetup: normalizedPacketSetup,
          slug: validated.slug,
          systemDomain: validated.systemDomain,
          customDomain: validated.customDomain,
          userLimit: 25,
          moduleAccess,
          isActive: true,
          startDate: now,
          autoDeactivateDate,
          setupStatus: "DRAFT",
          setupCurrentStep: 2,
          setupCompletedSteps: [1],
          setupLastSavedAt: now,
        });

        const tenantDatabase = createTenantDatabaseName(
          validated.systemDomain || validated.customDomain || validated.organizationName,
          created.id,
        );
        await provisionTenantDatabase(tenantDatabase, {
          id: created.id,
          slug: validated.slug,
        });

        const passwordHash = await hash(validated.superAdminPassword, 10);
        await updateOrganizationById(created.id, { tenantDatabase });
        await upsertTenantSuperAdminUser(tenantDatabase, {
          organizationId: created.id,
          name: validated.superAdminName,
          email: validated.superAdminEmail,
          password: passwordHash,
        });

        const nextOrganization = await findOrganizationById(created.id);
        if (!nextOrganization) {
          throw new Error("Organization draft was created but could not be reloaded");
        }

        return NextResponse.json(buildStepResponse(nextOrganization), { status: 201 });
      }

      const existingOrganization = await findOrganizationById(body.organizationId);
      if (!existingOrganization) {
        return NextResponse.json({ error: "Organization not found" }, { status: 404 });
      }

      const updates = {
        name: validated.organizationName,
        email: validated.organizationEmail,
        phone: body.phoneNumber?.trim() ?? "",
        industry: body.industry?.trim() ?? "",
        address,
        adminName: validated.superAdminName,
        adminEmail: validated.superAdminEmail,
        adminPhone: body.adminPhone?.trim() ?? "",
        adminDesignation: body.designation?.trim() ?? "",
        setupProfile: normalizedSetupProfile,
        systemDomain: validated.systemDomain,
        customDomain: validated.customDomain,
        autoDeactivateDate,
        setupStatus: body.finalize === true ? "COMPLETED" : "DRAFT",
        setupCurrentStep: body.finalize === true ? 5 : 2,
        setupCompletedSteps: mergeCompletedSteps(existingOrganization.setupCompletedSteps, 1),
        setupLastSavedAt: now,
      };

      const updatedOrganization = await updateOrganizationById(body.organizationId, updates);
      if (!updatedOrganization) {
        return NextResponse.json({ error: "Organization not found" }, { status: 404 });
      }

      if (updatedOrganization.tenantDatabase) {
        await upsertTenantSuperAdminUser(updatedOrganization.tenantDatabase, {
          organizationId: updatedOrganization.id,
          name: validated.superAdminName,
          email: validated.superAdminEmail,
          ...(validated.superAdminPassword
            ? { password: await hash(validated.superAdminPassword, 10) }
            : {}),
        });
      }

      return NextResponse.json(buildStepResponse(updatedOrganization));
    }

    if (!body.organizationId) {
      return NextResponse.json(
        { error: "organizationId is required after step 1" },
        { status: 400 },
      );
    }

    const organization = await findOrganizationById(body.organizationId);
    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const commonSetupUpdates = {
      setupStatus: body.finalize === true ? "COMPLETED" : "DRAFT" as const,
      setupCurrentStep: body.finalize === true ? 5 : Math.min(step + 1, 5),
      setupCompletedSteps: mergeCompletedSteps(organization.setupCompletedSteps, step),
      setupLastSavedAt: new Date(),
    };

    const updatesByStep: Record<Exclude<SetupStep, 1>, Record<string, unknown>> = {
      2: {
        attributeSetup: normalizedAttributeSetup,
      },
      3: {
        moduleAccess,
        roleAccessSetup: normalizedRoleAccessSetup,
      },
      4: {
        packetSetup: normalizedPacketSetup,
      },
      5: {
        groupDefinitionSetup: normalizedGroupDefinitionSetup,
      },
    };

    const updatedOrganization = await updateOrganizationById(body.organizationId, {
      ...updatesByStep[step as Exclude<SetupStep, 1>],
      ...commonSetupUpdates,
    });

    if (!updatedOrganization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    return NextResponse.json(buildStepResponse(updatedOrganization));
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to save organization setup step",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
