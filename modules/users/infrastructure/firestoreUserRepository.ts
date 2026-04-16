/**
 * modules/users/infrastructure/firestoreUserRepository.ts
 * Firestore data access for user profiles.
 */
import { getAdminFirestore } from '@/lib/firebase/admin';
import type { UserProfile } from '@/modules/users/domain/types';

const COLLECTION = 'users';

export async function getUserById(uid: string): Promise<UserProfile | null> {
  const db = getAdminFirestore();
  const doc = await db.collection(COLLECTION).doc(uid).get();
  if (!doc.exists) return null;
  return { uid: doc.id, ...doc.data() } as UserProfile;
}

export async function upsertUser(uid: string, data: Partial<Omit<UserProfile, 'uid'>>): Promise<void> {
  const db = getAdminFirestore();
  // Firebase Admin SDK throws on undefined field values. Strip them before writing.
  const sanitized = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined),
  ) as Partial<Omit<UserProfile, 'uid'>>;
  await db
    .collection(COLLECTION)
    .doc(uid)
    .set({ ...sanitized, updatedAt: new Date().toISOString() }, { merge: true });
}

export async function listUsers(limit = 50): Promise<UserProfile[]> {
  const db = getAdminFirestore();
  const snapshot = await db.collection(COLLECTION).orderBy('createdAt', 'desc').limit(limit).get();
  return snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() }) as UserProfile);
}

export async function getUserByStripeCustomerId(customerId: string): Promise<UserProfile | null> {
  const db = getAdminFirestore();
  const snapshot = await db
    .collection(COLLECTION)
    .where('stripeCustomerId', '==', customerId)
    .limit(1)
    .get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0]!;
  return { uid: doc.id, ...doc.data() } as UserProfile;
}
