/**
 * modules/cabins/application/cabinService.ts
 */
import { ok, fail, type Result } from '@/lib/result';
import { cabinSchema, type CabinInput } from '@/lib/validation/schemas';
import {
  listPublishedCabins,
  listAllCabins,
  listCabinsByOwner,
  getCabinBySlug,
  getCabinById,
  saveCabin,
  updateCabin,
  deleteCabin,
} from '@/modules/cabins/infrastructure/firestoreCabinRepository';
import type { Cabin } from '@/modules/cabins/domain/types';
import type { SessionUser } from '@/lib/auth/session';
import { createLogger } from '@/lib/observability/logger';
import { randomUUID } from 'crypto';
import { MOCK_CABINS } from '@/modules/cabins/application/mockCabins';

const log = createLogger({ module: 'cabinService' });

export async function getPublishedCabins(): Promise<Result<Cabin[]>> {
  try {
    const cabins = await listPublishedCabins();
    return ok(cabins.length > 0 ? cabins : MOCK_CABINS);
  } catch (error) {
    log.error({ error }, 'Failed to load published cabins');
    return ok(MOCK_CABINS);
  }
}

export async function getAllCabins(): Promise<Result<Cabin[]>> {
  try {
    const cabins = await listAllCabins();
    return ok(cabins);
  } catch (error) {
    log.error({ error }, 'Failed to load all cabins');
    return fail('INTERNAL_ERROR', 'Failed to load cabins.');
  }
}

export async function getOwnerCabins(ownerId: string): Promise<Result<Cabin[]>> {
  try {
    const cabins = await listCabinsByOwner(ownerId);
    return ok(cabins);
  } catch (error) {
    log.error({ error, ownerId }, 'Failed to load owner cabins');
    return fail('INTERNAL_ERROR', 'Failed to load your listings.');
  }
}

export async function getCabinDetail(slug: string): Promise<Result<Cabin>> {
  try {
    const cabin = await getCabinBySlug(slug);
    const fallback = MOCK_CABINS.find((item) => item.slug === slug);
    if (!cabin && !fallback) return fail('NOT_FOUND', `Cabin "${slug}" not found.`);
    return ok(cabin ?? fallback!);
  } catch (error) {
    log.error({ error, slug }, 'Failed to load cabin detail');
    const fallback = MOCK_CABINS.find((item) => item.slug === slug);
    if (!fallback) return fail('INTERNAL_ERROR', 'Failed to load cabin details.');
    return ok(fallback);
  }
}

export async function createCabin(input: CabinInput, actor: SessionUser): Promise<Result<Cabin>> {
  const parsed = cabinSchema.safeParse(input);
  if (!parsed.success) {
    return fail('VALIDATION_ERROR', 'Invalid cabin data.', parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }

  const now = new Date().toISOString();
  const id = randomUUID();
  const cabin: Cabin = { id, ownerId: actor.uid, ...parsed.data, createdAt: now, updatedAt: now };

  await saveCabin(id, { ownerId: actor.uid, ...parsed.data, createdAt: now, updatedAt: now });
  log.info({ id, actorUid: actor.uid }, 'Cabin created');
  return ok(cabin);
}

export async function editCabin(
  id: string,
  input: Partial<CabinInput>,
  actor: SessionUser,
): Promise<Result<void>> {
  const existing = await getCabinById(id);
  if (!existing) return fail('NOT_FOUND', 'Cabin not found.');

  if (actor.role !== 'admin' && existing.ownerId !== actor.uid) {
    return fail('FORBIDDEN', 'Access denied.');
  }

  await updateCabin(id, input);
  log.info({ id, actorUid: actor.uid }, 'Cabin updated');
  return ok(undefined);
}

export async function removeCabin(id: string, actor: SessionUser): Promise<Result<void>> {
  const existing = await getCabinById(id);
  if (!existing) return fail('NOT_FOUND', 'Cabin not found.');

  if (actor.role !== 'admin' && existing.ownerId !== actor.uid) {
    return fail('FORBIDDEN', 'Access denied.');
  }

  await deleteCabin(id);
  log.info({ id, actorUid: actor.uid }, 'Cabin deleted');
  return ok(undefined);
}
