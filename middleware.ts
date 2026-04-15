import { NextRequest, NextResponse } from 'next/server';

/**
 * In-memory rate limiter for /api/* routes.
 * Acceptable for MVP – resets on cold-starts in serverless environments.
 * Does NOT protect against distributed attacks (multiple IPs/instances).
 * For production, replace with a Redis-backed solution (e.g. Upstash Rate Limit).
 */

interface RateRecord {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateRecord>();
const WINDOW_MS   = 60_000; // 1 minute
const MAX_REQUESTS = 100;

function isAllowed(ip: string): boolean {
  const now    = Date.now();
  const record = store.get(ip);

  if (!record || now > record.resetAt) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  record.count += 1;
  return record.count <= MAX_REQUESTS;
}

export function middleware(request: NextRequest): NextResponse {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      'unknown';

    if (!isAllowed(ip)) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: { 'Retry-After': '60', 'Content-Type': 'text/plain' },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
