/**
 * lib/auth/authorization.ts
 * Role-based access control helpers.
 * Use in layouts, Server Actions, and service layer.
 */
import { redirect } from 'next/navigation';
import { verifySession, type SessionUser } from '@/lib/auth/session';
import { getUserById } from '@/modules/users/infrastructure/firestoreUserRepository';
import type { UserRole } from '@/modules/users/domain/types';

/**
 * Requires an authenticated session. Redirects to login if missing.
 */
export async function requireAuth(): Promise<SessionUser> {
  const user = await verifySession();
  if (!user) redirect('/login');
  return user;
}

/**
 * Requires owner or admin role. Redirects appropriately if not authorized.
 * Falls back to checking the Firestore profile for sessions created before
 * custom claims were set (e.g. at registration time).
 */
export async function requireOwner(): Promise<SessionUser> {
  const user = await verifySession();
  if (!user) redirect('/login');
  if (user.role === 'owner' || user.role === 'admin') return user;

  // Fallback: check Firestore profile in case the session cookie predates custom claims.
  const profile = await getUserById(user.uid);
  const role = profile?.role ?? 'user';
  if (role !== 'owner' && role !== 'admin') redirect('/dashboard');
  return { ...user, role };
}

/**
 * Requires admin role. Redirects appropriately if not authorized.
 * Falls back to checking the Firestore profile for sessions created before
 * custom claims were set.
 */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await verifySession();
  if (!user) redirect('/login');
  if (user.role === 'admin') return user;

  // Fallback: check Firestore profile.
  const profile = await getUserById(user.uid);
  const role = profile?.role ?? 'user';
  if (role !== 'admin') redirect('/dashboard');
  return { ...user, role };
}

/**
 * Returns true if the user has the given role or higher.
 */
export function hasRole(user: SessionUser, role: UserRole): boolean {
  if (role === 'user') return true;
  if (role === 'owner') return user.role === 'owner' || user.role === 'admin';
  if (role === 'admin') return user.role === 'admin';
  return false;
}

/**
 * Returns true if the user owns the resource or is an admin.
 */
export function canAccess(user: SessionUser, ownerId: string): boolean {
  return user.uid === ownerId || user.role === 'admin';
}
