'use server';

/**
 * modules/users/actions.ts
 * Server Actions for user profile management.
 */
import { verifySession } from '@/lib/auth/session';
import { updateProfile } from '@/modules/users/application/userService';
import type { UpdateProfileInput } from '@/lib/validation/schemas';
import { revalidatePath } from 'next/cache';

export type UpdateProfileResult =
  | { ok: true }
  | { ok: false; error: string; details?: Record<string, string[]> };

export async function updateProfileAction(
  input: UpdateProfileInput,
): Promise<UpdateProfileResult> {
  const session = await verifySession();
  if (!session) return { ok: false, error: 'Autentificare necesară.' };

  const result = await updateProfile(session.uid, input);
  if (!result.ok) {
    return {
      ok: false,
      error: result.error.message,
      details: result.error.details,
    };
  }

  revalidatePath('/dashboard/profile');
  revalidatePath('/dashboard');
  return { ok: true };
}
