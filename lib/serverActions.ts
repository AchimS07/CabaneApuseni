/**
 * lib/serverActions.ts
 * Server actions that can be imported and called from Client Components.
 * Each function here runs exclusively on the server (firebase-admin is safe to use).
 */
'use server';

import { getCabinById } from '@/modules/cabins/infrastructure/firestoreCabinRepository';
import { ok, fail, type Result } from '@/lib/result';
import type { Cabin } from '@/modules/cabins/domain/types';

/**
 * Fetch a single cabin by its Firestore document ID.
 * Used by client components (e.g. WishlistSection) that cannot import
 * server-only modules like firebase-admin directly.
 */
export async function fetchCabinById(id: string): Promise<Result<Cabin>> {
  if (!id) return fail('VALIDATION_ERROR', 'Cabin id is required.');
  try {
    const cabin = await getCabinById(id);
    if (!cabin) return fail('NOT_FOUND', `Cabin "${id}" not found.`);
    return ok(cabin);
  } catch {
    return fail('INTERNAL_ERROR', 'Failed to load cabin details.');
  }
}
