import { prisma } from "@/lib/prisma";
import { getSessionFromCookie } from "@/lib/auth";
import PortalClient, { type InvoicePortalApi, type OrganizationPortalApi } from "./PortalClient";
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

  const [organizations, invoices] = await Promise.all([
    prisma.organization.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        users: {
          select: { id: true },
        },
      },
    }),
    prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  const initialOrganizations: OrganizationPortalApi[] = organizations.map((org) => ({
    id: org.id,
    name: org.name,
    slug: org.slug ?? "",
    createdAt: org.createdAt.toISOString(),
    updatedAt: org.updatedAt.toISOString(),
    userCount: org.users.length,
    portal: {
      id: org.id,
      planName: org.planName ?? null,
      userLimit: org.userLimit ?? 25,
      moduleAccess: normalizeModuleAccessToArray(org.moduleAccess),
      isActive: org.isActive,
    },
    startDate: org.startDate?.toISOString() ?? null,
    autoDeactivateDate: org.autoDeactivateDate?.toISOString() ?? null,
  }));

  const initialInvoices: InvoicePortalApi[] = invoices.map((invoice) => ({
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    organizationName: invoice.organizationName,
    finalAmount: invoice.finalAmount,
    createdAt: invoice.createdAt.toISOString(),
  }));

  return (
    <PortalClient
      initialOrganizations={initialOrganizations}
      initialInvoices={initialInvoices}
    />
  );
}
