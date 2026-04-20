/**
 * modules/bookings/infrastructure/firestoreBookingRepository.ts
 */
import { getAdminFirestore } from '@/lib/firebase/admin';
import type { Booking } from '@/modules/bookings/domain/types';

const COLLECTION = 'bookings';

export async function getBookingById(id: string): Promise<Booking | null> {
  const db = getAdminFirestore();
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as Booking;
}

export async function listBookingsByUser(userId: string): Promise<Booking[]> {
  const db = getAdminFirestore();
  const snapshot = await db
    .collection(COLLECTION)
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Booking);
}

export async function listBookingsByCabin(cabinId: string): Promise<Booking[]> {
  const db = getAdminFirestore();
  const snapshot = await db
    .collection(COLLECTION)
    .where('cabin.id', '==', cabinId)
    .orderBy('checkIn')
    .get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Booking);
}

export async function listAllBookings(limit = 100): Promise<Booking[]> {
  const db = getAdminFirestore();
  const snapshot = await db
    .collection(COLLECTION)
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Booking);
}

export async function listBookingsByCabinIds(
  cabinIds: string[],
  limit = 200,
): Promise<Booking[]> {
  if (cabinIds.length === 0) return [];
  const db = getAdminFirestore();

  // Firestore IN supports up to 30 values per query; chunk and merge results.
  const CHUNK_SIZE = 30;
  const chunks: string[][] = [];
  for (let i = 0; i < cabinIds.length; i += CHUNK_SIZE) {
    chunks.push(cabinIds.slice(i, i + CHUNK_SIZE));
  }

  const snapshots = await Promise.all(
    chunks.map((ids) =>
      db
        .collection(COLLECTION)
        .where('cabin.id', 'in', ids)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get(),
    ),
  );

  const all = snapshots.flatMap((snapshot) =>
    snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Booking),
  );

  // Re-sort merged results and apply the total limit.
  return all.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1)).slice(0, limit);
}

export async function listOverlappingBookings(
  cabinId: string,
  checkIn: string,
  checkOut: string,
): Promise<Booking[]> {
  const db = getAdminFirestore();
  // Fetch all active (pending or confirmed) bookings for this cabin and check overlap in memory.
  // Firestore doesn't support two range filters on different fields without a composite index.
  const snapshot = await db
    .collection(COLLECTION)
    .where('cabin.id', '==', cabinId)
    .where('status', 'in', ['pending', 'confirmed'])
    .get();
  const all = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Booking);
  // Two ranges [a, b) and [c, d) overlap when a < d && c < b
  return all.filter((b) => b.checkIn < checkOut && b.checkOut > checkIn);
}

export async function saveBooking(id: string, data: Omit<Booking, 'id'>): Promise<void> {
  const db = getAdminFirestore();
  await db.collection(COLLECTION).doc(id).set(data);
}

export async function updateBookingStatus(
  id: string,
  status: Booking['status'],
): Promise<void> {
  const db = getAdminFirestore();
  await db
    .collection(COLLECTION)
    .doc(id)
    .update({ status, updatedAt: new Date().toISOString() });
}
