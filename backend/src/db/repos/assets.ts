import { getDb } from '../mongo.js';

export async function listAssets() {
  const db = getDb();
  return db.collection('assets').find({}).toArray();
}
