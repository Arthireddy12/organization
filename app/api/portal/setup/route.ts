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
import type { OrganizationSetupSnapshot } from "@/app/models/organization-setup";
import { getSessionFromCookie } from "@/lib/auth";
import {
  buildSystemDomain,
  normalizeCustomDomain,
  normalizeModuleAccessToArray,
  normalizeModuleAccessToObject,
  type ModuleAccessObject,
} from "@/lib/organization";
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
  normalizeOrganizationRoleAccessSetup,
  type OrganizationRoleAccessSetup,
} from "@/lib/organization-role-access";
import {
  buildOrganizationAddressFromSetupProfile,
  normalizeOrganizationSetupProfile,
  type OrganizationSetupProfile,
} from "@/lib/organization-setup";
import { sendBrevoEmail } from "@/lib/brevo/email";
import {
  validateOrganizationAttributeSetupDraft,
  validateOrganizationGroupDefinitionSetupDraft,
  validateOrganizationPacketSetupDraft,
  validateSetupStepOne,
  type ValidationErrorMap,
} from "@/lib/organization-setup-validation";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

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

type NormalizedSetupPayload = {
  setupProfile: OrganizationSetupProfile;
  attributeSetup: OrganizationAttributeSetup;
  roleAccessSetup: OrganizationRoleAccessSetup;
  groupDefinitionSetup: OrganizationGroupDefinitionSetup;
  packetSetup: OrganizationPacketSetup;
  moduleAccess: ReturnType<typeof normalizeModuleAccessToObject>;
};

type StepOneDraft = {
  organizationName: string;
  organizationEmail: string;
  phoneNumber: string;
  industry: string;
  adminPhone: string;
  designation: string;
  systemDomain: string;
  customDomain: string | null;
  superAdminName: string;
  superAdminEmail: string;
  superAdminPassword: string;
  autoDeactivateDateInput: string | null;
  slug: string;
  setupProfile: OrganizationSetupProfile;
};

function slugifyOrganizationName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function normalizeStep(value: unknown): SetupStep | null {
  return value === 1 || value === 2 || value === 3 || value === 4 || value === 5 ? value : null;
}

function mergeCompletedSteps(current: unknown, step: SetupStep) {
  const steps = Array.isArray(current)
    ? current.filter((item): item is number => typeof item === "number")
    : [];

  return Array.from(new Set([...steps, step])).sort((left, right) => left - right);
}

function buildValidationResponse(errors: ValidationErrorMap) {
  return NextResponse.json(
    {
      error: "Validation failed",
      details: Object.values(errors)[0] ?? "Please fix the highlighted fields.",
      fieldErrors: errors,
    },
    { status: 400 },
  );
}

function getAppBaseUrl() {
  return (
    process.env.APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXTAUTH_URL ??
    "http://localhost:3000"
  );
}

function buildLoginUrl() {
  return new URL("/login", getAppBaseUrl()).toString();
}

function getSupportEmail() {
  return (
    process.env.SUPPORT_EMAIL ??
    process.env.BREVO_SENDER_EMAIL ??
    process.env.BREVO_FROM_EMAIL_ID ??
    ""
  );
}

function buildWelcomeEmailParams({
  organizationName,
  adminName,
  adminEmail,
  adminPassword,
}: {
  organizationName: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
}) {
  return {
    organizationName,
    adminName,
    adminEmail,
    adminPassword,
    loginUrl: buildLoginUrl(),
    supportEmail: getSupportEmail(),
  };
}

async function sendOrganizationWelcomeEmail({
  organizationName,
  adminName,
  adminEmail,
  adminPassword,
}: {
  organizationName: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
}) {
  if (!adminEmail || !adminPassword) {
    return;
  }

  try {
    await sendBrevoEmail({
      category: "organizationWelcome",
      to: [{ email: adminEmail, name: adminName || organizationName }],
      params: buildWelcomeEmailParams({
        organizationName,
        adminName,
        adminEmail,
        adminPassword,
      }),
    });
  } catch (error) {
    console.error("Failed to send organization welcome email:", error);
  }
}

function normalizeSetupPayload(body: SaveOrganizationSetupStepBody): NormalizedSetupPayload {
  return {
    setupProfile: normalizeOrganizationSetupProfile(body.setupProfile),
    attributeSetup: normalizeOrganizationAttributeSetup(body.attributeSetup),
    roleAccessSetup: normalizeOrganizationRoleAccessSetup(body.roleAccessSetup),
    groupDefinitionSetup: normalizeOrganizationGroupDefinitionSetup(body.groupDefinitionSetup),
    packetSetup: normalizeOrganizationPacketSetup(body.packetSetup),
    moduleAccess: normalizeModuleAccessToObject(body.moduleAccess ?? []),
  };
}

function buildStepOneDraft(body: SaveOrganizationSetupStepBody): StepOneDraft {
  const organizationName = body.organizationName?.trim() ?? "";
  const slug = slugifyOrganizationName(organizationName) || `org-${Date.now().toString(36)}`;

  return {
    organizationName,
    organizationEmail: body.organizationEmail?.trim().toLowerCase() ?? "",
    phoneNumber: body.phoneNumber?.trim() ?? "",
    industry: body.industry?.trim() ?? "",
    adminPhone: body.adminPhone?.trim() ?? "",
    designation: body.designation?.trim() ?? "",
    systemDomain: buildSystemDomain(body.systemDomain ?? ""),
    customDomain: normalizeCustomDomain(body.customDomain),
    superAdminName: body.superAdminName?.trim() ?? "",
    superAdminEmail: body.superAdminEmail?.trim().toLowerCase() ?? "",
    superAdminPassword: body.superAdminPassword ?? "",
    autoDeactivateDateInput: body.autoDeactivateDate ?? null,
    slug,
    setupProfile: normalizeOrganizationSetupProfile(body.setupProfile),
  };
}

function validateStepOneDraft(draft: StepOneDraft, isEditMode: boolean) {
  return validateSetupStepOne({
    isEditMode,
    organizationName: draft.organizationName,
    organizationEmail: draft.organizationEmail,
    phoneNumber: draft.phoneNumber,
    industry: draft.industry,
    setupProfile: draft.setupProfile,
    systemDomain: draft.systemDomain,
    customDomain: draft.customDomain,
    superAdminName: draft.superAdminName,
    superAdminEmail: draft.superAdminEmail,
    superAdminPassword: draft.superAdminPassword,
    adminPhone: draft.adminPhone,
    designation: draft.designation,
    autoDeactivateDate: draft.autoDeactivateDateInput,
  });
}

function buildStepOneConflictFilters(draft: StepOneDraft) {
  return [
    { name: draft.organizationName },
    { email: draft.organizationEmail },
    { adminEmail: draft.superAdminEmail },
    { slug: draft.slug },
    ...(draft.systemDomain
      ? [{ systemDomain: draft.systemDomain }, { customDomain: draft.systemDomain }]
      : []),
    ...(draft.customDomain
      ? [{ customDomain: draft.customDomain }, { systemDomain: draft.customDomain }]
      : []),
  ];
}

function normalizeComparableValue(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function setValidationError(errors: ValidationErrorMap, key: string, message: string) {
  if (!errors[key]) {
    errors[key] = message;
  }
}

async function validateStepOneUniqueness(
  draft: StepOneDraft,
  excludeOrganizationId?: string,
): Promise<ValidationErrorMap> {
  const existingOrganization = await findOrganizationByAny(
    buildStepOneConflictFilters(draft),
    excludeOrganizationId,
  );

  if (existingOrganization) {
    const errors: ValidationErrorMap = {};
    const existingName = normalizeComparableValue(existingOrganization.name as string | null);
    const existingEmail = normalizeComparableValue(existingOrganization.email as string | null);
    const existingAdminEmail = normalizeComparableValue(
      existingOrganization.adminEmail as string | null,
    );
    const existingSlug = normalizeComparableValue(existingOrganization.slug as string | null);
    const existingSystemDomain = normalizeComparableValue(
      existingOrganization.systemDomain as string | null,
    );
    const existingCustomDomain = normalizeComparableValue(
      existingOrganization.customDomain as string | null,
    );

    if (
      existingName === normalizeComparableValue(draft.organizationName) ||
      existingSlug === normalizeComparableValue(draft.slug)
    ) {
      setValidationError(errors, "organizationName", "Organization name already exists.");
    }

    if (existingEmail === normalizeComparableValue(draft.organizationEmail)) {
      setValidationError(errors, "organizationEmail", "Organization email already exists.");
    }

    if (existingAdminEmail === normalizeComparableValue(draft.superAdminEmail)) {
      setValidationError(errors, "superAdminEmail", "Admin email already exists.");
    }

    if (
      draft.systemDomain &&
      [existingSystemDomain, existingCustomDomain].includes(
        normalizeComparableValue(draft.systemDomain),
      )
    ) {
      setValidationError(errors, "systemDomainName", "System domain already exists.");
    }

    if (
      draft.customDomain &&
      [existingSystemDomain, existingCustomDomain].includes(
        normalizeComparableValue(draft.customDomain),
      )
    ) {
      setValidationError(errors, "customDomain", "Custom domain already exists.");
    }

    if (Object.keys(errors).length === 0) {
      setValidationError(errors, "form", "Organization, admin email, or domain already exists.");
    }

    return errors;
  }

  return {};
}

function mapOrganizationToSetupSnapshot(organization: {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  industry?: string | null;
  address?: string | null;
  adminName?: string | null;
  adminEmail?: string | null;
  adminPhone?: string | null;
  adminDesignation?: string | null;
  systemDomain?: string | null;
  customDomain?: string | null;
  startDate?: Date | null;
  autoDeactivateDate?: Date | null;
  isActive: boolean;
  userLimit?: number | null;
  moduleAccess?: unknown;
  setupProfile?: OrganizationSetupProfile | null;
  attributeSetup?: OrganizationAttributeSetup | null;
  roleAccessSetup?: OrganizationRoleAccessSetup | null;
  groupDefinitionSetup?: OrganizationGroupDefinitionSetup | null;
  packetSetup?: OrganizationPacketSetup | null;
  setupStatus?: "DRAFT" | "COMPLETED" | null;
  setupCurrentStep?: number | null;
  setupCompletedSteps?: number[] | null;
}): OrganizationSetupSnapshot {
  return {
    id: organization.id,
    organizationName: organization.name,
    organizationEmail: organization.email ?? "",
    phoneNumber: organization.phone ?? "",
    industry: organization.industry ?? "",
    address: organization.address ?? "",
    superAdminName: organization.adminName ?? "",
    superAdminEmail: organization.adminEmail ?? "",
    adminPhone: organization.adminPhone ?? "",
    designation: organization.adminDesignation ?? "",
    systemDomain: organization.systemDomain ?? "",
    customDomain: organization.customDomain ?? "",
    startDate: organization.startDate?.toISOString() ?? null,
    autoDeactivateDate: organization.autoDeactivateDate?.toISOString() ?? null,
    isActive: organization.isActive,
    userLimit: organization.userLimit ?? 25,
    moduleAccess: normalizeModuleAccessToArray(organization.moduleAccess),
    setupProfile: organization.setupProfile ?? null,
    attributeSetup: organization.attributeSetup ?? null,
    roleAccessSetup: organization.roleAccessSetup ?? null,
    groupDefinitionSetup: organization.groupDefinitionSetup ?? null,
    packetSetup: organization.packetSetup ?? null,
    setupStatus: organization.setupStatus ?? "DRAFT",
    setupCurrentStep: organization.setupCurrentStep ?? 1,
    setupCompletedSteps: organization.setupCompletedSteps ?? [],
  };
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

function buildCommonSetupUpdates(
  completedSteps: unknown,
  step: SetupStep,
  finalize?: boolean,
) {
  return {
    setupStatus: finalize === true ? ("COMPLETED" as const) : ("DRAFT" as const),
    setupCurrentStep: finalize === true ? 5 : Math.min(step + 1, 5),
    setupCompletedSteps: mergeCompletedSteps(completedSteps, step),
    setupLastSavedAt: new Date(),
  };
}

function buildStepSpecificUpdates(step: SetupStep, payload: NormalizedSetupPayload) {
  switch (step) {
    case 2:
      return { attributeSetup: payload.attributeSetup };
    case 3:
      return {
        moduleAccess: payload.moduleAccess,
        roleAccessSetup: payload.roleAccessSetup,
      };
    case 4:
      return { packetSetup: payload.packetSetup };
    case 5:
      return { groupDefinitionSetup: payload.groupDefinitionSetup };
    default:
      return {};
  }
}

function validateStepPayload(
  step: Exclude<SetupStep, 1>,
  payload: NormalizedSetupPayload,
) {
  switch (step) {
    case 2:
      return validateOrganizationAttributeSetupDraft(payload.attributeSetup);
    case 4:
      return validateOrganizationPacketSetupDraft(
        payload.packetSetup,
        payload.attributeSetup.selectedIds,
      );
    case 5:
      return validateOrganizationGroupDefinitionSetupDraft(
        payload.groupDefinitionSetup,
        payload.attributeSetup.selectedIds,
      );
    default:
      return { valid: true, errors: {} as Record<string, string> };
  }
}

async function persistStepOneDraft({
  body,
  draft,
  payload,
}: {
  body: SaveOrganizationSetupStepBody;
  draft: StepOneDraft;
  payload: NormalizedSetupPayload;
}) {
  const address =
    buildOrganizationAddressFromSetupProfile(payload.setupProfile) ||
    body.address?.trim() ||
    "";
  const autoDeactivateDate =
    draft.autoDeactivateDateInput && draft.autoDeactivateDateInput.trim()
      ? new Date(draft.autoDeactivateDateInput)
      : null;
  const now = new Date();

  if (!body.organizationId) {
    const created = await createOrganization({
      name: draft.organizationName,
      email: draft.organizationEmail,
      phone: draft.phoneNumber,
      industry: draft.industry,
      address,
      adminName: draft.superAdminName,
      adminEmail: draft.superAdminEmail,
      adminPhone: draft.adminPhone,
      adminDesignation: draft.designation,
      setupProfile: payload.setupProfile,
      attributeSetup: payload.attributeSetup,
      roleAccessSetup: payload.roleAccessSetup,
      groupDefinitionSetup: payload.groupDefinitionSetup,
      packetSetup: payload.packetSetup,
      slug: draft.slug,
      systemDomain: draft.systemDomain,
      customDomain: draft.customDomain,
      userLimit: 25,
      moduleAccess: payload.moduleAccess,
      isActive: true,
      startDate: now,
      autoDeactivateDate,
      setupStatus: body.finalize === true ? "COMPLETED" : "DRAFT",
      setupCurrentStep: body.finalize === true ? 5 : 2,
      setupCompletedSteps: [1],
      setupLastSavedAt: now,
    });

    const tenantDatabase = createTenantDatabaseName(
      draft.systemDomain || draft.customDomain || draft.organizationName,
      created.id,
    );
    await provisionTenantDatabase(tenantDatabase, {
      id: created.id,
      slug: draft.slug,
    });

    const passwordHash = await hash(draft.superAdminPassword, 10);
    await updateOrganizationById(created.id, { tenantDatabase });
    await upsertTenantSuperAdminUser(tenantDatabase, {
      organizationId: created.id,
      name: draft.superAdminName,
      email: draft.superAdminEmail,
      password: passwordHash,
    });
    await sendOrganizationWelcomeEmail({
      organizationName: draft.organizationName,
      adminName: draft.superAdminName,
      adminEmail: draft.superAdminEmail,
      adminPassword: draft.superAdminPassword,
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

  const updatedOrganization = await updateOrganizationById(body.organizationId, {
    name: draft.organizationName,
    email: draft.organizationEmail,
    phone: draft.phoneNumber,
    industry: draft.industry,
    address,
    adminName: draft.superAdminName,
    adminEmail: draft.superAdminEmail,
    adminPhone: draft.adminPhone,
    adminDesignation: draft.designation,
    setupProfile: payload.setupProfile,
    systemDomain: draft.systemDomain,
    customDomain: draft.customDomain,
    autoDeactivateDate,
    setupStatus: body.finalize === true ? "COMPLETED" : "DRAFT",
    setupCurrentStep: body.finalize === true ? 5 : 2,
    setupCompletedSteps: mergeCompletedSteps(existingOrganization.setupCompletedSteps, 1),
    setupLastSavedAt: now,
  });

  if (!updatedOrganization) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  if (updatedOrganization.tenantDatabase) {
    await upsertTenantSuperAdminUser(updatedOrganization.tenantDatabase, {
      organizationId: updatedOrganization.id,
      name: draft.superAdminName,
      email: draft.superAdminEmail,
      ...(draft.superAdminPassword ? { password: await hash(draft.superAdminPassword, 10) } : {}),
    });
  }

  return NextResponse.json(buildStepResponse(updatedOrganization));
}

export async function GET(request: Request) {
  try {
    const session = await getSessionFromCookie();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const organizationId = url.searchParams.get("organizationId");
    if (!organizationId) {
      return NextResponse.json({ error: "organizationId is required" }, { status: 400 });
    }

    const organization = await findOrganizationById(organizationId);
    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    return NextResponse.json(mapOrganizationToSetupSnapshot(organization));
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch organization setup", details: String(error) },
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

    const body = (await request.json()) as SaveOrganizationSetupStepBody;
    const step = normalizeStep(body.step);

    if (!step) {
      return NextResponse.json({ error: "Valid step is required" }, { status: 400 });
    }

    const payload = normalizeSetupPayload(body);

    if (step === 1) {
      const draft = buildStepOneDraft(body);
      const stepOneValidation = validateStepOneDraft(draft, Boolean(body.organizationId));
      if (!stepOneValidation.valid) {
        return buildValidationResponse(stepOneValidation.errors);
      }

      const uniquenessErrors = await validateStepOneUniqueness(draft, body.organizationId);
      if (Object.keys(uniquenessErrors).length > 0) {
        return buildValidationResponse(uniquenessErrors);
      }

      return persistStepOneDraft({ body, draft, payload });
    }

    if (!body.organizationId) {
      return NextResponse.json(
        { error: "organizationId is required after step 1" },
        { status: 400 },
      );
    }

    const validationResult = validateStepPayload(step, payload);
    if (!validationResult.valid) {
      return buildValidationResponse(validationResult.errors);
    }

    const organization = await findOrganizationById(body.organizationId);
    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const updatedOrganization = await updateOrganizationById(body.organizationId, {
      ...buildStepSpecificUpdates(step, payload),
      ...buildCommonSetupUpdates(organization.setupCompletedSteps, step, body.finalize),
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
