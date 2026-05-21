import { getSessionFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import OrganizationSettingsClient from "./OrganizationSettingsClient";
import {
  ensureOrganizationSlugs,
  normalizeModuleAccessToArray,
} from "@/lib/organization";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function OrganizationSettingsPage({ params }: PageProps) {
  const session = await getSessionFromCookie();
  if (!session) {
    redirect("/login");
  }
  if (session.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  await ensureOrganizationSlugs();

  const { slug } = await params;

  const organization = await prisma.organization.findUnique({
    where: { slug },
  });

  if (!organization) {
    notFound();
  }

  const now = new Date();
  let org = organization;

  if (
    org.autoDeactivateDate &&
    org.isActive &&
    org.autoDeactivateDate.getTime() <= now.getTime()
  ) {
    org = await prisma.organization.update({
      where: { id: organization.id },
      data: {
        isActive: false,
        updatedAt: now,
      },
    });
  }

  const userLimit = org.userLimit ?? 25;
  const moduleAccess = normalizeModuleAccessToArray(org.moduleAccess);
  if (moduleAccess.length === 0) {
    moduleAccess.push("Attendance", "Leave");
  }

  const organizationCreatedAtLabel = new Date(org.createdAt).toLocaleDateString(
    "en-US",
    { dateStyle: "long", timeZone: "UTC" },
  );

  return (
    <OrganizationSettingsClient
      organizationId={organization.id}
      organizationName={organization.name}
      organizationSlug={organization.slug ?? ""}
      organizationCreatedAtLabel={organizationCreatedAtLabel}
      initialUserLimit={userLimit}
      initialModules={moduleAccess}
      initialIsActive={org.isActive}
      initialStartDate={org.startDate ? org.startDate.toISOString() : null}
      initialAutoDeactivateDate={
        org.autoDeactivateDate ? org.autoDeactivateDate.toISOString() : null
      }
    />
  );
}
