import { MongoClient, Db } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectMongo(): Promise<Db> {
  if (db) return db;
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is required');
  client = new MongoClient(uri, { monitorCommands: false });
  await client.connect();
  const dbName = process.env.MONGO_DB || 'static_web_leads';
  db = client.db(dbName);
  return db;
}

export function getDb(): Db {
  if (!db) throw new Error('Mongo not connected');
  return db;
}
