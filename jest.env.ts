/**
 * jest.env.ts
 * Loaded by Jest via `setupFiles` before any test module is evaluated.
 *
 * Jest does not load .env.local automatically (that is a Next.js dev-server
 * feature). We set dummy NEXT_PUBLIC_FIREBASE_* values here so that the lazy
 * client-env validation in lib/env.ts never throws during unit tests.
 *
 * These values are intentionally fake — no real Firebase project is contacted
 * during unit tests because all Firebase modules are mocked at the test level.
 */

process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key';
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test-project.firebaseapp.com';
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project';
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'test-project.appspot.com';
process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = '000000000000';
process.env.NEXT_PUBLIC_FIREBASE_APP_ID = '1:000000000000:web:000000000000';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';

// Server-side vars — needed if any test path reaches getServerEnv()
process.env.FIREBASE_PROJECT_ID = 'test-project';
process.env.FIREBASE_CLIENT_EMAIL = 'test@test-project.iam.gserviceaccount.com';
process.env.FIREBASE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nMIIE\n-----END PRIVATE KEY-----\n';
process.env.SESSION_SECRET = 'test-session-secret-that-is-at-least-32-characters-long';
