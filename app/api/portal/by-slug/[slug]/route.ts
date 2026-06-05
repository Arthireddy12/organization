import {
  deleteOrganizationBySlug,
  findOrganizationBySlug,
  getOrganizationStats,
  organizationExistsBySlug,
  updateOrganizationBySlug,
} from "@/app/repositories/organization";
import { getSessionFromCookie } from "@/lib/auth";
import { NextResponse } from "next/server";
import {
  type ModuleAccessObject,
  normalizeModuleAccessToArray,
  normalizeModuleAccessToObject,
} from "@/lib/organization";

type UpdateOrgBody = {
  planName?: string;
  userLimit?: number;
  moduleAccess?: string[] | Record<string, boolean> | ModuleAccessObject;
  isActive?: boolean;
  startDate?: string | null;
  autoDeactivateDate?: string | null;
  storageLimitGb?: number | null;
  notes?: string;
};

type OrganizationRecord = {
  id: string;
  name: string;
  slug?: string | null;
  planName?: string | null;
  userLimit?: number | null;
  isActive: boolean;
  startDate?: Date | null;
  autoDeactivateDate?: Date | null;
  moduleAccess?: unknown;
  storageLimitGb?: number | null;
  apiAccess?: boolean | null;
  customBranding?: boolean | null;
  payrollEnabled?: boolean | null;
  attendanceEnabled?: boolean | null;
  recruitmentEnabled?: boolean | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

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

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await getSessionFromCookie();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await context.params;

    const organization = await findOrganizationBySlug(slug) as OrganizationRecord | null;

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      planName: organization.planName ?? "Starter",
      userLimit: organization.userLimit ?? 25,
      isActive: organization.isActive,
      startDate: organization.startDate,
      autoDeactivateDate: organization.autoDeactivateDate,
      moduleAccess: normalizeModuleAccessToArray(organization.moduleAccess),
      storageLimitGb: organization.storageLimitGb,
      apiAccess: organization.apiAccess,
      customBranding: organization.customBranding,
      payrollEnabled: organization.payrollEnabled,
      attendanceEnabled: organization.attendanceEnabled,
      recruitmentEnabled: organization.recruitmentEnabled,
      notes: organization.notes,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
      stats: await getOrganizationStats(organization.id),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch organization", details: String(error) },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await getSessionFromCookie();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await context.params;
    const body = (await request.json()) as UpdateOrgBody;

    const existing = await organizationExistsBySlug(slug);

    if (!existing) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 },
      );
    }

    const updates: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (typeof body.planName === "string" && body.planName.trim()) {
      updates.planName = body.planName.trim();
    }
    if (typeof body.userLimit === "number" && Number.isFinite(body.userLimit)) {
      if (body.userLimit < 1) {
        return NextResponse.json(
          { error: "userLimit must be a positive number" },
          { status: 400 },
        );
      }
      updates.userLimit = Math.trunc(body.userLimit);
    }
    if (body.moduleAccess !== undefined) {
      updates.moduleAccess = normalizeModuleAccessToObject(body.moduleAccess);
    }
    if (typeof body.isActive === "boolean") {
      updates.isActive = body.isActive;
    }
    if (body.startDate === null) {
      updates.startDate = null;
    } else if (typeof body.startDate === "string" && body.startDate) {
      const parsed = new Date(body.startDate);
      if (!Number.isNaN(parsed.getTime())) {
        updates.startDate = parsed;
      }
    }
    if (body.autoDeactivateDate === null) {
      updates.autoDeactivateDate = null;
    } else if (typeof body.autoDeactivateDate === "string" && body.autoDeactivateDate) {
      const parsed = new Date(body.autoDeactivateDate);
      if (Number.isNaN(parsed.getTime())) {
        return NextResponse.json(
          { error: "Invalid subscription end date" },
          { status: 400 },
        );
      }
      if (isPastDateInput(body.autoDeactivateDate)) {
        return NextResponse.json(
          { error: "Subscription end date cannot be before today" },
          { status: 400 },
        );
      }
      updates.autoDeactivateDate = parsed;
    }
    if (body.storageLimitGb === null) {
      updates.storageLimitGb = null;
    } else if (typeof body.storageLimitGb === "number" && Number.isFinite(body.storageLimitGb)) {
      updates.storageLimitGb = body.storageLimitGb;
    }
    if (typeof body.notes === "string") {
      updates.notes = body.notes;
    }

    const updated = await updateOrganizationBySlug(slug, updates);

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update organization", details: String(error) },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await getSessionFromCookie();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await context.params;

    const existing = await organizationExistsBySlug(slug);

    if (!existing) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 },
      );
    }

    await deleteOrganizationBySlug(slug);

    return NextResponse.json({ message: "Organization deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete organization", details: String(error) },
      { status: 500 },
    );
  }
}
