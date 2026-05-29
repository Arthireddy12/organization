import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  ensureOrganizationSlugs,
  normalizeModuleAccessToArray,
} from "@/lib/organization";
import OrganizationsClient, { type OrganizationListItem } from "./OrganizationsClient";

export default async function OrganizationsPage() {
  const session = await getSessionFromCookie();
  if (!session) {
    redirect("/login");
  }
  if (session.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  await ensureOrganizationSlugs();

  const organizations = await prisma.organization.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      industry: true,
      address: true,
      adminName: true,
      adminEmail: true,
      adminPhone: true,
      adminDesignation: true,
      slug: true,
      planName: true,
      userLimit: true,
      isActive: true,
      startDate: true,
      createdAt: true,
      autoDeactivateDate: true,
      moduleAccess: true,
      _count: {
        select: {
          users: true,
        },
      },
    },
  });

  const organizationItems: OrganizationListItem[] = organizations.map((org) => ({
    id: org.id,
    name: org.name,
    email: org.email ?? undefined,
    phone: org.phone ?? "",
    industry: org.industry ?? "",
    address: org.address ?? "",
    adminName: org.adminName ?? "",
    adminEmail: org.adminEmail ?? "",
    adminPhone: org.adminPhone ?? "",
    adminDesignation: org.adminDesignation ?? "",
    slug: org.slug ?? "",
    planName: org.planName ?? "Starter",
    userLimit: org.userLimit ?? 25,
    userCount: org._count.users,
    isActive: org.isActive,
    startDate: org.startDate ? org.startDate.toISOString() : null,
    createdAt: org.createdAt.toISOString(),
    autoDeactivateDate: org.autoDeactivateDate
      ? org.autoDeactivateDate.toISOString()
      : null,
    moduleAccess: normalizeModuleAccessToArray(org.moduleAccess),
  }));

  return (
    <div className="px-6 pb-10 pt-5 lg:px-8">
      <div className="mb-5 flex flex-col gap-4 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-950">Organizations</h2>
          <p className="mt-1 text-sm text-slate-500">
            View every organization and manage status, settings, or deletion.
          </p>
        </div>
      </div>
      <OrganizationsClient initialOrganizations={organizationItems} />
    </div>
  );
}
