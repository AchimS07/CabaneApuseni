'use server';

/**
 * modules/cabins/actions.ts
 * Server Actions for owner cabin management.
 */
import { verifySession } from '@/lib/auth/session';
import {
  createCabin,
  editCabin,
  removeCabin,
} from '@/modules/cabins/application/cabinService';
import type { CabinInput } from '@/lib/validation/schemas';
import { revalidatePath } from 'next/cache';
import { getCabinById, saveCabin } from '@/modules/cabins/infrastructure/firestoreCabinRepository';
import { MOCK_CABINS } from '@/modules/cabins/application/mockCabins';
import { createLogger } from '@/lib/observability/logger';

const log = createLogger({ module: 'cabinActions' });

export type CabinActionResult =
  | { ok: true; cabinId?: string }
  | { ok: false; error: string; details?: Record<string, string[]> };

/**
 * Creates a cabin listing owned by the current user.
 */
export async function createCabinAction(
  input: CabinInput,
): Promise<CabinActionResult> {
  const session = await verifySession();
  if (!session) return { ok: false, error: 'Authentication required.' };
  if (session.role !== 'owner' && session.role !== 'admin') {
    return { ok: false, error: 'Owner role required.' };
  }

  const result = await createCabin(input, session);
  if (!result.ok) {
    return {
      ok: false,
      error: result.error.message,
      details: result.error.details,
    };
  }

  revalidatePath('/cabins', 'page');
  revalidatePath('/cabins/[slug]', 'page');
  revalidatePath('/dashboard/owner/listings');
  return { ok: true, cabinId: result.data.id };
}

/**
 * Updates a cabin listing. Only the owner or an admin may update.
 */
export async function updateCabinAction(
  cabinId: string,
  input: Partial<CabinInput>,
): Promise<CabinActionResult> {
  const session = await verifySession();
  if (!session) return { ok: false, error: 'Authentication required.' };

  const result = await editCabin(cabinId, input, session);
  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  revalidatePath('/cabins', 'page');
  revalidatePath('/cabins/[slug]', 'page');
  revalidatePath('/dashboard/owner/listings');
  return { ok: true };
}

/**
 * Toggles the published state of a cabin. Only the owner or admin may do this.
 */
export async function togglePublishAction(
  cabinId: string,
  published: boolean,
): Promise<CabinActionResult> {
  const session = await verifySession();
  if (!session) return { ok: false, error: 'Authentication required.' };

  const result = await editCabin(cabinId, { published }, session);
  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  revalidatePath('/cabins', 'page');
  revalidatePath('/cabins/[slug]', 'page');
  revalidatePath('/dashboard/owner/listings');
  return { ok: true };
}

/**
 * Deletes a cabin listing. Only the owner or admin may delete.
 */
export async function deleteCabinAction(
  cabinId: string,
): Promise<CabinActionResult> {
  const session = await verifySession();
  if (!session) return { ok: false, error: 'Authentication required.' };

  const result = await removeCabin(cabinId, session);
  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  revalidatePath('/cabins', 'page');
  revalidatePath('/cabins/[slug]', 'page');
  revalidatePath('/dashboard/owner/listings');
  return { ok: true };
}

export type SeedCabinsResult =
  | { ok: true; seeded: number; skipped: number }
  | { ok: false; error: string };

/**
 * Seeds the 3 mock cabins into Firestore if they do not already exist.
 * Admin-only. Idempotent — existing documents are left untouched.
 */
export async function seedMockCabinsAction(): Promise<SeedCabinsResult> {
  const session = await verifySession();
  if (!session) return { ok: false, error: 'Authentication required.' };
  if (session.role !== 'admin') return { ok: false, error: 'Admin role required.' };

  let seeded = 0;
  let skipped = 0;

  try {
    for (const cabin of MOCK_CABINS) {
      const { id, ...data } = cabin;
      const existing = await getCabinById(id);
      if (existing) {
        skipped++;
        continue;
      }
      await saveCabin(id, data);
      log.info({ id }, 'Mock cabin seeded');
      seeded++;
    }
  } catch (error) {
    log.error({ error }, 'Failed to seed mock cabins');
    return { ok: false, error: 'Failed to seed cabins. Please try again.' };
  }

  revalidatePath('/cabins', 'page');
  revalidatePath('/admin/cabins', 'page');
  return { ok: true, seeded, skipped };
}
