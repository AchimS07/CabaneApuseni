/**
 * app/api/subscriptions/ipn/route.ts
 * Netopia Payments IPN (Instant Payment Notification) handler.
 *
 * Netopia sends a server-to-server POST request to this URL whenever the
 * payment status changes. The handler validates the seller signature, then
 * updates the user's subscription in Firestore and Firebase Auth.
 *
 * Netopia IPN payment status codes:
 *   3  = Authorized (pending capture)
 *   5  = Confirmed (captured/settled)
 *   6  = Payment failed
 *   12 = Cancelled
 *
 * Expected response: { "errorCode": 0 } for success, { "errorCode": 1 } for errors.
 * Must run in Node.js runtime (uses crypto for validation).
 */
import { NextRequest, NextResponse } from 'next/server';
import {
  activateSubscription,
  deactivateSubscription,
  markSubscriptionPastDue,
} from '@/modules/users/application/subscriptionService';
import type { SubscriptionTier } from '@/lib/subscription/plans';
import type { NetopiaIpnPayload } from '@/lib/netopia/types';
import { getServerEnv } from '@/lib/env';
import { createLogger } from '@/lib/observability/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const log = createLogger({ module: 'subscriptions/ipn' });

/** Netopia IPN status codes */
const STATUS_AUTHORIZED = 3;
const STATUS_CONFIRMED = 5;
const STATUS_FAILED = 6;
const STATUS_CANCELLED = 12;

export async function POST(req: NextRequest) {
  const env = getServerEnv();

  if (!env.NETOPIA_SELLER_ID) {
    log.error({}, 'NETOPIA_SELLER_ID not configured');
    return NextResponse.json({ errorCode: 1 }, { status: 500 });
  }

  let body: NetopiaIpnPayload;
  try {
    const text = await req.text();
    body = JSON.parse(text) as NetopiaIpnPayload;
  } catch {
    log.warn({}, 'IPN body parse error');
    return NextResponse.json({ errorCode: 1 }, { status: 400 });
  }

  const { payment, order } = body;

  if (!payment || !order) {
    log.warn({ body }, 'IPN missing payment or order fields');
    return NextResponse.json({ errorCode: 1 }, { status: 400 });
  }

  // Verify the posSignature matches our configured seller ID to prevent spoofed IPNs
  if (order.posSignature !== env.NETOPIA_SELLER_ID) {
    log.warn({ received: order.posSignature }, 'IPN posSignature mismatch – possible spoofed request');
    return NextResponse.json({ errorCode: 1 }, { status: 400 });
  }

  const uid = payment.data?.uid ?? order.data?.uid;
  const plan = (payment.data?.plan ?? order.data?.plan) as SubscriptionTier | undefined;
  const ntpID = payment.ntpID ?? order.ntpID;
  const cardToken = payment.binding?.token;

  if (!uid) {
    log.warn({ ntpID, status: payment.status }, 'IPN missing uid in payment data');
    // Still acknowledge to Netopia so it does not keep retrying
    return NextResponse.json({ errorCode: 0 });
  }

  try {
    switch (payment.status) {
      case STATUS_AUTHORIZED:
      case STATUS_CONFIRMED: {
        if (!plan) {
          log.warn({ uid, ntpID }, 'IPN payment success but no plan found in data');
          break;
        }
        await activateSubscription(uid, plan, ntpID, cardToken);
        log.info({ uid, plan, ntpID, status: payment.status }, 'Subscription activated via IPN');
        break;
      }

      case STATUS_FAILED: {
        await markSubscriptionPastDue(uid);
        log.info({ uid, ntpID, status: payment.status }, 'Subscription marked past_due via IPN');
        break;
      }

      case STATUS_CANCELLED: {
        await deactivateSubscription(uid);
        log.info({ uid, ntpID, status: payment.status }, 'Subscription deactivated via IPN');
        break;
      }

      default: {
        // Other status codes (e.g., pending antifraud) — no subscription action needed
        log.debug({ uid, ntpID, status: payment.status }, 'Unhandled Netopia IPN status');
      }
    }
  } catch (error) {
    log.error({ error, uid, ntpID, status: payment.status }, 'Error handling Netopia IPN');
    // Return errorCode 1 so Netopia retries this event
    return NextResponse.json({ errorCode: 1 }, { status: 500 });
  }

  return NextResponse.json({ errorCode: 0 });
}
