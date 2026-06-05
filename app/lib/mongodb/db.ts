import { MongoClient } from "mongodb";

const globalForMongo = globalThis as unknown as {
  masterMongoClientPromise?: Promise<MongoClient>;
};

function getMasterDatabaseUrl() {
  const url = process.env.MASTER_DATABASE_URL;
  if (!url) {
    throw new Error("MASTER_DATABASE_URL is not configured");
  }
  return url;
}

let clientPromise: Promise<MongoClient>;
if (process.env.NODE_ENV === "development") {
  if (!globalForMongo.masterMongoClientPromise) {
    const client = new MongoClient(getMasterDatabaseUrl());
    globalForMongo.masterMongoClientPromise = client.connect();
  }
  clientPromise = globalForMongo.masterMongoClientPromise;
} else {
  const client = new MongoClient(getMasterDatabaseUrl());
  clientPromise = client.connect();
}

export default clientPromise;
