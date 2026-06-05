import { Db, IndexDescription, MongoClient } from "mongodb";

const globalForMongo = globalThis as unknown as {
  tenantMongoClientPromise?: Promise<MongoClient>;
};

function getTenantDatabaseUrl() {
  const url = process.env.TENANT_DATABASE_URL;
  if (!url) {
    throw new Error("TENANT_DATABASE_URL is not configured");
  }
  return url;
}

let tenantClientPromise: Promise<MongoClient>;
if (process.env.NODE_ENV === "development") {
  if (!globalForMongo.tenantMongoClientPromise) {
    const client = new MongoClient(getTenantDatabaseUrl());
    globalForMongo.tenantMongoClientPromise = client.connect();
  }
  tenantClientPromise = globalForMongo.tenantMongoClientPromise;
} else {
  const client = new MongoClient(getTenantDatabaseUrl());
  tenantClientPromise = client.connect();
}

export function createTenantDatabaseName(slug: string, organizationId: string) {
  const safeSlug = slug
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 27);
  const idSuffix = organizationId.slice(-6).toLowerCase();

  return `${safeSlug || "organization"}_org_${idSuffix}`;
}

export async function getTenantDatabase(databaseName: string): Promise<Db> {
  if (!/^[a-z0-9_]+$/.test(databaseName)) {
    throw new Error("Invalid tenant database name");
  }
  const client = await tenantClientPromise;
  return client.db(databaseName);
}

export async function provisionTenantDatabase(
  databaseName: string,
  organization: { id: string; slug: string },
) {
  const database = await getTenantDatabase(databaseName);
  const metadata = database.collection("TenantMetadata");

  await metadata.createIndex({ organizationId: 1 }, { unique: true });
  await metadata.updateOne(
    { organizationId: organization.id },
    {
      $setOnInsert: {
        organizationId: organization.id,
        slug: organization.slug,
        schemaVersion: 1,
        createdAt: new Date(),
      },
    },
    { upsert: true },
  );
}

export async function dropTenantDatabase(databaseName: string) {
  const database = await getTenantDatabase(databaseName);
  return database.dropDatabase();
}

function validateCollectionName(collectionName: string) {
  if (
    !collectionName ||
    collectionName.length > 120 ||
    collectionName.includes("\0") ||
    collectionName.startsWith("system.")
  ) {
    throw new Error("Invalid tenant collection name");
  }
}

export async function ensureTenantCollection(
  databaseName: string,
  collectionName: string,
  indexes: IndexDescription[] = [],
) {
  validateCollectionName(collectionName);

  const database = await getTenantDatabase(databaseName);
  const exists = await database
    .listCollections({ name: collectionName }, { nameOnly: true })
    .hasNext();

  if (!exists) {
    await database.createCollection(collectionName);
  }

  if (indexes.length > 0) {
    await database.collection(collectionName).createIndexes(indexes);
  }

  return database.collection(collectionName);
}
