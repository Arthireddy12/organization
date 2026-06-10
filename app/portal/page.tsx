import { listInvoices } from "@/app/repositories/invoice";
import { listOrganizationsWithUserCounts } from "@/app/repositories/organization";
import { getSessionFromCookie } from "@/lib/auth";
import { ensureOrganizationSlugs } from "@/lib/organization-server";
import PortalClient, { type InvoicePortalApi, type OrganizationPortalApi } from "./PortalClient";
import { redirect } from "next/navigation";
import {
  normalizeModuleAccessToArray,
} from "@/lib/organization";

type PlainOrganization = {
  id: string;
  name: string;
  email?: string | null;
  slug?: string | null;
  createdAt: Date;
  updatedAt: Date;
  planName?: string | null;
  userLimit?: number | null;
  moduleAccess?: unknown;
  isActive: boolean;
  startDate?: Date | null;
  autoDeactivateDate?: Date | null;
};

type PlainInvoice = {
  id: string;
  invoiceNumber: string;
  organizationName: string;
  finalAmount: number;
  createdAt: Date;
};

export default async function PortalPage() {
  const session = await getSessionFromCookie();
  if (!session) {
    redirect("/login");
  }
  if (session.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  await ensureOrganizationSlugs();

  const [plainOrganizations, plainInvoices] = await Promise.all([
    listOrganizationsWithUserCounts() as Promise<Array<PlainOrganization & { userCount: number }>>,
    listInvoices(100) as Promise<PlainInvoice[]>,
  ]);

  const initialOrganizations: OrganizationPortalApi[] = await Promise.all(plainOrganizations.map(async (org) => ({
    id: org.id,
    name: org.name,
    email: org.email,
    slug: org.slug ?? "",
    createdAt: org.createdAt.toISOString(),
    updatedAt: org.updatedAt.toISOString(),
    userCount: org.userCount,
    portal: {
      id: org.id,
      planName: org.planName ?? null,
      userLimit: org.userLimit ?? 25,
      moduleAccess: normalizeModuleAccessToArray(org.moduleAccess),
      isActive: org.isActive,
    },
    startDate: org.startDate?.toISOString() ?? null,
    autoDeactivateDate: org.autoDeactivateDate?.toISOString() ?? null,
  })));

  const initialInvoices: InvoicePortalApi[] = plainInvoices.map((invoice) => ({
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
