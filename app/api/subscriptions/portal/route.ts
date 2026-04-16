/**
 * app/api/subscriptions/portal/route.ts
 * Creates a Stripe Customer Portal session so owners can manage their subscription.
 */
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth/session';
import { getUserById } from '@/modules/users/infrastructure/firestoreUserRepository';
import { getStripe } from '@/lib/stripe/client';
import { createLogger } from '@/lib/observability/logger';

const log = createLogger({ module: 'subscriptions/portal' });

export async function POST(_req: NextRequest) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profile = await getUserById(session.uid);
  if (!profile?.stripeCustomerId) {
    return NextResponse.json({ error: 'No subscription found.' }, { status: 404 });
  }

  try {
    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile.stripeCustomerId,
      return_url: appUrl + '/dashboard/owner',
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    log.error({ error, uid: session.uid }, 'Failed to create billing portal session');
    return NextResponse.json(
      { error: 'Failed to open billing portal.' },
      { status: 500 },
    );
  }
}
