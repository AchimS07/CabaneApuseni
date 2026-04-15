/**
 * lib/auth/authorization.ts
 * Role-based access control helpers.
 * Use in layouts, Server Actions, and service layer.
 */
import { redirect } from 'next/navigation';
import { verifySession, type SessionUser } from '@/lib/auth/session';
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
 * Requires admin role. Redirects appropriately if not authorized.
 */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await verifySession();
  if (!user) redirect('/login');
  if (user.role !== 'admin') redirect('/dashboard');
  return user;
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
