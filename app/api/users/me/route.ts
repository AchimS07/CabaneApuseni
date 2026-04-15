import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifySession } from '@/lib/auth/session';
import { getUserById, upsertUser } from '@/modules/users/infrastructure/firestoreUserRepository';

const bodySchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional(),
  role: z.enum(['user', 'owner']).default('user'),
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
  await upsertUser(session.uid, {
    email,
    name: parsed.data.name,
    role: parsed.data.role,
    createdAt: existing?.createdAt ?? now,
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
