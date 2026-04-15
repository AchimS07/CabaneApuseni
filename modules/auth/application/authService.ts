/**
 * modules/auth/application/authService.ts
 * Client-facing auth actions that talk to the session API.
 */
import {
  signInWithEmail,
  registerWithEmail,
  signOutUser,
  sendPasswordReset,
} from '@/modules/auth/infrastructure/firebaseAuthRepository';
import type { UserRole } from '@/modules/users/domain/types';

async function exchangeTokenForCookie(idToken: string): Promise<void> {
  const res = await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? 'Failed to create session');
  }
}

export async function login(email: string, password: string): Promise<void> {
  const { idToken } = await signInWithEmail(email, password);
  await exchangeTokenForCookie(idToken);
}

async function syncProfile(name: string, email: string, role: Extract<UserRole, 'user' | 'owner'>): Promise<void> {
  const res = await fetch('/api/users/me', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, role }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? 'Failed to save user profile');
  }
}

export async function register(
  email: string,
  password: string,
  name: string,
  role: Extract<UserRole, 'user' | 'owner'> = 'user',
): Promise<void> {
  const { idToken } = await registerWithEmail(email, password, name);
  await exchangeTokenForCookie(idToken);
  await syncProfile(name, email, role);
}

export async function logout(): Promise<void> {
  await signOutUser();
  await fetch('/api/auth/session', { method: 'DELETE' });
}

export async function forgotPassword(email: string): Promise<void> {
  await sendPasswordReset(email);
}
