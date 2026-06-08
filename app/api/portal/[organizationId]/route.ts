import {
  deleteOrganizationById,
  findOrganizationByAny,
  findOrganizationById,
  updateOrganizationById,
} from "@/app/repositories/organization";
import { getSessionFromCookie } from "@/lib/auth";
import { NextResponse } from "next/server";
import {
  buildSystemDomain,
  normalizeCustomDomain,
  type ModuleAccessObject,
  normalizeModuleAccessToObject,
} from "@/lib/organization";

type UpdatePortalBody = {
  organizationName?: string;
  organizationEmail?: string;
  phoneNumber?: string;
  industry?: string;
  address?: string;
  adminName?: string;
  adminEmail?: string;
  adminPhone?: string;
  designation?: string;
  systemDomain?: string;
  customDomain?: string | null;
  planName?: string;
  userLimit?: number;
  moduleAccess?: string[] | Record<string, boolean> | ModuleAccessObject;
  isActive?: boolean;
  startDate?: string | null;
  autoDeactivateDate?: string | null;
  storageLimitGb?: number | null;
  notes?: string;
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

export async function PATCH(
  request: Request,
  context: { params: Promise<{ organizationId: string }> },
) {
  try {
    const session = await getSessionFromCookie();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { organizationId } = await context.params;
    const body = (await request.json()) as UpdatePortalBody;

    const updates: {
      name?: string;
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
      planName?: string;
      userLimit?: number;
      moduleAccess?: ModuleAccessObject;
      isActive?: boolean;
      startDate?: Date | null;
      autoDeactivateDate?: Date | null;
      storageLimitGb?: number | null;
      notes?: string | null;
      updatedAt: Date;
    } = {
      updatedAt: new Date(),
    };

    if (typeof body.organizationName === "string" && body.organizationName.trim()) {
      updates.name = body.organizationName.trim();
    }

    if (typeof body.organizationEmail === "string") {
      updates.email = body.organizationEmail.trim().toLowerCase() || null;
    }

    if (typeof body.phoneNumber === "string") {
      updates.phone = body.phoneNumber.trim() || null;
    }

    if (typeof body.industry === "string") {
      updates.industry = body.industry.trim() || null;
    }

    if (typeof body.address === "string") {
      updates.address = body.address.trim() || null;
    }

    if (typeof body.adminName === "string") {
      updates.adminName = body.adminName.trim() || null;
    }

    if (typeof body.adminEmail === "string") {
      updates.adminEmail = body.adminEmail.trim().toLowerCase() || null;
    }

    if (typeof body.adminPhone === "string") {
      updates.adminPhone = body.adminPhone.trim() || null;
    }

    if (typeof body.designation === "string") {
      updates.adminDesignation = body.designation.trim() || null;
    }

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
      const parsedStartDate = new Date(body.startDate);
      if (!Number.isNaN(parsedStartDate.getTime())) {
        updates.startDate = parsedStartDate;
      }
    }

    if (body.autoDeactivateDate === null) {
      updates.autoDeactivateDate = null;
    } else if (
      typeof body.autoDeactivateDate === "string" &&
      body.autoDeactivateDate
    ) {
      const parsedAutoDeactivateDate = new Date(body.autoDeactivateDate);
      if (Number.isNaN(parsedAutoDeactivateDate.getTime())) {
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
      updates.autoDeactivateDate = parsedAutoDeactivateDate;
    }

    if (body.storageLimitGb === null) {
      updates.storageLimitGb = null;
    } else if (
      typeof body.storageLimitGb === "number" &&
      Number.isFinite(body.storageLimitGb)
    ) {
      updates.storageLimitGb = body.storageLimitGb;
    }

    if (typeof body.notes === "string") {
      updates.notes = body.notes;
    }

    const currentOrganization = await findOrganizationById(organizationId);

    if (!currentOrganization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const nextSystemDomain = body.systemDomain !== undefined
      ? buildSystemDomain(body.systemDomain)
      : currentOrganization.systemDomain ?? null;
    const nextCustomDomain = body.customDomain !== undefined
      ? normalizeCustomDomain(body.customDomain)
      : currentOrganization.customDomain ?? null;

    if (body.systemDomain !== undefined) {
      if (!nextSystemDomain) {
        return NextResponse.json(
          { error: "systemDomain is required and must end with .procorhrms.com" },
          { status: 400 },
        );
      }
      updates.systemDomain = nextSystemDomain;
    }

    if (body.customDomain !== undefined) {
      if (nextCustomDomain && nextSystemDomain && nextCustomDomain === nextSystemDomain) {
        return NextResponse.json(
          { error: "customDomain must be different from systemDomain" },
          { status: 400 },
        );
      }
      updates.customDomain = nextCustomDomain;
    }

    if (nextSystemDomain || nextCustomDomain) {
      const duplicateDomain = await findOrganizationByAny(
        [
          ...(nextSystemDomain
            ? [{ systemDomain: nextSystemDomain }, { customDomain: nextSystemDomain }]
            : []),
          ...(nextCustomDomain
            ? [{ customDomain: nextCustomDomain }, { systemDomain: nextCustomDomain }]
            : []),
        ],
        organizationId,
      );

      if (duplicateDomain) {
        return NextResponse.json(
          { error: "System or custom domain already exists" },
          { status: 409 },
        );
      }
    }

    const updated = await updateOrganizationById(organizationId, updates);

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
  context: { params: Promise<{ organizationId: string }> },
) {
  try {
    const session = await getSessionFromCookie();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { organizationId } = await context.params;

    if (!(await deleteOrganizationById(organizationId))) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Organization deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete organization", details: String(error) },
      { status: 500 },
    );
  }
}
