/**
 * Unit tests for /api/auth/session route handler.
 * Firebase session helpers are mocked — no real Firebase connections.
 */
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

jest.mock('@/lib/auth/session', () => ({
  createSessionCookie: jest.fn(),
  clearSessionCookie: jest.fn(),
}));
jest.mock('@/lib/observability/logger', () => ({
  createLogger: () => ({ error: jest.fn(), info: jest.fn() }),
}));

import { NextRequest } from 'next/server';
import * as sessionModule from '@/lib/auth/session';
import { POST, DELETE } from '@/app/api/auth/session/route';

const mockCreate = jest.mocked(sessionModule.createSessionCookie);
const mockClear = jest.mocked(sessionModule.clearSessionCookie);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/auth/session', () => {
  it('creates a session cookie for a valid idToken and returns 200', async () => {
    mockCreate.mockResolvedValue(undefined);

    const req = new NextRequest('http://localhost/api/auth/session', {
      method: 'POST',
      body: JSON.stringify({ idToken: 'valid-id-token' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(mockCreate).toHaveBeenCalledWith('valid-id-token');
  });

  it('returns 400 when idToken is missing', async () => {
    const req = new NextRequest('http://localhost/api/auth/session', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('returns 401 when session creation throws a generic error', async () => {
    mockCreate.mockRejectedValue(new Error('Token expired'));

    const req = new NextRequest('http://localhost/api/auth/session', {
      method: 'POST',
      body: JSON.stringify({ idToken: 'bad-token' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it('returns 500 for a server misconfiguration error', async () => {
    mockCreate.mockRejectedValue(
      new Error('[env] Missing or invalid server env vars: FIREBASE_PRIVATE_KEY'),
    );

    const req = new NextRequest('http://localhost/api/auth/session', {
      method: 'POST',
      body: JSON.stringify({ idToken: 'any-token' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toMatch(/misconfiguration/i);
  });
});

describe('DELETE /api/auth/session', () => {
  it('clears the session cookie and returns 200', async () => {
    mockClear.mockResolvedValue(undefined);

    const res = await DELETE();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(mockClear).toHaveBeenCalled();
  });

  it('returns 500 when clearing the cookie fails', async () => {
    mockClear.mockRejectedValue(new Error('Cookie store unavailable'));

    const res = await DELETE();
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });
});
