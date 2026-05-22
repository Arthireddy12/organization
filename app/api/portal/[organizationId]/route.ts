import { prisma } from "@/lib/prisma";
import { getSessionFromCookie } from "@/lib/auth";
import { NextResponse } from "next/server";
import { type ModuleAccessObject, normalizeModuleAccessToObject } from "@/lib/organization";

type UpdatePortalBody = {
  planName?: string;
  userLimit?: number;
  moduleAccess?: string[] | Record<string, boolean>;
  isActive?: boolean;
  startDate?: string | null;
  autoDeactivateDate?: string | null;
  storageLimitGb?: number | null;
  notes?: string;
};

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
      if (!Number.isNaN(parsedAutoDeactivateDate.getTime())) {
        updates.autoDeactivateDate = parsedAutoDeactivateDate;
        if (parsedAutoDeactivateDate.getTime() <= Date.now()) {
          updates.isActive = false;
        }
      }
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

    const existing = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const updated = await prisma.organization.update({
      where: { id: organizationId },
      data: updates,
    });

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

    await prisma.organization.delete({
      where: { id: organizationId },
    });

    return NextResponse.json({ message: "Organization deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete organization", details: String(error) },
      { status: 500 },
    );
  }
}
