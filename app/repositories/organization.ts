import { COLLECTIONS, getCollection } from "@/app/lib/mongodb/collection";
import type { DepartmentDocument } from "@/app/models/department";
import type { EmployeeDocument } from "@/app/models/employee";
import type { OrganizationDocument } from "@/app/models/organization";
import type { TeamDocument } from "@/app/models/team";
import type { UserDocument } from "@/app/models/user";
import { countTenantUsersByOrganizationId } from "./user";
import { toObjectId, toPlain } from "@/app/utils/helper";
import type { Filter } from "mongodb";
import type { OrganizationRecord } from "./types";

export async function listOrganizations() {
  const organizations = await getCollection<OrganizationDocument>(COLLECTIONS.ORGANIZATIONS);
  return toPlain(
    await organizations.find().sort({ createdAt: -1 }).toArray(),
  ) as OrganizationRecord[];
}

export async function listOrganizationsWithUserCounts() {
  const organizations = await listOrganizations();
  return Promise.all(organizations.map(async (organization) => {
    return {
      ...organization,
      userCount: organization.tenantDatabase
        ? await countTenantUsersByOrganizationId(organization.id)
        : 0,
    };
  }));
}

export async function findOrganizationById(id: string) {
  const objectId = toObjectId(id);
  if (!objectId) return null;
  const organizations = await getCollection<OrganizationDocument>(COLLECTIONS.ORGANIZATIONS);
  return toPlain(await organizations.findOne({ _id: objectId })) as OrganizationRecord | null;
}

export async function findOrganizationBySlug(slug: string) {
  const organizations = await getCollection<OrganizationDocument>(COLLECTIONS.ORGANIZATIONS);
  return toPlain(await organizations.findOne({ slug })) as OrganizationRecord | null;
}

export async function findOrganizationByAny(
  filters: Record<string, unknown>[],
  excludeId?: string,
) {
  const organizations = await getCollection<OrganizationDocument>(COLLECTIONS.ORGANIZATIONS);
  const excludedObjectId = excludeId ? toObjectId(excludeId) : null;

  return organizations.findOne(
    {
      $and: [
        { $or: filters as Filter<OrganizationDocument>[] },
        ...(excludedObjectId ? [{ _id: { $ne: excludedObjectId } }] : []),
      ],
    },
    { projection: { _id: 1 } },
  );
}

export async function organizationExistsById(id: string) {
  const objectId = toObjectId(id);
  if (!objectId) return null;
  const organizations = await getCollection<OrganizationDocument>(COLLECTIONS.ORGANIZATIONS);
  return organizations.findOne({ _id: objectId }, { projection: { _id: 1 } });
}

export async function organizationExistsBySlug(slug: string) {
  const organizations = await getCollection<OrganizationDocument>(COLLECTIONS.ORGANIZATIONS);
  return organizations.findOne({ slug }, { projection: { _id: 1 } });
}

export async function createOrganization(data: Record<string, unknown>) {
  const organizations = await getCollection<OrganizationDocument>(COLLECTIONS.ORGANIZATIONS);
  const now = new Date();
  const organization = {
    isActive: true,
    createdAt: now,
    updatedAt: now,
    ...data,
  } as unknown as OrganizationDocument;
  const result = await organizations.insertOne(organization);
  return toPlain({ ...organization, _id: result.insertedId }) as OrganizationRecord;
}

export async function updateOrganizationById(
  id: string,
  updates: Record<string, unknown>,
) {
  const objectId = toObjectId(id);
  if (!objectId) return null;
  const organizations = await getCollection<OrganizationDocument>(COLLECTIONS.ORGANIZATIONS);
  return toPlain(
    await organizations.findOneAndUpdate(
      { _id: objectId },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: "after" },
    ),
  ) as OrganizationRecord | null;
}

export async function updateOrganizationBySlug(
  slug: string,
  updates: Record<string, unknown>,
) {
  const organizations = await getCollection<OrganizationDocument>(COLLECTIONS.ORGANIZATIONS);
  return toPlain(
    await organizations.findOneAndUpdate(
      { slug },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: "after" },
    ),
  ) as OrganizationRecord | null;
}

export async function deleteOrganizationById(id: string) {
  const objectId = toObjectId(id);
  if (!objectId) return null;
  const organizations = await getCollection<OrganizationDocument>(COLLECTIONS.ORGANIZATIONS);
  return organizations.findOneAndDelete({ _id: objectId });
}

export async function deleteOrganizationBySlug(slug: string) {
  const organizations = await getCollection<OrganizationDocument>(COLLECTIONS.ORGANIZATIONS);
  return organizations.deleteOne({ slug });
}

export async function getOrganizationStats(organizationId: string) {
  const objectId = toObjectId(organizationId);
  if (!objectId) return { users: 0, departments: 0, employees: 0, teams: 0 };
  const [users, departments, employees, teams] = await Promise.all([
    getCollection<UserDocument>(COLLECTIONS.USERS),
    getCollection<DepartmentDocument>(COLLECTIONS.DEPARTMENTS),
    getCollection<EmployeeDocument>(COLLECTIONS.EMPLOYEES),
    getCollection<TeamDocument>(COLLECTIONS.TEAMS),
  ]);
  const counts = await Promise.all([
    users.countDocuments({ organizationId: objectId }),
    departments.countDocuments({ organizationId: objectId }),
    employees.countDocuments({ organizationId: objectId }),
    teams.countDocuments({ organizationId: objectId }),
  ]);
  return { users: counts[0], departments: counts[1], employees: counts[2], teams: counts[3] };
}

export async function backfillOrganizationSlugs() {
  const organizations = await getCollection<OrganizationDocument>(COLLECTIONS.ORGANIZATIONS);
  return organizations.updateMany(
    { $or: [{ slug: null }, { slug: { $exists: false } }, { slug: "" }] },
    [{ $set: { slug: { $concat: ["org-", { $toString: "$_id" }] } } }],
  );
}
