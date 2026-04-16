/**
 * app/api/admin/subscriptions/route.ts
 * Admin override endpoint to manually activate or deactivate a user's subscription.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifySession } from '@/lib/auth/session';
import {
  activateSubscription,
  deactivateSubscription,
} from '@/modules/users/application/subscriptionService';
import { createLogger } from '@/lib/observability/logger';

const log = createLogger({ module: 'admin/subscriptions' });

const bodySchema = z.object({
  uid: z.string().min(1),
  tier: z.enum(['basic', 'pro']).optional(),
  status: z.enum(['active', 'cancelled']),
});

export async function PATCH(req: NextRequest) {
  const session = await verifySession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const { uid, tier, status } = parsed.data;

  if (status === 'active') {
    if (!tier) {
      return NextResponse.json(
        { error: 'tier is required when activating a subscription.' },
        { status: 400 },
      );
    }
    const result = await activateSubscription(uid, tier, 'admin-override', 'admin-override');
    if (!result.ok) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }
    log.info({ adminUid: session.uid, targetUid: uid, tier }, 'Admin activated subscription');
    return NextResponse.json({ ok: true });
  }

  const result = await deactivateSubscription(uid);
  if (!result.ok) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }
  log.info({ adminUid: session.uid, targetUid: uid }, 'Admin deactivated subscription');
  return NextResponse.json({ ok: true });
}
