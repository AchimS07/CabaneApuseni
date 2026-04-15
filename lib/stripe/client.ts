/**
 * lib/stripe/client.ts
 * Server-only Stripe singleton. Never import in Client Components.
 */
import Stripe from 'stripe';
import { getServerEnv } from '@/lib/env';

let _stripe: Stripe | undefined;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const env = getServerEnv();
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured. Add it to your .env.local file.');
  }
  _stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-03-31.basil' as Stripe.LatestApiVersion,
  });
  return _stripe;
}
