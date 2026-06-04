import type { IndexDescription } from "mongodb";
import {
  findOrganizationById,
  findOrganizationBySlug,
} from "@/app/repositories/organization";
import { ensureTenantCollection, getTenantDatabase } from "./tenant";

async function requireTenantDatabaseName(
  organization: { tenantDatabase?: string | null } | null,
) {
  if (!organization?.tenantDatabase) {
    throw new Error("Organization tenant database is not configured");
  }
  return organization.tenantDatabase;
}

export async function getOrganizationTenantDatabase(organizationId: string) {
  const organization = await findOrganizationById(organizationId);
  return getTenantDatabase(await requireTenantDatabaseName(organization));
}

export async function getOrganizationTenantDatabaseBySlug(slug: string) {
  const organization = await findOrganizationBySlug(slug);
  return getTenantDatabase(await requireTenantDatabaseName(organization));
}

export async function getOrganizationTenantCollection(
  organizationId: string,
  collectionName: string,
  indexes: IndexDescription[] = [],
) {
  const organization = await findOrganizationById(organizationId);
  return ensureTenantCollection(
    await requireTenantDatabaseName(organization),
    collectionName,
    indexes,
  );
}
