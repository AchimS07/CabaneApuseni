/**
 * app/api/subscriptions/webhook/route.ts
 * Stripe webhook handler. Processes subscription lifecycle events.
 * Uses raw body for signature verification — must run in Node.js runtime.
 */
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripe } from '@/lib/stripe/client';
import {
  activateSubscription,
  renewSubscription,
  deactivateSubscription,
  markSubscriptionPastDue,
} from '@/modules/users/application/subscriptionService';
import type { SubscriptionTier } from '@/lib/subscription/plans';
import { createLogger } from '@/lib/observability/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const log = createLogger({ module: 'subscriptions/webhook' });

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('stripe-signature') ?? '';
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? '';

  if (!webhookSecret) {
    log.error({}, 'STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'Webhook secret not configured.' }, { status: 500 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    log.warn({ err }, 'Webhook signature verification failed');
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const cs = event.data.object as Stripe.Checkout.Session;
        const uid = cs.metadata?.uid;
        const tier = cs.metadata?.plan as SubscriptionTier | undefined;
        const rawSub = cs.subscription;
        const rawCust = cs.customer;
        const subscriptionId = rawSub
          ? typeof rawSub === 'string' ? rawSub : (rawSub as Stripe.Subscription).id
          : null;
        const customerId = rawCust
          ? typeof rawCust === 'string' ? rawCust : (rawCust as Stripe.Customer).id
          : null;
        if (uid && tier && subscriptionId && customerId) {
          await activateSubscription(uid, tier, subscriptionId, customerId);
        }
        break;
      }

      case 'invoice.paid': {
        const inv = event.data.object as Stripe.Invoice;
        const rawSub = inv.subscription;
        const subscriptionId = rawSub
          ? typeof rawSub === 'string' ? rawSub : (rawSub as Stripe.Subscription).id
          : null;
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const uid = subscription.metadata?.uid;
          if (uid) await renewSubscription(uid);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const uid = subscription.metadata?.uid;
        if (uid) await deactivateSubscription(uid);
        break;
      }

      case 'invoice.payment_failed': {
        const inv = event.data.object as Stripe.Invoice;
        const rawSub = inv.subscription;
        const subscriptionId = rawSub
          ? typeof rawSub === 'string' ? rawSub : (rawSub as Stripe.Subscription).id
          : null;
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const uid = subscription.metadata?.uid;
          if (uid) await markSubscriptionPastDue(uid);
        }
        break;
      }

      default:
        log.debug({ type: event.type }, 'Unhandled Stripe event type');
    }
  } catch (error) {
    log.error({ error, eventType: event.type }, 'Error handling webhook event');
    // Return 500 so Stripe retries this event — all service operations are idempotent.
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
