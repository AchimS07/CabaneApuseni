/**
 * app/api/subscriptions/checkout/route.ts
 * Creates a Stripe Checkout Session for owner subscriptions.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifySession } from '@/lib/auth/session';
import { getUserById, upsertUser } from '@/modules/users/infrastructure/firestoreUserRepository';
import { getStripe } from '@/lib/stripe/client';
import { createLogger } from '@/lib/observability/logger';

const log = createLogger({ module: 'subscriptions/checkout' });

const bodySchema = z.object({
  plan: z.enum(['basic', 'pro']),
});

export async function POST(req: NextRequest) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const { plan } = parsed.data;
  const priceId =
    plan === 'basic'
      ? process.env.STRIPE_BASIC_PRICE_ID
      : process.env.STRIPE_PRO_PRICE_ID;

  if (!priceId) {
    log.error({ plan }, 'Stripe price ID not configured');
    return NextResponse.json({ error: 'Plan not configured.' }, { status: 500 });
  }

  try {
    const stripe = getStripe();
    const profile = await getUserById(session.uid);
    let customerId = profile?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.email ?? undefined,
        metadata: { uid: session.uid },
      });
      customerId = customer.id;
      await upsertUser(session.uid, { stripeCustomerId: customerId });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: appUrl + '/dashboard/owner?subscription=success',
      cancel_url: appUrl + '/pricing',
      metadata: { uid: session.uid, plan },
      subscription_data: { metadata: { uid: session.uid } },
    });

    log.info({ uid: session.uid, plan }, 'Checkout session created');
    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    log.error({ error, uid: session.uid }, 'Failed to create checkout session');
    return NextResponse.json(
      { error: 'Failed to create checkout session.' },
      { status: 500 },
    );
  }
}
