/**
 * app/api/subscriptions/portal/route.ts
 * Returns a URL for managing the subscription.
 * Netopia does not provide a self-service billing portal, so owners are
 * directed to the pricing page to change their plan or contact support to cancel.
 */
import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth/session';

export async function POST() {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  return NextResponse.json({ url: `${appUrl}/pricing` });
}
