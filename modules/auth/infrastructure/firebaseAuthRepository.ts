/**
 * modules/auth/infrastructure/firebaseAuthRepository.ts
 * Client-side Firebase Auth operations.
 */
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { getClientAuth } from '@/lib/firebase/client';

export async function signInWithEmail(email: string, password: string) {
  const auth = getClientAuth();
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await credential.user.getIdToken();
  return { uid: credential.user.uid, idToken };
}

export async function registerWithEmail(email: string, password: string, name: string) {
  const auth = getClientAuth();
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName: name });
  const idToken = await credential.user.getIdToken();
  return { uid: credential.user.uid, idToken };
}

export async function signOutUser() {
  const auth = getClientAuth();
  await signOut(auth);
}

export async function sendPasswordReset(email: string): Promise<void> {
  const auth = getClientAuth();
  await sendPasswordResetEmail(auth, email);
}
