import { getDb } from '../mongo.js';

function pad(n: number, width = 5) {
  return String(n).padStart(width, '0');
}

function currentQuarter(d = new Date()) {
  return Math.floor(d.getMonth() / 3) + 1;
}

export async function createQuote(doc: any) {
  const db = getDb();
  const now = new Date();
  const counter = await db.collection('counters').findOneAndUpdate(
    { key: `quote-${now.getFullYear()}-Q${currentQuarter(now)}` },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after' }
  );
  const seq = (counter && (counter as any).value && (counter as any).value.seq) ? (counter as any).value.seq : 1;
  const quoteNumber = `Q${currentQuarter(now)}-${now.getFullYear()}-${pad(seq)}`;
  const toInsert = { ...doc, quoteNumber, createdAt: now, retention: { expiresAt: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 60) } };
  const result = await db.collection('quotes').insertOne(toInsert);
  return { id: result.insertedId, quoteNumber };
}
