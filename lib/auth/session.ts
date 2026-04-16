/**
 * lib/auth/session.ts
 * Server-side session helpers using Firebase Admin session cookies.
 * Session cookies are stored as HTTP-only cookies for security.
 */
import { cookies } from 'next/headers';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase/admin';
import type { UserRole, SubscriptionTier, SubscriptionStatus } from '@/modules/users/domain/types';

export const SESSION_COOKIE_NAME = '__session';

/** Lifetime of the session cookie (14 days). */
const SESSION_EXPIRES_IN_MS = 14 * 24 * 60 * 60 * 1000;

/**
 * Creates a Firebase session cookie from a client-issued ID token
 * and stores it as an HTTP-only cookie.
 */
export async function createSessionCookie(idToken: string): Promise<void> {
  const auth = getAdminAuth();
  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: SESSION_EXPIRES_IN_MS,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_EXPIRES_IN_MS / 1000,
    path: '/',
  });
}

/**
 * Verifies the current session cookie and returns the decoded token,
 * or null if the session is missing or invalid.
 */
export async function verifySession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!sessionCookie) return null;

    const auth = getAdminAuth();
    const decoded = await auth.verifySessionCookie(sessionCookie, true);

    // Read the role from Firestore — custom claims are not set during client-side
    // registration, so the token role claim is always absent.
    const db = getAdminFirestore();
    const userDoc = await db.collection('users').doc(decoded.uid).get();
    const role: UserRole = userDoc.exists
      ? ((userDoc.data()?.role as UserRole | undefined) ?? 'user')
      : ((decoded['role'] as UserRole | undefined) ?? 'user');

    return {
      uid: decoded.uid,
      email: decoded.email ?? null,
      role,
      subscriptionTier: (decoded['subscriptionTier'] as SubscriptionTier | undefined) ?? null,
      subscriptionStatus: (decoded['subscriptionStatus'] as SubscriptionStatus | undefined) ?? null,
    };
  } catch {
    return null;
  }
}

/**
 * Clears the session cookie (sign-out).
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export interface SessionUser {
  uid: string;
  email: string | null;
  role: UserRole;
  subscriptionTier?: SubscriptionTier | null;
  subscriptionStatus?: SubscriptionStatus | null;
}
