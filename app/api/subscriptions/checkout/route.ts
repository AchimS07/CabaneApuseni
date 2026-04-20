/**
 * app/api/subscriptions/checkout/route.ts
 * Creates a Netopia Payments hosted checkout session for owner subscriptions.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { verifySession } from '@/lib/auth/session';
import { getUserById } from '@/modules/users/infrastructure/firestoreUserRepository';
import { createNetopiaPayment } from '@/lib/netopia/client';
import { getServerEnv } from '@/lib/env';
import { PLANS } from '@/lib/subscription/plans';
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
  const planMeta = PLANS.find((p) => p.id === plan);
  if (!planMeta) {
    return NextResponse.json({ error: 'Plan not found.' }, { status: 400 });
  }

  const env = getServerEnv();
  if (!env.NETOPIA_API_KEY || !env.NETOPIA_SELLER_ID) {
    log.error({ plan }, 'Netopia credentials not configured');
    return NextResponse.json({ error: 'Payment provider not configured.' }, { status: 500 });
  }

  try {
    const profile = await getUserById(session.uid);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const orderID = randomUUID();

    // Split display name into first/last (best-effort)
    const nameParts = (profile?.name ?? session.email ?? 'User').trim().split(' ');
    const firstName = nameParts[0] ?? 'User';
    const lastName = nameParts.slice(1).join(' ') || firstName;

    const billing = {
      email: session.email ?? '',
      phone: profile?.phone ?? '',
      firstName,
      lastName,
      city: '',
      country: 642, // Romania
      state: '',
      postalCode: '',
      details: '',
    };

    const response = await createNetopiaPayment({
      config: {
        notifyUrl: `${appUrl}/api/subscriptions/ipn`,
        redirectUrl: `${appUrl}/dashboard/owner?subscription=success`,
        language: 'ro',
      },
      payment: {
        options: { installments: 0, bonus: 0 },
        instrument: {
          type: 'card',
          account: '',
          expMonth: 0,
          expYear: 0,
          secretCode: '',
          token: '',
        },
        data: {},
      },
      order: {
        posSignature: env.NETOPIA_SELLER_ID,
        dateTime: new Date().toISOString(),
        description: `Abonament ${planMeta.name} – Cabane Apuseni`,
        orderID,
        amount: planMeta.priceRon,
        currency: 'RON',
        billing,
        shipping: billing,
        products: [
          {
            name: `Plan ${planMeta.name}`,
            code: plan,
            category: 'subscription',
            price: planMeta.priceRon,
            vat: 19,
          },
        ],
        installments: { selected: 0, available: [] },
        data: { uid: session.uid, plan },
      },
    });

    // error.code "101" is Netopia's success code meaning "redirect to paymentURL"
    const paymentURL = response.payment?.paymentURL;
    if (!paymentURL) {
      log.error({ response, uid: session.uid, plan }, 'Netopia did not return a paymentURL');
      return NextResponse.json({ error: 'Failed to create payment session.' }, { status: 500 });
    }

    log.info({ uid: session.uid, plan, orderID }, 'Netopia checkout session created');
    return NextResponse.json({ url: paymentURL });
  } catch (error) {
    log.error({ error, uid: session.uid }, 'Failed to create Netopia checkout session');
    return NextResponse.json(
      { error: 'Failed to create payment session.' },
      { status: 500 },
    );
  }
}
