import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
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

  it('passes through non-API routes without rate limiting', () => {
    const req = new NextRequest('http://localhost/dashboard', {
      headers: { 'x-forwarded-for': '10.0.1.1' },
    });
    expect(middleware(req).status).toBe(200);
  });

  it('uses x-real-ip when x-forwarded-for is absent', () => {
    const req = new NextRequest('http://localhost/api/health', {
      headers: { 'x-real-ip': '10.0.2.1' },
    });
    expect(middleware(req).status).toBe(200);
  });

  it('falls back to "unknown" when no IP headers are present', () => {
    const req = new NextRequest('http://localhost/api/health');
    // Should not throw — unknown IP bucket is used
    expect(() => middleware(req)).not.toThrow();
  });

  it('uses only the first IP from a comma-separated x-forwarded-for value', () => {
    const req = new NextRequest('http://localhost/api/health', {
      headers: { 'x-forwarded-for': '10.0.3.1, 10.0.3.2, 10.0.3.3' },
    });
    expect(middleware(req).status).toBe(200);
  });

  it('resets the rate limit counter after the window expires', () => {
    const ip = '10.0.4.1';
    const makeReq = () =>
      new NextRequest('http://localhost/api/health', {
        headers: { 'x-forwarded-for': ip },
      });

    for (let i = 0; i < 100; i += 1) {
      middleware(makeReq());
    }
    expect(middleware(makeReq()).status).toBe(429);

    // Advance time past the 60-second window
    const realNow = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(realNow + 61_000);
    expect(middleware(makeReq()).status).toBe(200);
    jest.restoreAllMocks();
  });
});

