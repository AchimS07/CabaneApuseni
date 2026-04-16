/**
 * Unit tests for /api/users/me route handler.
 * Firestore and session helpers are mocked.
 */
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

jest.mock('@/lib/auth/session', () => ({
  verifySession: jest.fn(),
}));
jest.mock('@/modules/users/infrastructure/firestoreUserRepository', () => ({
  getUserById: jest.fn(),
  upsertUser: jest.fn(),
}));
jest.mock('@/lib/firebase/admin', () => ({
  getAdminAuth: jest.fn().mockReturnValue({
    setCustomUserClaims: jest.fn().mockResolvedValue(undefined),
  }),
  getAdminFirestore: jest.fn(),
}));

import { NextRequest } from 'next/server';
import * as sessionModule from '@/lib/auth/session';
import * as userRepo from '@/modules/users/infrastructure/firestoreUserRepository';
import { POST } from '@/app/api/users/me/route';

const mockVerify = jest.mocked(sessionModule.verifySession);
const mockGetUser = jest.mocked(userRepo.getUserById);
const mockUpsert = jest.mocked(userRepo.upsertUser);

const session = { uid: 'user-1', email: 'user@example.com', role: 'user' as const };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/users/me', () => {
  it('upserts the user profile and returns 200', async () => {
    mockVerify.mockResolvedValue(session);
    mockGetUser.mockResolvedValue(null);
    mockUpsert.mockResolvedValue(undefined);

    const req = new NextRequest('http://localhost/api/users/me', {
      method: 'POST',
      body: JSON.stringify({ name: 'Ion Popescu', email: 'user@example.com', role: 'user' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(mockUpsert).toHaveBeenCalledWith('user-1', expect.objectContaining({ name: 'Ion Popescu', role: 'user' }));
  });

  it('returns 401 when session is missing', async () => {
    mockVerify.mockResolvedValue(null);

    const req = new NextRequest('http://localhost/api/users/me', {
      method: 'POST',
      body: JSON.stringify({ name: 'Ion Popescu', role: 'user' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it('returns 400 when name is too short', async () => {
    mockVerify.mockResolvedValue(session);

    const req = new NextRequest('http://localhost/api/users/me', {
      method: 'POST',
      body: JSON.stringify({ name: 'X', role: 'user' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it('uses the email from the existing profile if not provided', async () => {
    mockVerify.mockResolvedValue(session);
    mockGetUser.mockResolvedValue({
      uid: 'user-1',
      email: 'existing@example.com',
      name: 'Old Name',
      role: 'user',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    });
    mockUpsert.mockResolvedValue(undefined);

    const req = new NextRequest('http://localhost/api/users/me', {
      method: 'POST',
      body: JSON.stringify({ name: 'New Name', role: 'user' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockUpsert).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ email: 'existing@example.com', name: 'New Name' }),
    );
  });
});
