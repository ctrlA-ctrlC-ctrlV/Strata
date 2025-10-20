import { getDb } from '../mongo.js';

export async function listTestimonials() {
  const db = getDb();
  return db.collection('testimonials').find({}).toArray();
}
