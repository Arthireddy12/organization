import { redirect } from "next/navigation";
import { getSessionFromCookie } from "@/lib/auth";
import { listOrganizationsWithUserCounts } from "@/app/repositories/organization";
import {
  normalizeModuleAccessToArray,
} from "@/lib/organization";
import { ensureOrganizationSlugs } from "@/lib/organization-server";
import OrganizationsClient, { type OrganizationListItem } from "./OrganizationsClient";

type PlainOrganization = {
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
  slug?: string | null;
  planName?: string | null;
  userLimit?: number | null;
  isActive: boolean;
  startDate?: Date | null;
  createdAt: Date;
  autoDeactivateDate?: Date | null;
  moduleAccess?: unknown;
};

export default async function OrganizationsPage() {
  const session = await getSessionFromCookie();
  if (!session) {
    redirect("/login");
  }
  if (session.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  await ensureOrganizationSlugs();

  const organizations = await listOrganizationsWithUserCounts() as Array<
    PlainOrganization & { userCount: number }
  >;

  const organizationItems: OrganizationListItem[] = await Promise.all(organizations.map(async (org) => ({
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
    userCount: org.userCount,
    isActive: org.isActive,
    startDate: org.startDate ? org.startDate.toISOString() : null,
    createdAt: org.createdAt.toISOString(),
    autoDeactivateDate: org.autoDeactivateDate
      ? org.autoDeactivateDate.toISOString()
      : null,
    moduleAccess: normalizeModuleAccessToArray(org.moduleAccess),
  })));

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
