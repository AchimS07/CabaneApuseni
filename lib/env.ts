/**
 * lib/env.ts
 * Typed, validated environment variable loader.
 * Throws at startup if a required variable is missing.
 */
import { z } from 'zod';

const defaultFirebaseClientConfig = {
  apiKey: 'AIzaSyAZGvVi1dpVXsT2lMco466wzwBzEUIAY_w',
  authDomain: 'apusenirental.firebaseapp.com',
  projectId: 'apusenirental',
  storageBucket: 'apusenirental.firebasestorage.app',
  messagingSenderId: '712212349332',
  appId: '1:712212349332:web:ea189aa27fcb084d490f81',
  measurementId: 'G-E0PGE7D8H7',
} as const;

const clientSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
});

const serverSchema = z.object({
  FIREBASE_PROJECT_ID: z.string().min(1),
  FIREBASE_CLIENT_EMAIL: z.string().email(),
  FIREBASE_PRIVATE_KEY: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseEnv<S extends z.ZodType<any, any, any>>(
  schema: S,
  values: unknown,
  label: string,
): z.output<S> {
  const result = schema.safeParse(values);
  if (!result.success) {
    const missing = result.error.issues.map((i) => i.path.join('.')).join(', ');
    throw new Error(`[env] Missing or invalid ${label} env vars: ${missing}`);
  }
  return result.data as z.output<S>;
}

type ClientEnv = z.infer<typeof clientSchema>;
type ServerEnv = z.infer<typeof serverSchema>;

let _clientEnv: ClientEnv | undefined;

/**
 * Returns validated client (public) env vars.
 * Evaluated lazily on first call to avoid failures in test/build environments.
 */
export function getClientEnv(): ClientEnv {
  if (_clientEnv) return _clientEnv;
  const env = parseEnv(clientSchema, {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? defaultFirebaseClientConfig.apiKey,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? defaultFirebaseClientConfig.authDomain,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? defaultFirebaseClientConfig.projectId,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? defaultFirebaseClientConfig.storageBucket,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? defaultFirebaseClientConfig.messagingSenderId,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? defaultFirebaseClientConfig.appId,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  }, 'client');
  _clientEnv = env;
  return env;
}

export const clientEnv = new Proxy({} as ClientEnv, {
  get(_target, prop) {
    return getClientEnv()[prop as keyof ClientEnv];
  },
});

/**
 * Only import getServerEnv in server-side code (Server Components, Route Handlers, Server Actions).
 */
export function getServerEnv(): ServerEnv {
  return parseEnv(serverSchema, {
    FIREBASE_PROJECT_ID:
      process.env.FIREBASE_PROJECT_ID ??
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ??
      defaultFirebaseClientConfig.projectId,
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
    SESSION_SECRET: process.env.SESSION_SECRET,
  }, 'server');
}
