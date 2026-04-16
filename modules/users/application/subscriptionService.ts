/**
 * modules/users/application/subscriptionService.ts
 * Manages subscription lifecycle: activation, renewal, deactivation.
 * Updates both Firestore user profile and Firebase Auth custom claims.
 */
import { ok, fail, type Result } from '@/lib/result';
import { upsertUser } from '@/modules/users/infrastructure/firestoreUserRepository';
import { listCabinsByOwner, updateCabin } from '@/modules/cabins/infrastructure/firestoreCabinRepository';
import { getAdminAuth } from '@/lib/firebase/admin';
import type { SubscriptionTier } from '@/lib/subscription/plans';
import { createLogger } from '@/lib/observability/logger';

const log = createLogger({ module: 'subscriptionService' });

export async function activateSubscription(
  uid: string,
  tier: SubscriptionTier,
  stripeSubscriptionId: string,
  stripeCustomerId: string,
): Promise<Result<void>> {
  try {
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    await upsertUser(uid, {
      subscriptionTier: tier,
      subscriptionStatus: 'active',
      subscriptionExpiresAt: expiresAt,
      stripeSubscriptionId,
      stripeCustomerId,
    });

    const auth = getAdminAuth();
    const firebaseUser = await auth.getUser(uid);
    const existingClaims = firebaseUser.customClaims ?? {};
    await auth.setCustomUserClaims(uid, {
      ...existingClaims,
      subscriptionTier: tier,
      subscriptionStatus: 'active',
    });

    log.info({ uid, tier }, 'Subscription activated');
    return ok(undefined);
  } catch (error) {
    log.error({ uid, error }, 'Failed to activate subscription');
    return fail('INTERNAL_ERROR', 'Failed to activate subscription.');
  }
}

export async function renewSubscription(uid: string): Promise<Result<void>> {
  try {
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    await upsertUser(uid, {
      subscriptionStatus: 'active',
      subscriptionExpiresAt: expiresAt,
    });

    const auth = getAdminAuth();
    const firebaseUser = await auth.getUser(uid);
    const existingClaims = firebaseUser.customClaims ?? {};
    await auth.setCustomUserClaims(uid, {
      ...existingClaims,
      subscriptionStatus: 'active',
    });

    log.info({ uid }, 'Subscription renewed');
    return ok(undefined);
  } catch (error) {
    log.error({ uid, error }, 'Failed to renew subscription');
    return fail('INTERNAL_ERROR', 'Failed to renew subscription.');
  }
}

export async function deactivateSubscription(uid: string): Promise<Result<void>> {
  try {
    await upsertUser(uid, {
      subscriptionStatus: 'cancelled',
      subscriptionTier: null,
    });

    const auth = getAdminAuth();
    const firebaseUser = await auth.getUser(uid);
    const existingClaims = firebaseUser.customClaims ?? {};
    await auth.setCustomUserClaims(uid, {
      ...existingClaims,
      subscriptionTier: null,
      subscriptionStatus: 'cancelled',
    });

    await unpublishOwnerCabins(uid);
    log.info({ uid }, 'Subscription deactivated');
    return ok(undefined);
  } catch (error) {
    log.error({ uid, error }, 'Failed to deactivate subscription');
    return fail('INTERNAL_ERROR', 'Failed to deactivate subscription.');
  }
}

export async function markSubscriptionPastDue(uid: string): Promise<Result<void>> {
  try {
    await upsertUser(uid, { subscriptionStatus: 'past_due' });

    const auth = getAdminAuth();
    const firebaseUser = await auth.getUser(uid);
    const existingClaims = firebaseUser.customClaims ?? {};
    await auth.setCustomUserClaims(uid, {
      ...existingClaims,
      subscriptionStatus: 'past_due',
    });

    log.info({ uid }, 'Subscription marked past_due');
    return ok(undefined);
  } catch (error) {
    log.error({ uid, error }, 'Failed to mark subscription past_due');
    return fail('INTERNAL_ERROR', 'Failed to update subscription status.');
  }
}

async function unpublishOwnerCabins(uid: string): Promise<void> {
  const cabins = await listCabinsByOwner(uid);
  const published = cabins.filter((c) => c.published);
  await Promise.all(published.map((c) => updateCabin(c.id, { published: false })));
  if (published.length > 0) {
    log.info({ uid, count: published.length }, 'Owner cabins unpublished on subscription deactivation');
  }
}
