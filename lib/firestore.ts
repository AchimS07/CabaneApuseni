import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  arrayUnion,
  arrayRemove,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import type { UserRole } from './auth';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface UserProfile {
  uid: string;
  role: UserRole;
  displayName: string;
  email: string;
  /** Array of cabin IDs the user has saved to their wishlist */
  wishlistedCabins?: string[];
}

export interface Cabin {
  id: string;
  ownerId: string;
  title: string;
  location: string;
  description: string;
  basePricePerNight: number;
  facilities: string[];
  photos: string[];
  published: boolean;
  createdAt: FirebaseTimestamp;
  hidden: boolean;
}

export interface Conversation {
  id: string;
  cabinId: string;
  cabinTitle: string;
  guestId: string;
  ownerId: string;
  status: 'open' | 'accepted' | 'declined';
  createdAt: FirebaseTimestamp;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  proposedPrice?: number;
  type: 'message' | 'proposal';
  createdAt: FirebaseTimestamp;
  hidden?: boolean;
}

export interface Booking {
  id: string;
  conversationId: string;
  cabinId: string;
  guestId: string;
  ownerId: string;
  proposedPrice: number;
  confirmedAt: FirebaseTimestamp;
}

export interface Review {
  id: string;
  bookingId: string;
  cabinId: string;
  guestId: string;
  guestName: string;
  rating: number;
  comment: string;
  createdAt: FirebaseTimestamp;
  hidden: boolean;
}

export interface Report {
  id: string;
  reportedBy: string;
  contentType: 'listing' | 'review' | 'message';
  contentId: string;
  reason: string;
  createdAt: FirebaseTimestamp;
  status: 'pending' | 'actioned';
}

// Firestore Timestamp shape (we avoid importing the full class to keep SSR-safe)
export interface FirebaseTimestamp {
  toDate(): Date;
  seconds: number;
  nanoseconds: number;
}

export type CursorDoc = QueryDocumentSnapshot<DocumentData>;

// ── User ──────────────────────────────────────────────────────────────────────

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

// ── Cabins ────────────────────────────────────────────────────────────────────

export async function getPublishedCabins(
  lastDoc: CursorDoc | null,
  pageSize = 12,
): Promise<{ cabins: Cabin[]; lastDoc: CursorDoc | null }> {
  // Requires composite index: published ASC, hidden ASC, createdAt DESC
  let q;
  if (lastDoc) {
    q = query(
      collection(db, 'cabins'),
      where('published', '==', true),
      where('hidden', '==', false),
      orderBy('createdAt', 'desc'),
      startAfter(lastDoc),
      limit(pageSize),
    );
  } else {
    q = query(
      collection(db, 'cabins'),
      where('published', '==', true),
      where('hidden', '==', false),
      orderBy('createdAt', 'desc'),
      limit(pageSize),
    );
  }
  const snapshot = await getDocs(q);
  const cabins = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Cabin));
  return { cabins, lastDoc: snapshot.docs[snapshot.docs.length - 1] ?? null };
}

export async function getCabin(id: string): Promise<Cabin | null> {
  const snap = await getDoc(doc(db, 'cabins', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Cabin;
}

export async function getOwnerCabins(ownerId: string): Promise<Cabin[]> {
  const snapshot = await getDocs(
    query(
      collection(db, 'cabins'),
      where('ownerId', '==', ownerId),
      orderBy('createdAt', 'desc'),
    ),
  );
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Cabin));
}

export async function createCabin(
  data: Omit<Cabin, 'id' | 'createdAt'>,
): Promise<string> {
  const ref = await addDoc(collection(db, 'cabins'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateCabin(
  id: string,
  data: Partial<Omit<Cabin, 'id' | 'createdAt'>>,
): Promise<void> {
  await updateDoc(doc(db, 'cabins', id), data as DocumentData);
}

// ── Conversations ─────────────────────────────────────────────────────────────

export async function getOrCreateConversation(
  cabinId: string,
  guestId: string,
  ownerId: string,
  cabinTitle: string,
): Promise<string> {
  const snapshot = await getDocs(
    query(
      collection(db, 'conversations'),
      where('cabinId', '==', cabinId),
      where('guestId', '==', guestId),
      limit(1),
    ),
  );
  if (!snapshot.empty) return snapshot.docs[0].id;

  const ref = await addDoc(collection(db, 'conversations'), {
    cabinId,
    cabinTitle,
    guestId,
    ownerId,
    status: 'open',
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getConversation(id: string): Promise<Conversation | null> {
  const snap = await getDoc(doc(db, 'conversations', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Conversation;
}

export async function getUserConversations(
  userId: string,
  role: 'guest' | 'owner',
): Promise<Conversation[]> {
  const field = role === 'guest' ? 'guestId' : 'ownerId';
  const snapshot = await getDocs(
    query(
      collection(db, 'conversations'),
      where(field, '==', userId),
      orderBy('createdAt', 'desc'),
    ),
  );
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Conversation));
}

export function subscribeToConversation(
  id: string,
  callback: (conv: Conversation | null) => void,
): () => void {
  return onSnapshot(doc(db, 'conversations', id), (snap) => {
    callback(snap.exists() ? ({ id: snap.id, ...snap.data() } as Conversation) : null);
  });
}

// ── Messages ──────────────────────────────────────────────────────────────────

export function subscribeToMessages(
  conversationId: string,
  callback: (messages: Message[]) => void,
): () => void {
  return onSnapshot(
    query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('createdAt', 'asc'),
    ),
    (snapshot) => {
      callback(
        snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() } as Message))
          .filter((m) => !m.hidden),
      );
    },
  );
}

export async function sendMessage(
  conversationId: string,
  payload: Omit<Message, 'id' | 'createdAt'>,
): Promise<void> {
  await addDoc(
    collection(db, 'conversations', conversationId, 'messages'),
    { ...payload, createdAt: serverTimestamp() },
  );
}

// ── Proposals ─────────────────────────────────────────────────────────────────

export async function acceptProposal(
  conversationId: string,
  proposedPrice: number,
  cabinId: string,
  guestId: string,
  ownerId: string,
): Promise<string> {
  const batch = writeBatch(db);
  batch.update(doc(db, 'conversations', conversationId), { status: 'accepted' });
  const bookingRef = doc(collection(db, 'bookings'));
  batch.set(bookingRef, {
    conversationId,
    cabinId,
    guestId,
    ownerId,
    proposedPrice,
    confirmedAt: serverTimestamp(),
  });
  await batch.commit();
  return bookingRef.id;
}

export async function declineProposal(conversationId: string): Promise<void> {
  await updateDoc(doc(db, 'conversations', conversationId), { status: 'declined' });
}

// ── Bookings ──────────────────────────────────────────────────────────────────

export async function getBookingByConversation(
  conversationId: string,
): Promise<Booking | null> {
  const snapshot = await getDocs(
    query(collection(db, 'bookings'), where('conversationId', '==', conversationId), limit(1)),
  );
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Booking;
}

// ── Reviews ───────────────────────────────────────────────────────────────────

export async function createReview(
  data: Omit<Review, 'id' | 'createdAt' | 'hidden'>,
): Promise<void> {
  await addDoc(collection(db, 'reviews'), {
    ...data,
    hidden: false,
    createdAt: serverTimestamp(),
  });
}

export async function getBookingReview(bookingId: string): Promise<Review | null> {
  const snapshot = await getDocs(
    query(collection(db, 'reviews'), where('bookingId', '==', bookingId), limit(1)),
  );
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Review;
}

export async function getCabinReviews(cabinId: string): Promise<Review[]> {
  // Requires composite index: cabinId ASC, hidden ASC, createdAt DESC
  const snapshot = await getDocs(
    query(
      collection(db, 'reviews'),
      where('cabinId', '==', cabinId),
      where('hidden', '==', false),
      orderBy('createdAt', 'desc'),
    ),
  );
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Review));
}

// ── Reports ───────────────────────────────────────────────────────────────────

export async function createReport(
  data: Omit<Report, 'id' | 'createdAt' | 'status'>,
): Promise<void> {
  await addDoc(collection(db, 'reports'), {
    ...data,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
}

export async function getPendingReports(): Promise<Report[]> {
  const snapshot = await getDocs(
    query(
      collection(db, 'reports'),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc'),
    ),
  );
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Report));
}

export async function actionReport(reportId: string): Promise<void> {
  await updateDoc(doc(db, 'reports', reportId), { status: 'actioned' });
}

export async function hideAndActionReport(
  reportId: string,
  contentType: 'listing' | 'review',
  contentId: string,
): Promise<void> {
  const batch = writeBatch(db);
  const collName = contentType === 'listing' ? 'cabins' : 'reviews';
  batch.update(doc(db, collName, contentId), { hidden: true });
  batch.update(doc(db, 'reports', reportId), { status: 'actioned' });
  await batch.commit();
}

// ── Wishlist ──────────────────────────────────────────────────────────────────

/**
 * Returns the list of cabin IDs the user has wishlisted.
 */
export async function getWishlistedCabins(uid: string): Promise<string[]> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return [];
  return (snap.data() as UserProfile).wishlistedCabins ?? [];
}

/**
 * Adds or removes a cabin from the user's wishlist using atomic Firestore operations.
 */
export async function toggleWishlistCabin(
  uid: string,
  cabinId: string,
  add: boolean,
): Promise<void> {
  await updateDoc(doc(db, 'users', uid), {
    wishlistedCabins: add ? arrayUnion(cabinId) : arrayRemove(cabinId),
  });
}
