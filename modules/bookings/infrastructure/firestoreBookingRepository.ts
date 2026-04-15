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
