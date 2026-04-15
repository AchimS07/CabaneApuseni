import { describe, it, expect } from '@jest/globals';
import { NextRequest } from 'next/server';
import { middleware } from '@/middleware';

describe('middleware rate limiting', () => {
  it('allows API requests under the limit', () => {
    const request = new NextRequest('http://localhost/api/health', {
      headers: { 'x-forwarded-for': '10.0.0.1' },
    });

    const response = middleware(request);
    expect(response.status).toBe(200);
  });

  it('returns 429 when requests exceed per-IP limit', async () => {
    for (let i = 0; i < 100; i += 1) {
      middleware(
        new NextRequest('http://localhost/api/health', {
          headers: { 'x-forwarded-for': '10.0.0.2' },
        }),
      );
    }

    const blocked = middleware(
      new NextRequest('http://localhost/api/health', {
        headers: { 'x-forwarded-for': '10.0.0.2' },
      }),
    );

    expect(blocked.status).toBe(429);
    expect(blocked.headers.get('Retry-After')).toBe('60');
    await expect(blocked.text()).resolves.toContain('Too Many Requests');
  });
});
