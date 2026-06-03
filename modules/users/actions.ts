'use server';

/**
 * modules/users/actions.ts
 * Server Actions for user profile management.
 */
import { verifySession } from '@/lib/auth/session';
import { updateProfile } from '@/modules/users/application/userService';
import { activateSubscription } from '@/modules/users/application/subscriptionService';
import {
  getLatestPendingPaymentByUid,
  deletePendingPayment,
} from '@/lib/netopia/pendingPayments';
import type { UpdateProfileInput } from '@/lib/validation/schemas';
import { revalidatePath } from 'next/cache';
import { createLogger } from '@/lib/observability/logger';

const log = createLogger({ module: 'users/actions' });

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

export type VerifyPaymentResult =
  | { ok: true; activated: boolean }
  | { ok: false; error: string };

/**
 * Redirect-based payment fallback.
 * Called when the user lands on /dashboard/owner?subscription=success.
 * Looks up the most recent pending payment for the current user in Firestore
 * and activates the subscription if one is found.
 * This handles the case where the Netopia IPN could not reach the server
 * (e.g. the app is running on localhost during development).
 */
export async function verifyPendingPaymentAction(): Promise<VerifyPaymentResult> {
  const session = await verifySession();
  if (!session) return { ok: false, error: 'Autentificare necesară.' };

  try {
    const pending = await getLatestPendingPaymentByUid(session.uid);
    if (!pending) {
      return { ok: true, activated: false };
    }

    await activateSubscription(pending.uid, pending.plan, pending.orderID);
    await deletePendingPayment(pending.orderID).catch(() => undefined);
    log.info({ uid: session.uid, plan: pending.plan }, 'Subscription activated via redirect fallback');

    revalidatePath('/dashboard/owner');
    revalidatePath('/dashboard');
    return { ok: true, activated: true };
  } catch (error) {
    log.error({ error, uid: session.uid }, 'verifyPendingPaymentAction failed');
    return { ok: false, error: 'Nu s-a putut verifica plata. Încearcă din nou.' };
  }
}
