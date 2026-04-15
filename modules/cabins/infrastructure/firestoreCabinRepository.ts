/**
 * modules/cabins/infrastructure/firestoreCabinRepository.ts
 */
import { getAdminFirestore } from '@/lib/firebase/admin';
import type { Cabin } from '@/modules/cabins/domain/types';

const COLLECTION = 'cabins';

export async function getCabinBySlug(slug: string): Promise<Cabin | null> {
  const db = getAdminFirestore();
  const snapshot = await db.collection(COLLECTION).where('slug', '==', slug).limit(1).get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0]!;
  return { id: doc.id, ...doc.data() } as Cabin;
}

export async function getCabinById(id: string): Promise<Cabin | null> {
  const db = getAdminFirestore();
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as Cabin;
}

export async function listCabinsByOwner(ownerId: string): Promise<Cabin[]> {
  const db = getAdminFirestore();
  const snapshot = await db
    .collection(COLLECTION)
    .where('ownerId', '==', ownerId)
    .get();
  const cabins = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Cabin);
  // Sort in-memory to avoid requiring a composite Firestore index.
  return cabins.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
}

export async function listPublishedCabins(): Promise<Cabin[]> {
  const db = getAdminFirestore();
  const snapshot = await db
    .collection(COLLECTION)
    .where('published', '==', true)
    .orderBy('title')
    .get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Cabin);
}

export async function listAllCabins(): Promise<Cabin[]> {
  const db = getAdminFirestore();
  const snapshot = await db.collection(COLLECTION).orderBy('createdAt', 'desc').get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Cabin);
}

export async function saveCabin(id: string, data: Omit<Cabin, 'id'>): Promise<void> {
  const db = getAdminFirestore();
  await db.collection(COLLECTION).doc(id).set(data);
}

export async function updateCabin(id: string, data: Partial<Omit<Cabin, 'id'>>): Promise<void> {
  const db = getAdminFirestore();
  await db
    .collection(COLLECTION)
    .doc(id)
    .update({ ...data, updatedAt: new Date().toISOString() });
}

export async function deleteCabin(id: string): Promise<void> {
  const db = getAdminFirestore();
  await db.collection(COLLECTION).doc(id).delete();
}
