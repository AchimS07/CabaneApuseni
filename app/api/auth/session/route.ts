/**
 * app/api/auth/session/route.ts
 * Exchanges a Firebase ID token for an HTTP-only session cookie (POST)
 * or clears the session cookie (DELETE).
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSessionCookie, clearSessionCookie } from '@/lib/auth/session';
import { createLogger } from '@/lib/observability/logger';

const log = createLogger({ route: '/api/auth/session' });

const bodySchema = z.object({
  idToken: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: 'idToken is required.' }, { status: 400 });
    }

    await createSessionCookie(parsed.data.idToken);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    log.error({ err }, 'Failed to create session cookie');
    const isConfigError =
      err instanceof Error && err.message.startsWith('[env] Missing or invalid');
    return NextResponse.json(
      { error: isConfigError ? 'Server misconfiguration.' : 'Failed to create session.' },
      { status: isConfigError ? 500 : 401 },
    );
  }
}

export async function DELETE() {
  try {
    await clearSessionCookie();
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    log.error({ err }, 'Failed to clear session cookie');
    return NextResponse.json({ error: 'Failed to sign out.' }, { status: 500 });
  }
}
