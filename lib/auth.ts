import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getClientAuth, getClientFirestore } from '@/lib/firebase/client';

export type UserRole = 'owner' | 'guest' | 'admin';

/**
 * Admin accounts cannot be self-registered through the app.
 * To create an admin, manually set `role: "admin"` on a user document
 * in Firestore (Firebase Console → Firestore → users/{uid} → role field),
 * or use a one-time Firebase Admin SDK script in your backend.
 */

export async function signUp(
  email: string,
  password: string,
  displayName: string,
  role: 'owner' | 'guest',
): Promise<User> {
  const { user } = await createUserWithEmailAndPassword(getClientAuth(), email, password);
  await setDoc(doc(getClientFirestore(), 'users', user.uid), {
    uid: user.uid,
    email,
    displayName,
    role,
    createdAt: serverTimestamp(),
  });
  return user;
}

export async function signIn(email: string, password: string): Promise<User> {
  const { user } = await signInWithEmailAndPassword(getClientAuth(), email, password);
  return user;
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(getClientAuth());
}
