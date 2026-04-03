import { MongoClient, Db, GridFSBucket } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const MONGOFS_URI = process.env.MONGOFS_URI || MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || "jayaprima_2026";

let client: MongoClient | null = null;
let db: Db | null = null;

let fsClient: MongoClient | null = null;
let fsDb: Db | null = null;
let fsBucket: GridFSBucket | null = null;

export async function getDb(year?: string): Promise<Db> {
  const dbName = year ? `jayaprima_${year}` : MONGODB_DB;

  if (client && db && db.databaseName === dbName) {
    return db;
  }

  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
  }

  db = client.db(dbName);
  return db;
}

export async function getFsBucket(): Promise<GridFSBucket> {
  if (fsClient && fsBucket) {
    return fsBucket;
  }

  if (!fsClient) {
    fsClient = new MongoClient(MONGOFS_URI);
    await fsClient.connect();
  }

  fsDb = fsClient.db(MONGODB_DB);
  fsBucket = new GridFSBucket(fsDb);
  return fsBucket;
}

export async function getFsDb(): Promise<Db> {
  if (fsClient && fsDb) {
    return fsDb;
  }

  await getFsBucket();
  return fsDb!;
}
