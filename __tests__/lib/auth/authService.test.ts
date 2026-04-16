/**
 * Unit tests for modules/auth/application/authService.ts
 * Firebase auth repository and fetch are mocked.
 */
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mock Firebase auth repository
jest.mock('@/modules/auth/infrastructure/firebaseAuthRepository', () => ({
  signInWithEmail: jest.fn(),
  registerWithEmail: jest.fn(),
  signOutUser: jest.fn(),
}));

// Mock global fetch
const mockFetch = jest.fn<typeof fetch>();
global.fetch = mockFetch;

import * as firebaseRepo from '@/modules/auth/infrastructure/firebaseAuthRepository';
import { login, register, logout } from '@/modules/auth/application/authService';

const mockSignIn = jest.mocked(firebaseRepo.signInWithEmail);
const mockRegister = jest.mocked(firebaseRepo.registerWithEmail);
const mockSignOut = jest.mocked(firebaseRepo.signOutUser);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('login', () => {
  it('signs in and exchanges the token for a session cookie', async () => {
    mockSignIn.mockResolvedValue({ uid: 'user-1', idToken: 'id-token-123' });
    mockFetch.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    await login('user@example.com', 'password123');

    expect(mockSignIn).toHaveBeenCalledWith('user@example.com', 'password123');
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/auth/session',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ idToken: 'id-token-123' }),
      }),
    );
  });

  it('throws when the session exchange fails', async () => {
    mockSignIn.mockResolvedValue({ uid: 'user-1', idToken: 'bad-token' });
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ error: 'Failed to create session' }), { status: 401 }),
    );

    await expect(login('user@example.com', 'pass')).rejects.toThrow('Failed to create session');
  });
});

describe('register', () => {
  it('registers, exchanges token, and syncs profile', async () => {
    mockRegister.mockResolvedValue({ uid: 'user-2', idToken: 'new-token' });
    mockFetch
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 })) // session
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 })); // profile

    await register('new@example.com', 'password123', 'Ion Popescu', 'user');

    expect(mockRegister).toHaveBeenCalledWith('new@example.com', 'password123', 'Ion Popescu');

    // First fetch: exchange token
    expect(mockFetch).toHaveBeenNthCalledWith(
      1,
      '/api/auth/session',
      expect.objectContaining({ method: 'POST' }),
    );

    // Second fetch: sync profile
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      '/api/users/me',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('Ion Popescu'),
      }),
    );
  });

  it('throws when profile sync fails', async () => {
    mockRegister.mockResolvedValue({ uid: 'user-2', idToken: 'new-token' });
    mockFetch
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'Email is required.' }), { status: 400 }),
      );

    await expect(register('new@example.com', 'password123', 'Ion Popescu')).rejects.toThrow(
      'Email is required.',
    );
  });
});

describe('logout', () => {
  it('signs out from Firebase and clears the session cookie', async () => {
    mockSignOut.mockResolvedValue(undefined);
    mockFetch.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    await logout();

    expect(mockSignOut).toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/auth/session',
      expect.objectContaining({ method: 'DELETE' }),
    );
  });
});
