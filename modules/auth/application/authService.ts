/**
 * modules/auth/application/authService.ts
 * Client-facing auth actions that talk to the session API.
 */
import {
  signInWithEmail,
  registerWithEmail,
  signOutUser,
} from '@/modules/auth/infrastructure/firebaseAuthRepository';

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

export async function register(email: string, password: string, name: string): Promise<void> {
  const { idToken } = await registerWithEmail(email, password, name);
  await exchangeTokenForCookie(idToken);
}

export async function logout(): Promise<void> {
  await signOutUser();
  await fetch('/api/auth/session', { method: 'DELETE' });
}
