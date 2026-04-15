#!/usr/bin/env node
/**
 * Project scaffold – run automatically via `npm install` (postinstall).
 * Creates lib/, components/, and all app/ route sub-directories with source files.
 * Existing files are left untouched so it is safe to re-run.
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const ROOT = dirname(fileURLToPath(import.meta.url));

function write(rel, content) {
  const full = join(ROOT, rel);
  mkdirSync(dirname(full), { recursive: true });
  if (existsSync(full)) {
    process.stdout.write('  skip    ' + rel + '\n');
    return;
  }
  writeFileSync(full, content, 'utf-8');
  process.stdout.write('  create  ' + rel + '\n');
}

console.log('\n\u{1F3D4}\uFE0F  Cabane Apuseni \u2013 generating project sources\u2026\n');

// ─────────────────────────────────────────────────────────────────────────────
// lib/firebase.ts
// ─────────────────────────────────────────────────────────────────────────────
write('lib/firebase.ts', `import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY            ?? 'placeholder-api-key',
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN        ?? 'placeholder.firebaseapp.com',
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID         ?? 'placeholder-project-id',
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET     ?? 'placeholder-project-id.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '000000000000',
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID             ?? '1:000000000000:web:placeholder',
};

// Prevent re-initialisation during hot-reload
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);

export default app;
`);

// ─────────────────────────────────────────────────────────────────────────────
// lib/auth.ts
// ─────────────────────────────────────────────────────────────────────────────
write('lib/auth.ts', `import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

export type UserRole = 'owner' | 'guest' | 'admin';

export async function signUp(
  email: string,
  password: string,
  displayName: string,
  role: 'owner' | 'guest',
): Promise<User> {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    email,
    displayName,
    role,
    createdAt: serverTimestamp(),
  });
  return user;
}

export async function signIn(email: string, password: string): Promise<User> {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}
`);

// ─────────────────────────────────────────────────────────────────────────────
// lib/firestore.ts
// ─────────────────────────────────────────────────────────────────────────────
write('lib/firestore.ts', `import {
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
`);

// ─────────────────────────────────────────────────────────────────────────────
// lib/storage.ts
// ─────────────────────────────────────────────────────────────────────────────
write('lib/storage.ts', `import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export async function uploadCabinPhoto(file: File): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filename = Date.now() + '_' + safeName;
  const fileRef = ref(storage, 'cabins/' + filename);
  const snapshot = await uploadBytes(fileRef, file);
  return getDownloadURL(snapshot.ref);
}
`);

// ─────────────────────────────────────────────────────────────────────────────
// lib/constants.ts
// ─────────────────────────────────────────────────────────────────────────────
write('lib/constants.ts', `export interface Facility {
  id: string;
  label: string;
  icon: string;
}

export const FACILITIES: Facility[] = [
  { id: 'wifi',            label: 'WiFi',              icon: '\u{1F4F6}' },
  { id: 'parking',         label: 'Parking',            icon: '\u{1F17F}\uFE0F' },
  { id: 'kitchen',         label: 'Kitchen',            icon: '\u{1F373}' },
  { id: 'fireplace',       label: 'Fireplace',          icon: '\u{1F525}' },
  { id: 'bbq',             label: 'BBQ Grill',          icon: '\u{1F356}' },
  { id: 'hot_tub',         label: 'Hot Tub',            icon: '\u{1F6C1}' },
  { id: 'heating',         label: 'Heating',            icon: '\u2668\uFE0F' },
  { id: 'washing_machine', label: 'Washing Machine',    icon: '\u{1FAE7}' },
  { id: 'tv',              label: 'TV',                 icon: '\u{1F4FA}' },
  { id: 'pets',            label: 'Pet Friendly',       icon: '\u{1F43E}' },
  { id: 'hiking',          label: 'Hiking Trails',      icon: '\u{1F97E}' },
  { id: 'mountain_view',   label: 'Mountain View',      icon: '\u26F0\uFE0F' },
  { id: 'outdoor_seating', label: 'Outdoor Seating',    icon: '\u{1FA91}' },
  { id: 'terrace',         label: 'Terrace / Balcony',  icon: '\u{1F33F}' },
  { id: 'river_view',      label: 'River View',         icon: '\u{1F3DE}\uFE0F' },
  { id: 'sauna',           label: 'Sauna',              icon: '\u{1F9D6}' },
];
`);

// ─────────────────────────────────────────────────────────────────────────────
// lib/hooks/useAuth.ts
// ─────────────────────────────────────────────────────────────────────────────
write('lib/hooks/useAuth.ts', `// Re-export from the central providers module so consumers import from a
// predictable lib path without depending directly on the app/ tree.
export { useAuth } from '../../app/providers';
`);

// ─────────────────────────────────────────────────────────────────────────────
// lib/hooks/useRequireRole.ts
// ─────────────────────────────────────────────────────────────────────────────
write('lib/hooks/useRequireRole.ts', `'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';
import type { UserRole } from '../auth';

export function useRequireRole(requiredRoles: UserRole | UserRole[]) {
  const { profile, loading } = useAuth();
  const router = useRouter();

  // Convert to a stable string to avoid infinite-loop from array identity changes
  const rolesKey = Array.isArray(requiredRoles)
    ? requiredRoles.join(',')
    : requiredRoles;

  useEffect(() => {
    if (loading) return;
    const roles = rolesKey.split(',') as UserRole[];
    if (!profile) {
      router.push('/auth/login');
      return;
    }
    if (!roles.includes(profile.role)) {
      router.push('/');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, loading, rolesKey]);

  return { profile, loading };
}
`);

// ─────────────────────────────────────────────────────────────────────────────
// components/Navbar.tsx
// ─────────────────────────────────────────────────────────────────────────────
write('components/Navbar.tsx', `'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { signOut } from '@/lib/auth';

export default function Navbar() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch { /* ignore */ }
  };

  return (
    <nav
      className="bg-forest-900 text-white sticky top-0 z-50 shadow-lg"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl hover:text-forest-200 transition-colors"
          >
            <span aria-hidden="true">\u{1F3D4}\uFE0F</span>
            <span>Cabane Apuseni</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-forest-100 hover:text-white text-sm transition-colors">
              Browse
            </Link>
            {profile?.role === 'owner' && (
              <Link href="/owner/listings" className="text-forest-100 hover:text-white text-sm transition-colors">
                My Listings
              </Link>
            )}
            {profile && (
              <Link href="/messages" className="text-forest-100 hover:text-white text-sm transition-colors">
                Messages
              </Link>
            )}
            {profile?.role === 'admin' && (
              <Link href="/admin/moderation" className="text-forest-100 hover:text-white text-sm transition-colors">
                Moderation
              </Link>
            )}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {!loading && !user && (
              <>
                <Link href="/auth/login" className="text-forest-100 hover:text-white text-sm transition-colors">
                  Sign In
                </Link>
                <Link href="/auth/register" className="bg-earth-600 hover:bg-earth-700 text-white text-sm px-3 py-1.5 rounded-lg transition-colors">
                  Register
                </Link>
              </>
            )}
            {!loading && user && (
              <div className="flex items-center gap-3">
                <span className="text-forest-200 text-sm truncate max-w-[8rem]">
                  {profile?.displayName ?? user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="bg-forest-700 hover:bg-forest-600 text-white text-sm px-3 py-1.5 rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-forest-700 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label="Toggle navigation menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div id="mobile-menu" className="md:hidden py-4 border-t border-forest-700 flex flex-col gap-3">
            <Link href="/"                className="text-forest-100 hover:text-white text-sm py-1" onClick={() => setMenuOpen(false)}>Browse</Link>
            {profile?.role === 'owner' && (
              <Link href="/owner/listings" className="text-forest-100 hover:text-white text-sm py-1" onClick={() => setMenuOpen(false)}>My Listings</Link>
            )}
            {profile && (
              <Link href="/messages"       className="text-forest-100 hover:text-white text-sm py-1" onClick={() => setMenuOpen(false)}>Messages</Link>
            )}
            {profile?.role === 'admin' && (
              <Link href="/admin/moderation" className="text-forest-100 hover:text-white text-sm py-1" onClick={() => setMenuOpen(false)}>Moderation</Link>
            )}
            {!loading && !user && (
              <>
                <Link href="/auth/login"    className="text-forest-100 hover:text-white text-sm py-1" onClick={() => setMenuOpen(false)}>Sign In</Link>
                <Link href="/auth/register" className="text-forest-100 hover:text-white text-sm py-1" onClick={() => setMenuOpen(false)}>Register</Link>
              </>
            )}
            {!loading && user && (
              <button
                onClick={() => { handleSignOut(); setMenuOpen(false); }}
                className="text-forest-100 hover:text-white text-sm py-1 text-left"
              >
                Sign Out
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
`);

// ─────────────────────────────────────────────────────────────────────────────
// components/CabinCard.tsx
// ─────────────────────────────────────────────────────────────────────────────
write('components/CabinCard.tsx', `'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { type Cabin } from '@/lib/firestore';
import ReportButton from './ReportButton';

interface Props {
  cabin: Cabin;
}

export default function CabinCard({ cabin }: Props) {
  const { user } = useAuth();
  const mainPhoto = cabin.photos[0] ?? '';

  return (
    <article className="card overflow-hidden hover:shadow-md transition-shadow group">
      <div className="relative aspect-[4/3] bg-stone-100">
        {mainPhoto ? (
          <Image
            src={mainPhoto}
            alt={cabin.title + ' \u2013 main photo'}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw,(max-width: 1024px) 50vw,25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-300 text-5xl" aria-hidden="true">
            \u{1F3D4}\uFE0F
          </div>
        )}
        {user && (
          <div className="absolute top-2 right-2">
            <ReportButton contentType="listing" contentId={cabin.id} />
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-stone-800 leading-snug line-clamp-2 flex-1">{cabin.title}</h3>
          <span className="text-forest-700 font-bold text-sm whitespace-nowrap shrink-0">
            {'\u20ac' + cabin.basePricePerNight + '/night'}
          </span>
        </div>
        <p className="text-stone-500 text-xs flex items-center gap-1 mb-4">
          <span aria-hidden="true">\u{1F4CD}</span>
          {cabin.location}
        </p>
        <Link
          href={'/cabins/' + cabin.id}
          className="btn-primary w-full justify-center"
          aria-label={'View cabin: ' + cabin.title}
        >
          View Cabin
        </Link>
      </div>
    </article>
  );
}
`);

// ─────────────────────────────────────────────────────────────────────────────
// components/PhotoGallery.tsx
// ─────────────────────────────────────────────────────────────────────────────
write('components/PhotoGallery.tsx', `'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface Props {
  photos: string[];
  title: string;
}

export default function PhotoGallery({ photos, title }: Props) {
  const [selected, setSelected] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const prev = useCallback(
    () => setSelected((i) => (i - 1 + photos.length) % photos.length),
    [photos.length],
  );
  const next = useCallback(
    () => setSelected((i) => (i + 1) % photos.length),
    [photos.length],
  );

  useEffect(() => {
    if (!lightbox) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape')      setLightbox(false);
      if (e.key === 'ArrowLeft')   prev();
      if (e.key === 'ArrowRight')  next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox, prev, next]);

  if (photos.length === 0) {
    return (
      <div className="bg-stone-100 rounded-xl h-64 flex items-center justify-center">
        <p className="text-stone-400 text-sm">No photos available</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {/* Main image */}
        <button
          onClick={() => setLightbox(true)}
          className="w-full relative aspect-video rounded-xl overflow-hidden cursor-zoom-in focus-visible:outline focus-visible:outline-2 focus-visible:outline-forest-600"
          aria-label={'Open photo ' + (selected + 1) + ' of ' + photos.length + ' in lightbox'}
        >
          <Image
            src={photos[selected]}
            alt={title + ' \u2013 photo ' + (selected + 1)}
            fill
            className="object-cover"
            priority={selected === 0}
            sizes="(max-width: 768px) 100vw, 60vw"
          />
        </button>

        {/* Thumbnails */}
        {photos.length > 1 && (
          <div
            className="flex gap-2 overflow-x-auto pb-1"
            role="list"
            aria-label="Photo thumbnails"
          >
            {photos.map((photo, idx) => (
              <button
                key={idx}
                role="listitem"
                onClick={() => setSelected(idx)}
                aria-label={'Photo ' + (idx + 1)}
                aria-pressed={selected === idx}
                className={
                  'relative flex-none w-20 h-16 rounded-lg overflow-hidden transition-all ' +
                  (selected === idx
                    ? 'ring-2 ring-forest-600 ring-offset-1 opacity-100'
                    : 'opacity-60 hover:opacity-90')
                }
              >
                <Image
                  src={photo}
                  alt={title + ' thumbnail ' + (idx + 1)}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={'Photo lightbox \u2013 ' + title}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-stone-300 text-3xl w-10 h-10 flex items-center justify-center"
            onClick={() => setLightbox(false)}
            aria-label="Close lightbox"
          >
            \u00d7
          </button>

          {photos.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-stone-300 text-5xl w-12 h-12 flex items-center justify-center"
                onClick={(e) => { e.stopPropagation(); prev(); }}
                aria-label="Previous photo"
              >
                \u2039
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-stone-300 text-5xl w-12 h-12 flex items-center justify-center"
                onClick={(e) => { e.stopPropagation(); next(); }}
                aria-label="Next photo"
              >
                \u203a
              </button>
            </>
          )}

          <div
            className="relative max-w-5xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={photos[selected]}
              alt={title + ' \u2013 photo ' + (selected + 1)}
              width={1200}
              height={800}
              className="object-contain w-full h-auto max-h-[85vh] rounded"
            />
          </div>

          <p className="absolute bottom-4 text-white text-sm" aria-live="polite">
            {(selected + 1) + ' / ' + photos.length}
          </p>
        </div>
      )}
    </>
  );
}
`);

// ─────────────────────────────────────────────────────────────────────────────
// components/StarRating.tsx
// ─────────────────────────────────────────────────────────────────────────────
write('components/StarRating.tsx', `'use client';

import { useState } from 'react';

interface Props {
  value: number;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
}

const SIZE: Record<string, string> = { sm: 'text-base', md: 'text-xl', lg: 'text-3xl' };

export default function StarRating({ value, onChange, size = 'md', readonly = false }: Props) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <div
      className={'flex gap-0.5 ' + (SIZE[size] ?? SIZE.md)}
      role={readonly ? 'img' : 'group'}
      aria-label={'Rating: ' + value + ' out of 5 stars'}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          aria-label={'Rate ' + star + (star === 1 ? ' star' : ' stars')}
          aria-pressed={value >= star}
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={
            'transition-transform ' +
            (readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110') +
            ' disabled:cursor-default'
          }
        >
          <span aria-hidden="true">{active >= star ? '\u2605' : '\u2606'}</span>
        </button>
      ))}
    </div>
  );
}
`);

// ─────────────────────────────────────────────────────────────────────────────
// components/ReviewCard.tsx
// ─────────────────────────────────────────────────────────────────────────────
write('components/ReviewCard.tsx', `'use client';

import { type Review, type FirebaseTimestamp } from '@/lib/firestore';
import StarRating from './StarRating';
import ReportButton from './ReportButton';
import { useAuth } from '@/lib/hooks/useAuth';

interface Props { review: Review }

function fmtDate(ts: FirebaseTimestamp | null | undefined): string {
  if (!ts) return '';
  try {
    return ts.toDate().toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch { return ''; }
}

export default function ReviewCard({ review }: Props) {
  const { user } = useAuth();

  return (
    <article className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <StarRating value={review.rating} readonly size="sm" />
            <span className="text-stone-400 text-xs">{fmtDate(review.createdAt)}</span>
          </div>
          <p className="font-medium text-stone-800 text-sm">{review.guestName}</p>
          <p className="text-stone-600 text-sm leading-relaxed mt-1">{review.comment}</p>
        </div>
        {user && user.uid !== review.guestId && (
          <div className="shrink-0">
            <ReportButton contentType="review" contentId={review.id} />
          </div>
        )}
      </div>
    </article>
  );
}
`);

// ─────────────────────────────────────────────────────────────────────────────
// components/ReportButton.tsx
// ─────────────────────────────────────────────────────────────────────────────
write('components/ReportButton.tsx', `'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { createReport } from '@/lib/firestore';

interface Props {
  contentType: 'listing' | 'review' | 'message';
  contentId: string;
}

export default function ReportButton({ contentType, contentId }: Props) {
  const { user } = useAuth();
  const [open,      setOpen]      = useState(false);
  const [reason,    setReason]    = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error,     setError]     = useState('');

  if (!user) return null;

  const openDialog = () => { setOpen(true); setSubmitted(false); setReason(''); setError(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) { setError('Please provide a reason.'); return; }
    setSubmitting(true);
    setError('');
    try {
      await createReport({ reportedBy: user.uid, contentType, contentId, reason: reason.trim() });
      setSubmitted(true);
    } catch {
      setError('Failed to submit report. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={openDialog}
        className="text-stone-400 hover:text-red-500 transition-colors p-1 rounded"
        aria-label={'Report this ' + contentType}
        title={'Report this ' + contentType}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 21V5a2 2 0 012-2h13l-3 4H5v12m0 0l4-4h12" />
        </svg>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-title"
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 id="report-title" className="text-lg font-semibold text-stone-800 mb-4 capitalize">
              {'Report ' + contentType}
            </h2>

            {submitted ? (
              <div className="text-center py-4 space-y-4">
                <p className="text-green-700 font-medium">Thank you \u2013 your report has been submitted.</p>
                <button onClick={() => setOpen(false)} className="btn-primary">Close</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <label htmlFor="report-reason" className="label">Reason for reporting</label>
                <textarea
                  id="report-reason"
                  className="input-field min-h-[6rem] resize-none"
                  placeholder="Describe why this content is inappropriate\u2026"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  maxLength={500}
                  required
                />
                {error && <p className="error-msg" role="alert">{error}</p>}
                <div className="flex gap-3 mt-4">
                  <button type="submit" disabled={submitting} className="btn-primary flex-1">
                    {submitting ? 'Submitting\u2026' : 'Submit Report'}
                  </button>
                  <button type="button" onClick={() => setOpen(false)} className="btn-secondary flex-1">
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
`);

// ─────────────────────────────────────────────────────────────────────────────
// components/ConversationThread.tsx
// ─────────────────────────────────────────────────────────────────────────────
write('components/ConversationThread.tsx', `'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  type Conversation,
  type Message,
  type Booking,
  type Review,
  type UserProfile,
  type FirebaseTimestamp,
  subscribeToConversation,
  subscribeToMessages,
  sendMessage,
  acceptProposal,
  declineProposal,
  getBookingByConversation,
  getBookingReview,
  getUserProfile,
} from '@/lib/firestore';
import { useAuth } from '@/lib/hooks/useAuth';
import ReportButton from './ReportButton';

interface Props { conversationId: string }

function fmtTime(ts: FirebaseTimestamp | undefined): string {
  if (!ts) return '';
  try { return ts.toDate().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); }
  catch { return ''; }
}

function fmtDate(ts: FirebaseTimestamp | undefined): string {
  if (!ts) return '';
  try { return ts.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }); }
  catch { return ''; }
}

export default function ConversationThread({ conversationId }: Props) {
  const { user, profile } = useAuth();
  const [conversation,  setConversation]  = useState<Conversation | null>(null);
  const [messages,      setMessages]      = useState<Message[]>([]);
  const [booking,       setBooking]       = useState<Booking | null>(null);
  const [review,        setReview]        = useState<Review | null>(null);
  const [otherUser,     setOtherUser]     = useState<UserProfile | null>(null);
  const [text,          setText]          = useState('');
  const [proposalPrice, setProposalPrice] = useState('');
  const [showProposal,  setShowProposal]  = useState(false);
  const [sending,       setSending]       = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error,         setError]         = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => subscribeToConversation(conversationId, setConversation), [conversationId]);
  useEffect(() => subscribeToMessages(conversationId, setMessages), [conversationId]);

  useEffect(() => {
    if (conversation?.status === 'accepted') {
      getBookingByConversation(conversationId).then(setBooking).catch(() => {});
    }
  }, [conversation?.status, conversationId]);

  useEffect(() => {
    if (booking?.id) getBookingReview(booking.id).then(setReview).catch(() => {});
  }, [booking?.id]);

  useEffect(() => {
    if (!conversation || !profile) return;
    const otherId = profile.role === 'guest' ? conversation.ownerId : conversation.guestId;
    getUserProfile(otherId).then(setOtherUser).catch(() => {});
  }, [conversation, profile]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendText = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !user) return;
    setSending(true); setError('');
    try {
      await sendMessage(conversationId, { senderId: user.uid, text: text.trim(), type: 'message' });
      setText('');
    } catch { setError('Failed to send message.'); }
    finally   { setSending(false); }
  }, [conversationId, text, user]);

  const sendProposal = useCallback(async () => {
    const price = parseFloat(proposalPrice);
    if (!price || price <= 0 || !user) { setError('Enter a valid price greater than 0.'); return; }
    setSending(true); setError('');
    try {
      await sendMessage(conversationId, {
        senderId: user.uid,
        text: 'Price proposal: \u20ac' + price,
        proposedPrice: price,
        type: 'proposal',
      });
      setProposalPrice(''); setShowProposal(false);
    } catch { setError('Failed to send proposal.'); }
    finally   { setSending(false); }
  }, [conversationId, proposalPrice, user]);

  const handleAccept = useCallback(async (msg: Message) => {
    if (!conversation || !msg.proposedPrice) return;
    setActionLoading(msg.id); setError('');
    try {
      await acceptProposal(
        conversationId, msg.proposedPrice,
        conversation.cabinId, conversation.guestId, conversation.ownerId,
      );
    } catch { setError('Failed to accept proposal.'); }
    finally   { setActionLoading(null); }
  }, [conversation, conversationId]);

  const handleDecline = useCallback(async () => {
    setActionLoading('decline'); setError('');
    try   { await declineProposal(conversationId); }
    catch { setError('Failed to decline.'); }
    finally { setActionLoading(null); }
  }, [conversationId]);

  if (!profile) return null;

  const isOwner = profile.role === 'owner';
  const isGuest = profile.role === 'guest';
  const isOpen  = conversation?.status === 'open';
  const statusCls =
    conversation?.status === 'accepted' ? 'badge-accepted' :
    conversation?.status === 'declined' ? 'badge-declined' : 'badge-open';

  return (
    <div className="card flex flex-col" style={{ height: '72vh', minHeight: '420px' }}>

      {/* Header */}
      <div className="p-4 border-b border-stone-200 flex items-center justify-between gap-3 shrink-0">
        <div className="min-w-0">
          <h1 className="font-semibold text-stone-800 truncate">
            {conversation?.cabinTitle ?? 'Conversation'}
          </h1>
          {otherUser && (
            <p className="text-stone-500 text-sm">
              {(isOwner ? 'Guest: ' : 'Owner: ') + otherUser.displayName}
            </p>
          )}
        </div>
        {conversation && <span className={statusCls}>{conversation.status}</span>}
      </div>

      {/* Status banners */}
      {conversation?.status === 'accepted' && (
        <div className="px-4 py-2 bg-green-50 border-b border-green-200 text-green-800 text-sm shrink-0">
          {'Booking confirmed' + (booking ? ' \u2014 \u20ac' + booking.proposedPrice : '')}
        </div>
      )}
      {conversation?.status === 'declined' && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-200 text-red-800 text-sm shrink-0">
          This proposal was declined.
        </div>
      )}

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-3"
        aria-live="polite"
        aria-label="Messages"
      >
        {messages.length === 0 && (
          <p className="text-center text-stone-400 text-sm py-8">
            No messages yet. Start the conversation!
          </p>
        )}

        {messages.map((msg) => {
          const isMine = msg.senderId === user?.uid;
          return (
            <div key={msg.id} className={'flex ' + (isMine ? 'justify-end' : 'justify-start')}>
              {msg.type === 'proposal' ? (
                <div className="card p-4 border-earth-200 bg-earth-50 w-full max-w-xs">
                  <p className="text-xs font-semibold text-earth-700 mb-1 uppercase tracking-wide">
                    Price Proposal
                  </p>
                  <p className="text-2xl font-bold text-earth-800">{'\u20ac' + msg.proposedPrice}</p>
                  <p className="text-xs text-stone-400 mt-1">
                    {fmtDate(msg.createdAt) + ' ' + fmtTime(msg.createdAt)}
                  </p>
                  {isOwner && isOpen && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleAccept(msg)}
                        disabled={actionLoading === msg.id}
                        className="btn-primary text-xs py-1.5 flex-1"
                      >
                        {actionLoading === msg.id ? '\u2026' : '\u2713 Accept'}
                      </button>
                      <button
                        onClick={handleDecline}
                        disabled={actionLoading !== null}
                        className="btn-danger text-xs py-1.5 flex-1"
                      >
                        {actionLoading === 'decline' ? '\u2026' : '\u2717 Decline'}
                      </button>
                    </div>
                  )}
                  {!isMine && user && (
                    <div className="mt-2">
                      <ReportButton contentType="message" contentId={conversationId + '/' + msg.id} />
                    </div>
                  )}
                </div>
              ) : (
                <div className={
                  'max-w-[75%] rounded-2xl px-3 py-2 ' +
                  (isMine
                    ? 'bg-forest-700 text-white rounded-br-none'
                    : 'bg-stone-100 text-stone-800 rounded-bl-none')
                }>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  <div className={'flex items-center gap-1 mt-0.5 ' + (isMine ? 'justify-end' : 'justify-start')}>
                    <span className={'text-xs ' + (isMine ? 'text-forest-200' : 'text-stone-400')}>
                      {fmtTime(msg.createdAt)}
                    </span>
                    {!isMine && user && (
                      <ReportButton contentType="message" contentId={conversationId + '/' + msg.id} />
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {error && <p className="px-4 py-1 text-red-600 text-sm shrink-0" role="alert">{error}</p>}

      {/* Leave review CTA */}
      {isGuest && booking && !review && (
        <div className="px-4 py-2 bg-earth-50 border-t border-earth-200 flex items-center justify-between shrink-0">
          <p className="text-earth-800 text-sm font-medium">Enjoyed your stay?</p>
          <Link href={'/reviews/new?bookingId=' + booking.id} className="btn-primary text-sm py-1.5">
            Leave a Review
          </Link>
        </div>
      )}

      {/* Input area */}
      {(isOpen || !conversation) && (
        <div className="p-4 border-t border-stone-200 shrink-0 space-y-2">
          {showProposal ? (
            <div className="flex gap-2">
              <label htmlFor="proposal-input" className="sr-only">Proposed price in euros</label>
              <input
                id="proposal-input"
                type="number"
                min="1"
                step="1"
                className="input-field"
                placeholder="Price in \u20ac (e.g. 150)"
                value={proposalPrice}
                onChange={(e) => setProposalPrice(e.target.value)}
              />
              <button onClick={sendProposal} disabled={sending} className="btn-primary shrink-0">
                {sending ? '\u2026' : 'Send'}
              </button>
              <button onClick={() => setShowProposal(false)} className="btn-secondary shrink-0">Cancel</button>
            </div>
          ) : (
            <form onSubmit={sendText} className="flex gap-2">
              <label htmlFor="msg-input" className="sr-only">Type a message</label>
              <input
                id="msg-input"
                type="text"
                className="input-field"
                placeholder="Type a message\u2026"
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={sending}
              />
              <button type="submit" disabled={sending || !text.trim()} className="btn-primary shrink-0">
                {sending ? '\u2026' : 'Send'}
              </button>
              {isGuest && (
                <button
                  type="button"
                  onClick={() => setShowProposal(true)}
                  className="btn-secondary shrink-0 whitespace-nowrap"
                >
                  Propose Price
                </button>
              )}
            </form>
          )}
        </div>
      )}
    </div>
  );
}
`);

// ─────────────────────────────────────────────────────────────────────────────
// app/auth/login/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
write('app/auth/login/page.tsx', `'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await signIn(email, password);
      router.push('/');
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      setError(
        code === 'auth/invalid-credential' ||
        code === 'auth/wrong-password'     ||
        code === 'auth/user-not-found'
          ? 'Invalid email or password.'
          : 'Sign-in failed. Please try again.',
      );
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="card w-full max-w-md p-8">
        <div className="text-center mb-8">
          <span className="text-5xl" aria-hidden="true">\u{1F3D4}\uFE0F</span>
          <h1 className="text-2xl font-bold text-stone-800 mt-3">Welcome back</h1>
          <p className="text-stone-500 text-sm mt-1">Sign in to your Cabane Apuseni account</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="email" className="label">Email address</label>
            <input
              id="email" type="email" autoComplete="email" required
              className="input-field" placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="label">Password</label>
            <input
              id="password" type="password" autoComplete="current-password" required
              className="input-field" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="error-msg" role="alert">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2">
            {loading ? 'Signing in\u2026' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-stone-500 mt-6">
          Don\u2019t have an account?{' '}
          <Link href="/auth/register" className="text-forest-700 hover:text-forest-900 font-medium">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
`);

// ─────────────────────────────────────────────────────────────────────────────
// app/auth/register/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
write('app/auth/register/page.tsx', `'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signUp } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [displayName,      setDisplayName]      = useState('');
  const [email,            setEmail]            = useState('');
  const [password,         setPassword]         = useState('');
  const [confirmPassword,  setConfirmPassword]  = useState('');
  const [role,             setRole]             = useState<'owner' | 'guest'>('guest');
  const [errors,           setErrors]           = useState<Record<string, string>>({});
  const [loading,          setLoading]          = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!displayName.trim())           e.displayName       = 'Name is required.';
    if (!email.trim())                 e.email             = 'Email is required.';
    if (password.length < 6)           e.password          = 'Password must be at least 6 characters.';
    if (password !== confirmPassword)  e.confirmPassword   = 'Passwords do not match.';
    return e;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({}); setLoading(true);
    try {
      await signUp(email, password, displayName.trim(), role);
      router.push('/');
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      setErrors(
        code === 'auth/email-already-in-use'
          ? { email: 'An account with this email already exists.' }
          : { form:  'Registration failed. Please try again.' },
      );
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="card w-full max-w-md p-8">
        <div className="text-center mb-8">
          <span className="text-5xl" aria-hidden="true">\u{1F3D4}\uFE0F</span>
          <h1 className="text-2xl font-bold text-stone-800 mt-3">Create an account</h1>
          <p className="text-stone-500 text-sm mt-1">Join Cabane Apuseni as a guest or cabin owner</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Role */}
          <fieldset>
            <legend className="label mb-1">I am a\u2026</legend>
            <div className="grid grid-cols-2 gap-3">
              {(['guest', 'owner'] as const).map((r) => (
                <label
                  key={r}
                  className={
                    'flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-colors ' +
                    (role === r
                      ? 'border-forest-600 bg-forest-50 text-forest-800'
                      : 'border-stone-200 hover:border-stone-300 text-stone-600')
                  }
                >
                  <input
                    type="radio" name="role" value={r}
                    checked={role === r} onChange={() => setRole(r)}
                    className="sr-only"
                  />
                  <span aria-hidden="true">{r === 'guest' ? '\u{1F9F3}' : '\u{1F3E0}'}</span>
                  <span className="font-medium capitalize">{r}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="displayName" className="label">Full name</label>
            <input id="displayName" type="text" autoComplete="name" required
              className="input-field" placeholder="Ion Popescu"
              value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            {errors.displayName && <p className="error-msg" role="alert">{errors.displayName}</p>}
          </div>

          <div>
            <label htmlFor="reg-email" className="label">Email address</label>
            <input id="reg-email" type="email" autoComplete="email" required
              className="input-field" placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)} />
            {errors.email && <p className="error-msg" role="alert">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="reg-password" className="label">Password</label>
            <input id="reg-password" type="password" autoComplete="new-password" required
              className="input-field" placeholder="Min. 6 characters"
              value={password} onChange={(e) => setPassword(e.target.value)} />
            {errors.password && <p className="error-msg" role="alert">{errors.password}</p>}
          </div>

          <div>
            <label htmlFor="confirm-password" className="label">Confirm password</label>
            <input id="confirm-password" type="password" autoComplete="new-password" required
              className="input-field" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            {errors.confirmPassword && <p className="error-msg" role="alert">{errors.confirmPassword}</p>}
          </div>

          {errors.form && <p className="error-msg" role="alert">{errors.form}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
            {loading ? 'Creating account\u2026' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-stone-500 mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-forest-700 hover:text-forest-900 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
`);

// ─────────────────────────────────────────────────────────────────────────────
// app/owner/listings/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
write('app/owner/listings/page.tsx', `'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRequireRole } from '@/lib/hooks/useRequireRole';
import { getOwnerCabins, updateCabin, type Cabin } from '@/lib/firestore';

export default function OwnerListingsPage() {
  const { profile, loading: authLoading } = useRequireRole('owner');
  const [cabins,  setCabins]  = useState<Cabin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (!profile) return;
    getOwnerCabins(profile.uid)
      .then(setCabins)
      .catch(() => setError('Failed to load your listings.'))
      .finally(() => setLoading(false));
  }, [profile]);

  const togglePublished = async (cabin: Cabin) => {
    try {
      await updateCabin(cabin.id, { published: !cabin.published });
      setCabins((prev) =>
        prev.map((c) => (c.id === cabin.id ? { ...c, published: !c.published } : c)),
      );
    } catch { setError('Failed to update listing.'); }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center py-20" aria-label="Loading">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-700" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-stone-800">My Listings</h1>
        <Link href="/owner/listings/new" className="btn-primary">+ New Listing</Link>
      </div>

      {error && <p className="error-msg mb-4" role="alert">{error}</p>}

      {loading ? (
        <div className="space-y-4" aria-busy="true" aria-label="Loading listings">
          {[1, 2, 3].map((i) => <div key={i} className="bg-stone-100 rounded-xl h-24 animate-pulse" />)}
        </div>
      ) : cabins.length === 0 ? (
        <div className="card p-12 text-center">
          <span className="text-5xl" aria-hidden="true">\u{1F3E1}</span>
          <p className="text-stone-500 mt-4 mb-6">You haven\u2019t listed any cabins yet.</p>
          <Link href="/owner/listings/new" className="btn-primary">Create Your First Listing</Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {cabins.map((cabin) => (
            <li key={cabin.id} className="card p-4 flex gap-4 items-center">
              <div className="relative rounded-lg overflow-hidden bg-stone-100 flex-none" style={{ width: 80, height: 64 }}>
                {cabin.photos[0] ? (
                  <Image
                    src={cabin.photos[0]}
                    alt={cabin.title}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-300 text-xl" aria-hidden="true">
                    \u{1F3D4}\uFE0F
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-stone-800 truncate">{cabin.title}</h2>
                <p className="text-stone-500 text-sm">{cabin.location}</p>
                <p className="text-forest-700 text-sm font-medium">{'\u20ac' + cabin.basePricePerNight + '/night'}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                <span className={cabin.published ? 'badge-accepted' : 'badge-open'}>
                  {cabin.published ? 'Published' : 'Draft'}
                </span>
                <button
                  onClick={() => togglePublished(cabin)}
                  className="btn-secondary text-xs py-1 px-2"
                  aria-label={(cabin.published ? 'Unpublish ' : 'Publish ') + cabin.title}
                >
                  {cabin.published ? 'Unpublish' : 'Publish'}
                </button>
                <Link
                  href={'/owner/listings/' + cabin.id + '/edit'}
                  className="btn-secondary text-xs py-1 px-2"
                  aria-label={'Edit ' + cabin.title}
                >
                  Edit
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
`);

// ─────────────────────────────────────────────────────────────────────────────
// Shared listing form fields component (inlined in new + edit pages)
// ─────────────────────────────────────────────────────────────────────────────
// New-listing page does not call useEffect; edit-listing page does.
const LISTING_FORM_IMPORTS_NEW = `'use client';

import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useRequireRole } from '@/lib/hooks/useRequireRole';
import { uploadCabinPhoto } from '@/lib/storage';
import { FACILITIES } from '@/lib/constants';
`;

const LISTING_FORM_IMPORTS_EDIT = `'use client';

import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useRequireRole } from '@/lib/hooks/useRequireRole';
import { uploadCabinPhoto } from '@/lib/storage';
import { FACILITIES } from '@/lib/constants';
`;

const LISTING_FORM_HANDLERS = `
  const toggleFacility = (id: string) =>
    setFacilities((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    );

  const handlePhotos = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    e.target.value = '';
    for (const file of files) {
      setUploading((n) => n + 1);
      try {
        const url = await uploadCabinPhoto(file);
        setPhotos((prev) => [...prev, url]);
      } catch {
        setErrors((prev) => ({ ...prev, photos: 'Failed to upload photo. Try again.' }));
      } finally {
        setUploading((n) => n - 1);
      }
    }
  };

  const removePhoto = (idx: number) =>
    setPhotos((prev) => prev.filter((_, i) => i !== idx));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim())       errs.title    = 'Title is required.';
    if (!location.trim())    errs.location = 'Location is required.';
    if (!description.trim()) errs.description = 'Description is required.';
    const p = parseFloat(price);
    if (!price || isNaN(p) || p <= 0) errs.price = 'Enter a valid price greater than 0.';
    if (photos.length === 0) errs.photos = 'At least one photo is required.';
    return errs;
  };
`;

const LISTING_FORM_JSX = `
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="label">Title *</label>
          <input id="title" type="text" required className="input-field"
            placeholder="e.g. Rustic Log Cabin in the Pines"
            value={title} onChange={(e) => setTitle(e.target.value)} />
          {errors.title && <p className="error-msg" role="alert">{errors.title}</p>}
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="label">Location *</label>
          <input id="location" type="text" required className="input-field"
            placeholder="e.g. St\u00e2na de Vale, Bihor County"
            value={location} onChange={(e) => setLocation(e.target.value)} />
          {errors.location && <p className="error-msg" role="alert">{errors.location}</p>}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="label">Description *</label>
          <textarea id="description" rows={5} required className="input-field resize-none"
            placeholder="Describe your cabin \u2013 surroundings, best features, nearby activities\u2026"
            value={description} onChange={(e) => setDescription(e.target.value)} />
          {errors.description && <p className="error-msg" role="alert">{errors.description}</p>}
        </div>

        {/* Price */}
        <div>
          <label htmlFor="price" className="label">Base price per night (\u20ac) *</label>
          <input id="price" type="number" min="1" step="1" required className="input-field"
            placeholder="e.g. 120"
            value={price} onChange={(e) => setPrice(e.target.value)} />
          {errors.price && <p className="error-msg" role="alert">{errors.price}</p>}
        </div>

        {/* Facilities */}
        <fieldset>
          <legend className="label mb-2">Facilities</legend>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {FACILITIES.map((f) => (
              <label
                key={f.id}
                className={
                  'flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-sm transition-colors ' +
                  (facilities.includes(f.id)
                    ? 'border-forest-600 bg-forest-50 text-forest-800'
                    : 'border-stone-200 hover:border-stone-300 text-stone-600')
                }
              >
                <input type="checkbox" className="rounded text-forest-600 focus:ring-forest-500"
                  checked={facilities.includes(f.id)} onChange={() => toggleFacility(f.id)} />
                <span aria-hidden="true">{f.icon}</span>
                <span>{f.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Photos */}
        <div>
          <p className="label mb-2">Photos *</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
            {photos.map((url, idx) => (
              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-stone-100">
                <Image src={url} alt={'Photo ' + (idx + 1)} fill className="object-cover" sizes="160px" />
                <button
                  type="button"
                  onClick={() => removePhoto(idx)}
                  className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                  aria-label={'Remove photo ' + (idx + 1)}
                >
                  \u00d7
                </button>
              </div>
            ))}
            {Array.from({ length: uploading }).map((_, i) => (
              <div key={'up-' + i} className="aspect-square rounded-lg bg-stone-100 animate-pulse flex items-center justify-center">
                <span className="text-stone-400 text-xs">Uploading\u2026</span>
              </div>
            ))}
          </div>
          <label htmlFor="photos-input" className="btn-secondary cursor-pointer inline-flex">
            + Add Photos
            <input id="photos-input" type="file" accept="image/*" multiple className="sr-only" onChange={handlePhotos} />
          </label>
          {errors.photos && <p className="error-msg mt-2" role="alert">{errors.photos}</p>}
        </div>

        {/* Publish toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={published}
            onClick={() => setPublished((v) => !v)}
            className={
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-forest-600 ' +
              (published ? 'bg-forest-600' : 'bg-stone-300')
            }
          >
            <span className={
              'inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ' +
              (published ? 'translate-x-6' : 'translate-x-1')
            } />
          </button>
          <span className="text-sm font-medium text-stone-700">
            {published ? 'Published \u2013 visible to guests' : 'Draft \u2013 not visible to guests'}
          </span>
        </div>

        {errors.form && <p className="error-msg" role="alert">{errors.form}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={saving || uploading > 0} className="btn-primary flex-1 justify-center">
            {saving ? 'Saving\u2026' : uploading > 0 ? 'Uploading photos\u2026' : submitLabel}
          </button>
          <Link href="/owner/listings" className="btn-secondary flex-1 justify-center text-center">Cancel</Link>
        </div>
      </form>
`;

// ─────────────────────────────────────────────────────────────────────────────
// app/owner/listings/new/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
write('app/owner/listings/new/page.tsx', LISTING_FORM_IMPORTS_NEW + `import { createCabin } from '@/lib/firestore';

export default function NewListingPage() {
  const router = useRouter();
  const { profile, loading: authLoading } = useRequireRole('owner');
  const [title,       setTitle]       = useState('');
  const [location,    setLocation]    = useState('');
  const [description, setDescription] = useState('');
  const [price,       setPrice]       = useState('');
  const [facilities,  setFacilities]  = useState<string[]>([]);
  const [photos,      setPhotos]      = useState<string[]>([]);
  const [published,   setPublished]   = useState(false);
  const [uploading,   setUploading]   = useState(0);
  const [errors,      setErrors]      = useState<Record<string, string>>({});
  const [saving,      setSaving]      = useState(false);
  const submitLabel = 'Create Listing';
` + LISTING_FORM_HANDLERS + `
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    if (!profile) return;
    setErrors({}); setSaving(true);
    try {
      await createCabin({
        ownerId: profile.uid,
        title: title.trim(), location: location.trim(), description: description.trim(),
        basePricePerNight: parseFloat(price), facilities, photos,
        published, hidden: false,
      });
      router.push('/owner/listings');
    } catch { setErrors({ form: 'Failed to save listing. Please try again.' }); }
    finally   { setSaving(false); }
  };

  if (authLoading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-700" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/owner/listings" className="text-forest-700 hover:text-forest-900 text-sm">\u2190 Back</Link>
        <h1 className="text-2xl font-bold text-stone-800">New Listing</h1>
      </div>
` + LISTING_FORM_JSX + `
    </div>
  );
}
`);

// ─────────────────────────────────────────────────────────────────────────────
// app/owner/listings/[id]/edit/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
write('app/owner/listings/[id]/edit/page.tsx', LISTING_FORM_IMPORTS_EDIT + `import { useParams } from 'next/navigation';
import { getCabin, updateCabin, type Cabin } from '@/lib/firestore';

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const cabinId = params.id;
  const { profile, loading: authLoading } = useRequireRole('owner');
  const [cabin,       setCabin]       = useState<Cabin | null>(null);
  const [title,       setTitle]       = useState('');
  const [location,    setLocation]    = useState('');
  const [description, setDescription] = useState('');
  const [price,       setPrice]       = useState('');
  const [facilities,  setFacilities]  = useState<string[]>([]);
  const [photos,      setPhotos]      = useState<string[]>([]);
  const [published,   setPublished]   = useState(false);
  const [uploading,   setUploading]   = useState(0);
  const [errors,      setErrors]      = useState<Record<string, string>>({});
  const [saving,      setSaving]      = useState(false);
  const [loadError,   setLoadError]   = useState('');
  const submitLabel = 'Save Changes';

  useEffect(() => {
    if (!cabinId) return;
    getCabin(cabinId).then((c) => {
      if (!c) { setLoadError('Listing not found.'); return; }
      setCabin(c);
      setTitle(c.title); setLocation(c.location); setDescription(c.description);
      setPrice(String(c.basePricePerNight)); setFacilities(c.facilities);
      setPhotos(c.photos); setPublished(c.published);
    }).catch(() => setLoadError('Failed to load listing.'));
  }, [cabinId]);
` + LISTING_FORM_HANDLERS + `
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    if (!profile || !cabin) return;
    if (cabin.ownerId !== profile.uid) { setErrors({ form: 'Unauthorized.' }); return; }
    setErrors({}); setSaving(true);
    try {
      await updateCabin(cabinId, {
        title: title.trim(), location: location.trim(), description: description.trim(),
        basePricePerNight: parseFloat(price), facilities, photos, published,
      });
      router.push('/owner/listings');
    } catch { setErrors({ form: 'Failed to save changes. Please try again.' }); }
    finally   { setSaving(false); }
  };

  if (authLoading || (!cabin && !loadError)) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-700" />
    </div>
  );
  if (loadError) return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <p className="text-red-600">{loadError}</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/owner/listings" className="text-forest-700 hover:text-forest-900 text-sm">\u2190 Back</Link>
        <h1 className="text-2xl font-bold text-stone-800">Edit Listing</h1>
      </div>
` + LISTING_FORM_JSX + `
    </div>
  );
}
`);

// ─────────────────────────────────────────────────────────────────────────────
// app/cabins/[id]/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
write('app/cabins/[id]/page.tsx', `'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getCabin, getOrCreateConversation, getCabinReviews,
  type Cabin, type Review,
} from '@/lib/firestore';
import { useAuth } from '@/lib/hooks/useAuth';
import { FACILITIES } from '@/lib/constants';
import PhotoGallery from '@/components/PhotoGallery';
import ReviewCard from '@/components/ReviewCard';
import ReportButton from '@/components/ReportButton';
import StarRating from '@/components/StarRating';

export default function CabinDetailPage() {
  const params  = useParams<{ id: string }>();
  const router  = useRouter();
  const { user, profile } = useAuth();
  const [cabin,          setCabin]         = useState<Cabin | null>(null);
  const [reviews,        setReviews]       = useState<Review[]>([]);
  const [loading,        setLoading]       = useState(true);
  const [error,          setError]         = useState('');
  const [contactLoading, setContactLoading] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    Promise.all([getCabin(params.id), getCabinReviews(params.id)])
      .then(([c, r]) => {
        if (!c) { setError('Cabin not found.'); return; }
        setCabin(c); setReviews(r);
      })
      .catch(() => setError('Failed to load cabin details.'))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleContact = async () => {
    if (!user || !profile || !cabin || profile.role !== 'guest') return;
    setContactLoading(true);
    try {
      const convId = await getOrCreateConversation(cabin.id, user.uid, cabin.ownerId, cabin.title);
      router.push('/messages/' + convId);
    } catch { setError('Failed to start conversation.'); }
    finally   { setContactLoading(false); }
  };

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-4 animate-pulse">
      <div className="bg-stone-100 rounded-xl aspect-video" />
      <div className="bg-stone-100 rounded h-8 w-2/3" />
      <div className="bg-stone-100 rounded h-4 w-1/3" />
    </div>
  );

  if (error || !cabin) return (
    <div className="max-w-5xl mx-auto px-4 py-16 text-center">
      <p className="text-red-600 mb-4">{error || 'Cabin not found.'}</p>
      <Link href="/" className="btn-primary">Back to listings</Link>
    </div>
  );

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/" className="text-forest-700 hover:text-forest-900 text-sm block mb-6">
        \u2190 Back to listings
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left column ── */}
        <div className="lg:col-span-2 space-y-8">
          <PhotoGallery photos={cabin.photos} title={cabin.title} />

          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-stone-800">{cabin.title}</h1>
                <p className="text-stone-500 flex items-center gap-1 mt-1">
                  <span aria-hidden="true">\u{1F4CD}</span>
                  {cabin.location}
                </p>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <StarRating value={Math.round(avgRating)} readonly size="sm" />
                    <span className="text-stone-500 text-sm">
                      {'(' + reviews.length + ' review' + (reviews.length !== 1 ? 's' : '') + ')'}
                    </span>
                  </div>
                )}
              </div>
              {user && <ReportButton contentType="listing" contentId={cabin.id} />}
            </div>
            <p className="text-stone-600 leading-relaxed mt-4 whitespace-pre-wrap">{cabin.description}</p>
          </div>

          {cabin.facilities.length > 0 && (
            <div>
              <h2 className="font-semibold text-stone-800 mb-3">Facilities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {cabin.facilities.map((fId) => {
                  const f = FACILITIES.find((x) => x.id === fId);
                  if (!f) return null;
                  return (
                    <div key={fId} className="flex items-center gap-2 p-2 bg-stone-50 rounded-lg text-sm text-stone-700">
                      <span aria-hidden="true">{f.icon}</span>
                      <span>{f.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <h2 className="font-semibold text-stone-800 mb-3">
              {'Reviews (' + reviews.length + ')'}
            </h2>
            {reviews.length === 0 ? (
              <p className="text-stone-400 text-sm">No reviews yet. Be the first!</p>
            ) : (
              <ul className="space-y-3">
                {reviews.map((r) => (
                  <li key={r.id}><ReviewCard review={r} /></li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* ── Right column ── */}
        <div>
          <div className="card p-6 sticky top-20">
            <p className="text-3xl font-bold text-stone-800">{'\u20ac' + cabin.basePricePerNight}</p>
            <p className="text-stone-500 text-sm mb-6">per night</p>

            {!user ? (
              <div className="text-center space-y-3">
                <p className="text-stone-500 text-sm">Sign in to contact the owner</p>
                <Link href="/auth/login" className="btn-primary w-full justify-center">Sign In</Link>
              </div>
            ) : profile?.role === 'guest' ? (
              <button
                onClick={handleContact}
                disabled={contactLoading}
                className="btn-primary w-full justify-center"
              >
                {contactLoading ? 'Starting chat\u2026' : 'Contact Owner / Propose Price'}
              </button>
            ) : profile?.role === 'owner' ? (
              <p className="text-stone-400 text-sm text-center">Owners cannot book cabins.</p>
            ) : null}

            {error && <p className="error-msg mt-3" role="alert">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
`);

// ─────────────────────────────────────────────────────────────────────────────
// app/messages/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
write('app/messages/page.tsx', `'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRequireRole } from '@/lib/hooks/useRequireRole';
import { getUserConversations, type Conversation } from '@/lib/firestore';

export default function MessagesPage() {
  const { profile, loading: authLoading } = useRequireRole(['owner', 'guest', 'admin']);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (!profile) return;
    if (profile.role === 'admin') { setLoading(false); return; }
    getUserConversations(profile.uid, profile.role as 'guest' | 'owner')
      .then(setConversations)
      .catch(() => setError('Failed to load conversations.'))
      .finally(() => setLoading(false));
  }, [profile]);

  if (authLoading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-700" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Messages</h1>
      {error && <p className="error-msg mb-4" role="alert">{error}</p>}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="bg-stone-100 rounded-xl h-20 animate-pulse" />)}
        </div>
      ) : conversations.length === 0 ? (
        <div className="card p-10 text-center">
          <span className="text-5xl" aria-hidden="true">\u{1F4AC}</span>
          <p className="text-stone-500 mt-4">No conversations yet.</p>
          {profile?.role === 'guest' && (
            <Link href="/" className="btn-primary mt-6 inline-flex">Browse Cabins</Link>
          )}
        </div>
      ) : (
        <ul className="space-y-3" aria-label="Conversations">
          {conversations.map((conv) => (
            <li key={conv.id}>
              <Link
                href={'/messages/' + conv.id}
                className="card p-4 flex items-center justify-between gap-4 hover:shadow-md transition-shadow block"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-stone-800 truncate">{conv.cabinTitle}</p>
                  <p className="text-stone-500 text-sm">
                    {profile?.role === 'guest' ? 'With cabin owner' : 'With guest'}
                  </p>
                </div>
                <span className={
                  conv.status === 'accepted' ? 'badge-accepted' :
                  conv.status === 'declined' ? 'badge-declined' : 'badge-open'
                }>
                  {conv.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
`);

// ─────────────────────────────────────────────────────────────────────────────
// app/messages/[conversationId]/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
write('app/messages/[conversationId]/page.tsx', `'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useRequireRole } from '@/lib/hooks/useRequireRole';
import ConversationThread from '@/components/ConversationThread';

export default function ConversationPage() {
  const params = useParams<{ conversationId: string }>();
  useRequireRole(['owner', 'guest', 'admin']);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/messages" className="text-forest-700 hover:text-forest-900 text-sm block mb-4">
        \u2190 Back to Messages
      </Link>
      <ConversationThread conversationId={params.conversationId} />
    </div>
  );
}
`);

// ─────────────────────────────────────────────────────────────────────────────
// app/reviews/new/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
write('app/reviews/new/page.tsx', `'use client';

import { useState, useEffect, type FormEvent, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRequireRole } from '@/lib/hooks/useRequireRole';
import { createReview, getBookingReview, getCabin, type Cabin } from '@/lib/firestore';
import StarRating from '@/components/StarRating';

function NewReviewContent() {
  const router      = useRouter();
  const searchParams = useSearchParams();
  const bookingId   = searchParams.get('bookingId') ?? '';
  const { profile, loading: authLoading } = useRequireRole('guest');
  const [cabin,           setCabin]           = useState<Cabin | null>(null);
  const [rating,          setRating]          = useState(0);
  const [comment,         setComment]         = useState('');
  const [errors,          setErrors]          = useState<Record<string, string>>({});
  const [dataLoading,     setDataLoading]     = useState(true);
  const [submitting,      setSubmitting]      = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  useEffect(() => {
    if (!bookingId || !profile) return;
    (async () => {
      try {
        const existing = await getBookingReview(bookingId);
        if (existing) { setAlreadyReviewed(true); setDataLoading(false); return; }
        const bookingSnap = await getDoc(doc(db, 'bookings', bookingId));
        if (!bookingSnap.exists()) { setErrors({ form: 'Booking not found.' }); setDataLoading(false); return; }
        const booking = bookingSnap.data();
        if (booking.guestId !== profile.uid) { setErrors({ form: 'Unauthorized.' }); setDataLoading(false); return; }
        const c = await getCabin(booking.cabinId as string);
        setCabin(c);
      } catch { setErrors({ form: 'Failed to load booking details.' }); }
      finally   { setDataLoading(false); }
    })();
  }, [bookingId, profile]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile || !cabin) return;
    const errs: Record<string, string> = {};
    if (rating < 1 || rating > 5) errs.rating  = 'Please select a rating (1\u20135 stars).';
    if (!comment.trim())          errs.comment = 'Please write a review.';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({}); setSubmitting(true);
    try {
      await createReview({
        bookingId, cabinId: cabin.id, guestId: profile.uid,
        guestName: profile.displayName, rating, comment: comment.trim(),
      });
      router.push('/messages');
    } catch { setErrors({ form: 'Failed to submit review. Please try again.' }); }
    finally   { setSubmitting(false); }
  };

  if (authLoading || dataLoading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-700" />
    </div>
  );

  if (alreadyReviewed) return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <span className="text-5xl" aria-hidden="true">\u2705</span>
      <h1 className="text-xl font-bold text-stone-800 mt-4">Review Already Submitted</h1>
      <p className="text-stone-500 mt-2">You have already reviewed this booking.</p>
      <Link href="/messages" className="btn-primary mt-6 inline-flex">Back to Messages</Link>
    </div>
  );

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <Link href="/messages" className="text-forest-700 hover:text-forest-900 text-sm block mb-6">
        \u2190 Back to messages
      </Link>
      <div className="card p-6">
        <h1 className="text-xl font-bold text-stone-800 mb-1">Leave a Review</h1>
        {cabin && <p className="text-stone-500 text-sm mb-6">{cabin.title}</p>}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div>
            <p className="label mb-2" id="rating-label">Your rating *</p>
            <StarRating value={rating} onChange={setRating} size="lg" />
            {errors.rating && <p className="error-msg mt-1" role="alert">{errors.rating}</p>}
          </div>

          <div>
            <label htmlFor="comment" className="label">Your review *</label>
            <textarea
              id="comment" rows={5} required className="input-field resize-none"
              placeholder="Share your experience staying at this cabin\u2026"
              value={comment} onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
            />
            <p className="text-xs text-stone-400 mt-1 text-right">
              {comment.length + '/1000'}
            </p>
            {errors.comment && <p className="error-msg" role="alert">{errors.comment}</p>}
          </div>

          {errors.form && <p className="error-msg" role="alert">{errors.form}</p>}

          <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
            {submitting ? 'Submitting\u2026' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function NewReviewPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-700" />
      </div>
    }>
      <NewReviewContent />
    </Suspense>
  );
}
`);

// ─────────────────────────────────────────────────────────────────────────────
// app/admin/moderation/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
write('app/admin/moderation/page.tsx', `'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRequireRole } from '@/lib/hooks/useRequireRole';
import {
  getPendingReports, hideAndActionReport, actionReport,
  type Report, type FirebaseTimestamp,
} from '@/lib/firestore';

interface ReportWithPreview extends Report {
  contentPreview: string;
}

async function fetchPreview(report: Report): Promise<string> {
  try {
    if (report.contentType === 'listing') {
      const snap = await getDoc(doc(db, 'cabins', report.contentId));
      return snap.exists() ? (snap.data().title as string) : 'Cabin not found';
    }
    if (report.contentType === 'review') {
      const snap = await getDoc(doc(db, 'reviews', report.contentId));
      if (!snap.exists()) return 'Review not found';
      const text = snap.data().comment as string;
      return text.length > 100 ? text.substring(0, 100) + '\u2026' : text;
    }
    return 'Message (ID: ' + report.contentId + ')';
  } catch { return 'Unable to load preview'; }
}

function fmtDate(ts: FirebaseTimestamp | undefined): string {
  if (!ts) return '';
  try {
    return ts.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return ''; }
}

export default function ModerationPage() {
  const { loading: authLoading } = useRequireRole('admin');
  const [reports, setReports] = useState<ReportWithPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [acting,  setActing]  = useState<string | null>(null);

  useEffect(() => {
    getPendingReports()
      .then(async (list) => {
        const withPreviews = await Promise.all(
          list.map(async (r) => ({ ...r, contentPreview: await fetchPreview(r) })),
        );
        setReports(withPreviews);
      })
      .catch(() => setError('Failed to load reports.'))
      .finally(() => setLoading(false));
  }, []);

  const handleHide = async (report: ReportWithPreview) => {
    if (report.contentType === 'message') { handleDismiss(report.id); return; }
    setActing(report.id); setError('');
    try {
      await hideAndActionReport(report.id, report.contentType, report.contentId);
      setReports((prev) => prev.filter((r) => r.id !== report.id));
    } catch { setError('Action failed.'); }
    finally   { setActing(null); }
  };

  const handleDismiss = async (reportId: string) => {
    setActing(reportId); setError('');
    try {
      await actionReport(reportId);
      setReports((prev) => prev.filter((r) => r.id !== reportId));
    } catch { setError('Action failed.'); }
    finally   { setActing(null); }
  };

  if (authLoading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-700" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Moderation</h1>
      {error && <p className="error-msg mb-4" role="alert">{error}</p>}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="bg-stone-100 rounded-xl h-24 animate-pulse" />)}
        </div>
      ) : reports.length === 0 ? (
        <div className="card p-12 text-center">
          <span className="text-5xl" aria-hidden="true">\u2705</span>
          <p className="text-stone-500 mt-4">No pending reports. All clear!</p>
        </div>
      ) : (
        <>
          <p className="text-stone-500 text-sm mb-4">
            {reports.length + ' pending report' + (reports.length !== 1 ? 's' : '')}
          </p>
          <ul className="space-y-3">
            {reports.map((report) => (
              <li key={report.id} className="card p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 capitalize">
                        {report.contentType}
                      </span>
                      <span className="text-stone-400 text-xs">{fmtDate(report.createdAt)}</span>
                    </div>
                    <p className="font-medium text-stone-800 text-sm truncate">{report.contentPreview}</p>
                    <p className="text-stone-500 text-sm mt-0.5">Reason: {report.reason}</p>
                  </div>
                  <div className="flex gap-2 shrink-0 flex-wrap">
                    {report.contentType !== 'message' && (
                      <button
                        onClick={() => handleHide(report)}
                        disabled={acting === report.id}
                        className="btn-danger text-xs py-1.5 px-3"
                      >
                        {acting === report.id ? '\u2026' : 'Hide Content'}
                      </button>
                    )}
                    <button
                      onClick={() => handleDismiss(report.id)}
                      disabled={acting === report.id}
                      className="btn-secondary text-xs py-1.5 px-3"
                    >
                      {acting === report.id ? '\u2026' : 'Dismiss'}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
`);

console.log('\n\u2705  Done! Run \`npm run dev\` to start the development server.\n');
console.log('   Remember to copy .env.local.example \u2192 .env.local and fill in your Firebase credentials.\n');
