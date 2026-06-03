/**
 * lib/netopia/pendingPayments.ts
 * Firestore repository for pending Netopia payment records.
 *
 * A record is written before the user is redirected to Netopia's hosted page
 * and is deleted once the subscription is successfully activated.
 * This decouples subscription activation from the IPN `data` field echo
 * (which is not guaranteed in all Netopia environments) and provides a
 * reliable fallback when the IPN cannot reach the server (e.g. localhost).
 */
import { getAdminFirestore } from '@/lib/firebase/admin';
import type { SubscriptionTier } from '@/lib/subscription/plans';

export interface PendingPayment {
  uid: string;
  plan: SubscriptionTier;
  orderID: string;
  createdAt: string; // ISO-8601
}

const COLLECTION = 'pendingPayments';
const TTL_MS = 24 * 60 * 60 * 1000; // 1 day – stale records older than this are ignored

export async function createPendingPayment(
  orderID: string,
  uid: string,
  plan: SubscriptionTier,
): Promise<void> {
  const db = getAdminFirestore();
  const record: PendingPayment = { uid, plan, orderID, createdAt: new Date().toISOString() };
  await db.collection(COLLECTION).doc(orderID).set(record);
}

export async function getPendingPaymentByOrderId(
  orderID: string,
): Promise<PendingPayment | null> {
  const db = getAdminFirestore();
  const doc = await db.collection(COLLECTION).doc(orderID).get();
  if (!doc.exists) return null;
  return doc.data() as PendingPayment;
}

/**
 * Returns the most recent unexpired pending payment for a user, or null.
 * Used as the redirect-based fallback: if a user lands on the success page
 * and IPN hasn't fired yet, we can still activate their subscription.
 */
export async function getLatestPendingPaymentByUid(
  uid: string,
): Promise<PendingPayment | null> {
  const db = getAdminFirestore();
  const snapshot = await db
    .collection(COLLECTION)
    .where('uid', '==', uid)
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  const record = snapshot.docs[0]!.data() as PendingPayment;

  // Ignore records older than TTL
  if (Date.now() - new Date(record.createdAt).getTime() > TTL_MS) return null;
  return record;
}

export async function deletePendingPayment(orderID: string): Promise<void> {
  const db = getAdminFirestore();
  await db.collection(COLLECTION).doc(orderID).delete();
}
