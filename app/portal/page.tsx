import { prisma } from "@/lib/prisma";
import { getSessionFromCookie } from "@/lib/auth";
import PortalClient, { type OrganizationPortalApi } from "./PortalClient";
import { redirect } from "next/navigation";
import {
  ensureOrganizationSlugs,
  normalizeModuleAccessToArray,
} from "@/lib/organization";

export default async function PortalPage() {
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
    include: {
      users: {
        select: { id: true },
      },
    },
  });

  const initialOrganizations: OrganizationPortalApi[] = organizations.map((org) => ({
    id: org.id,
    name: org.name,
    slug: org.slug ?? "",
    createdAt: org.createdAt.toISOString(),
    updatedAt: org.updatedAt.toISOString(),
    userCount: org.users.length,
    portal: {
      id: org.id,
      planName: org.planName ?? "Starter",
      userLimit: org.userLimit ?? 25,
      moduleAccess: normalizeModuleAccessToArray(org.moduleAccess),
      isActive: org.isActive,
    },
  }));

  return <PortalClient initialOrganizations={initialOrganizations} />;
}
