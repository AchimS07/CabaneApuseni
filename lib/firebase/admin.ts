/**
 * lib/firebase/admin.ts
 * Server-only Firebase Admin singleton.
 * Never import this file in Client Components or client utilities.
 */
import admin from 'firebase-admin';
import { type App } from 'firebase-admin/app';
import { type Auth } from 'firebase-admin/auth';
import { type Firestore } from 'firebase-admin/firestore';
import { getServerEnv } from '@/lib/env';

let adminApp: App | undefined;

function getAdminApp(): App {
  if (adminApp) return adminApp;

  if (admin.apps.length > 0) {
    adminApp = admin.apps[0]!;
    return adminApp;
  }

  const env = getServerEnv();

  adminApp = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      // Replace escaped newlines in private key from env var
      privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });

  return adminApp;
}

export function getAdminAuth(): Auth {
  return admin.auth(getAdminApp());
}

export function getAdminFirestore(): Firestore {
  return admin.firestore(getAdminApp());
}
