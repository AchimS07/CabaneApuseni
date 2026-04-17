import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifySession } from '@/lib/auth/session';
import { getAdminAuth } from '@/lib/firebase/admin';
import { getUserById, upsertUser } from '@/modules/users/infrastructure/firestoreUserRepository';
import { createLogger } from '@/lib/observability/logger';

const log = createLogger({ route: '/api/users/me' });

const bodySchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional(),
  role: z.enum(['user', 'owner']).default('user'),
  plan: z.enum(['gratuit', 'explorer', 'premium', 'starter', 'pro', 'business']).optional(),
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

  const existing = await getUserById(session.uid);
  const email = parsed.data.email ?? existing?.email ?? session.email;
  if (!email) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
  }

  const now = new Date().toISOString();
  try {
    await upsertUser(session.uid, {
      email,
      name: parsed.data.name,
      role: parsed.data.role,
      plan: parsed.data.plan,
      createdAt: existing?.createdAt ?? now,
    });

    // Sync role to Firebase custom claims so session cookies include the correct role.
    await getAdminAuth().setCustomUserClaims(session.uid, { role: parsed.data.role });
  } catch (err) {
    log.error({ err, uid: session.uid }, 'Failed to save user profile');
    return NextResponse.json({ error: 'Failed to save user profile' }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
