import { COLLECTIONS, getCollection } from "@/app/lib/mongodb/collection";
import { getOrganizationTenantCollection } from "@/app/lib/mongodb/tenant-context";
import { ensureTenantCollection } from "@/app/lib/mongodb/tenant";
import type { OrganizationDocument } from "@/app/models/organization";
import type { UserDocument } from "@/app/models/user";
import { toObjectId, toPlain } from "@/app/utils/helper";
import type { Filter } from "mongodb";
import type { UserRecord } from "./types";

export async function findUserById(id: string, select?: string) {
  const objectId = toObjectId(id);
  if (!objectId) return null;
  const users = await getCollection<UserDocument>(COLLECTIONS.USERS);
  const projection = select
    ? Object.fromEntries(select.split(/\s+/).filter(Boolean).map((field) => [field, 1]))
    : undefined;
  return toPlain(await users.findOne({ _id: objectId }, { projection })) as UserRecord | null;
}

export async function findUserByEmail(email: string) {
  const users = await getCollection<UserDocument>(COLLECTIONS.USERS);
  return toPlain(await users.findOne({ email })) as UserRecord | null;
}

export async function userExistsByEmail(email: string) {
  const users = await getCollection<UserDocument>(COLLECTIONS.USERS);
  return users.findOne({ email }, { projection: { _id: 1 } });
}

export async function createUser(data: Record<string, unknown>) {
  const users = await getCollection<UserDocument>(COLLECTIONS.USERS);
  const organizationId =
    typeof data.organizationId === "string" ? toObjectId(data.organizationId) : data.organizationId;
  const user = {
    role: "EMPLOYEE",
    organizationId: null,
    resetOtpHash: null,
    resetOtpExpiresAt: null,
    resetOtpRequestedAt: null,
    createdAt: new Date(),
    ...data,
    ...(organizationId !== undefined ? { organizationId } : {}),
  } as unknown as UserDocument;
  const result = await users.insertOne(user);
  return toPlain({ ...user, _id: result.insertedId }) as UserRecord;
}

export async function createTenantUser(
  tenantDatabaseName: string,
  data: Record<string, unknown>,
) {
  const users = await ensureTenantCollection<UserDocument>(tenantDatabaseName, COLLECTIONS.USERS, [
    { key: { email: 1 }, unique: true },
    { key: { organizationId: 1 } },
  ]);
  const organizationId =
    typeof data.organizationId === "string" ? toObjectId(data.organizationId) : data.organizationId;
  const user = {
    role: "EMPLOYEE",
    organizationId: null,
    resetOtpHash: null,
    resetOtpExpiresAt: null,
    resetOtpRequestedAt: null,
    createdAt: new Date(),
    ...data,
    ...(organizationId !== undefined ? { organizationId } : {}),
  } as unknown as UserDocument;
  const result = await users.insertOne(user);
  return toPlain({ ...user, _id: result.insertedId }) as UserRecord;
}

export async function upsertTenantSuperAdminUser(
  tenantDatabaseName: string,
  data: {
    organizationId: string;
    name: string;
    email: string;
    password?: string;
  },
) {
  const users = await ensureTenantCollection<UserDocument>(tenantDatabaseName, COLLECTIONS.USERS, [
    { key: { email: 1 }, unique: true },
    { key: { organizationId: 1 } },
  ]);
  const organizationId = toObjectId(data.organizationId);
  const now = new Date();

  return toPlain(
    await users.findOneAndUpdate(
      {
        role: "SUPER_ADMIN",
        ...(organizationId ? { organizationId } : {}),
      },
      {
        $set: {
          name: data.name,
          email: data.email,
          role: "SUPER_ADMIN",
          ...(organizationId ? { organizationId } : {}),
          ...(data.password ? { password: data.password } : {}),
          updatedAt: now,
        },
        $setOnInsert: {
          createdAt: now,
          resetOtpHash: null,
          resetOtpExpiresAt: null,
          resetOtpRequestedAt: null,
        },
      },
      {
        upsert: true,
        returnDocument: "after",
      },
    ),
  ) as UserRecord | null;
}

export async function deleteUsersByOrganizationId(organizationId: string) {
  const users = await getCollection<UserDocument>(COLLECTIONS.USERS);
  const objectId = toObjectId(organizationId);
  return objectId ? users.deleteMany({ organizationId: objectId }) : null;
}

export async function listUsers(filters: {
  organizationId?: string | null;
  role?: string;
} = {}) {
  const users = await getCollection<UserDocument>(COLLECTIONS.USERS);
  const organizations = await getCollection<OrganizationDocument>(COLLECTIONS.ORGANIZATIONS);
  const organizationObjectId = filters.organizationId
    ? toObjectId(filters.organizationId)
    : null;
  const query: Filter<UserDocument> = {
    ...(organizationObjectId ? { organizationId: organizationObjectId } : {}),
    ...(filters.role ? { role: filters.role as UserDocument["role"] } : {}),
  };
  const userRecords = toPlain(
    await users
      .find(query, {
        projection: { name: 1, email: 1, role: 1, createdAt: 1, organizationId: 1 },
      })
      .sort({ createdAt: -1 })
      .toArray(),
  ) as UserRecord[];
  const organizationIds = userRecords
    .map((user) => user.organizationId ? toObjectId(user.organizationId) : null)
    .filter((id): id is NonNullable<typeof id> => id !== null);
  const organizationRecords = toPlain(
    await organizations
      .find({ _id: { $in: organizationIds } }, { projection: { name: 1 } })
      .toArray(),
  ) as Array<{ id: string; name: string }>;
  const organizationsById = new Map(
    organizationRecords.map((organization) => [organization.id, organization]),
  );

  return userRecords.map((user) => ({
    ...user,
    organization: user.organizationId
      ? organizationsById.get(user.organizationId) ?? null
      : null,
  }));
}

export async function listTenantUsersByOrganizationId(
  organizationId: string,
  filters: { role?: string } = {},
) {
  const users = await getOrganizationTenantCollection<UserDocument>(
    organizationId,
    COLLECTIONS.USERS,
    [
    { key: { email: 1 }, unique: true },
    { key: { organizationId: 1 } },
    ],
  );
  const query: Filter<UserDocument> = {
    ...(filters.role ? { role: filters.role as UserDocument["role"] } : {}),
  };

  return toPlain(
    await users
      .find(query, {
        projection: {
          name: 1,
          email: 1,
          role: 1,
          createdAt: 1,
          organizationId: 1,
        },
      })
      .sort({ createdAt: -1 })
      .toArray(),
  ) as UserRecord[];
}

export async function countTenantUsersByOrganizationId(organizationId: string) {
  const users = await getOrganizationTenantCollection<UserDocument>(
    organizationId,
    COLLECTIONS.USERS,
    [
    { key: { email: 1 }, unique: true },
    { key: { organizationId: 1 } },
    ],
  );
  return users.countDocuments();
}
