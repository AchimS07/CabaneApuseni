/**
 * modules/users/application/userService.ts
 */
import { ok, fail, type Result } from '@/lib/result';
import { updateProfileSchema, type UpdateProfileInput } from '@/lib/validation/schemas';
import { getUserById, upsertUser } from '@/modules/users/infrastructure/firestoreUserRepository';
import type { UserProfile } from '@/modules/users/domain/types';
import { createLogger } from '@/lib/observability/logger';

const log = createLogger({ module: 'userService' });

export async function getProfile(uid: string): Promise<Result<UserProfile>> {
  const profile = await getUserById(uid);
  if (!profile) return fail('NOT_FOUND', 'User profile not found.');
  return ok(profile);
}

export async function updateProfile(
  uid: string,
  input: UpdateProfileInput,
): Promise<Result<void>> {
  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    return fail('VALIDATION_ERROR', 'Invalid input.', parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }

  await upsertUser(uid, parsed.data);
  log.info({ uid }, 'Profile updated');
  return ok(undefined);
}
