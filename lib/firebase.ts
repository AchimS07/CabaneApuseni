/**
 * @deprecated This file has been superseded by lib/firebase/client.ts.
 * It previously initialised Firebase at module load time, which caused SSR
 * crashes when client env vars were absent.
 *
 * Use the lazy getters from lib/firebase/client instead:
 *   import { getClientAuth, getClientFirestore, getClientStorage } from '@/lib/firebase/client';
 */
export { getClientAuth, getClientFirestore, getClientStorage } from '@/lib/firebase/client';
