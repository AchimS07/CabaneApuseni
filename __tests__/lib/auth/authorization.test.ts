import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { canAccess, hasRole } from '@/lib/auth/authorization';
import type { SessionUser } from '@/lib/auth/session';

// ─── Pure helper tests ─────────────────────────────────────────────────────────

const user: SessionUser = {
  uid: 'user-1',
  email: 'user@example.com',
  role: 'user',
};

const owner: SessionUser = {
  uid: 'owner-1',
  email: 'owner@example.com',
  role: 'owner',
};

const admin: SessionUser = {
  uid: 'admin-1',
  email: 'admin@example.com',
  role: 'admin',
};

describe('hasRole', () => {
  it('allows any authenticated user for role=user', () => {
    expect(hasRole(user, 'user')).toBe(true);
    expect(hasRole(owner, 'user')).toBe(true);
    expect(hasRole(admin, 'user')).toBe(true);
  });

  it('allows owner and admin for role=owner', () => {
    expect(hasRole(user, 'owner')).toBe(false);
    expect(hasRole(owner, 'owner')).toBe(true);
    expect(hasRole(admin, 'owner')).toBe(true);
  });

  it('allows only admins for role=admin', () => {
    expect(hasRole(user, 'admin')).toBe(false);
    expect(hasRole(owner, 'admin')).toBe(false);
    expect(hasRole(admin, 'admin')).toBe(true);
  });
});

describe('canAccess', () => {
  it('allows owner access', () => {
    expect(canAccess(user, 'user-1')).toBe(true);
  });

  it('denies non-owner user access', () => {
    expect(canAccess(user, 'other-user')).toBe(false);
  });

  it('allows admin to access any resource', () => {
    expect(canAccess(admin, 'other-user')).toBe(true);
  });

  it('allows owner role user to access their own resource', () => {
    expect(canAccess(owner, 'owner-1')).toBe(true);
  });

  it('denies owner role user from accessing another owner\'s resource', () => {
    expect(canAccess(owner, 'other-owner')).toBe(false);
  });
});

// ─── requireAuth / requireOwner / requireAdmin ─────────────────────────────────

jest.mock('next/navigation', () => ({
  redirect: jest.fn().mockImplementation((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

jest.mock('@/lib/auth/session', () => ({
  verifySession: jest.fn(),
}));

jest.mock('@/modules/users/infrastructure/firestoreUserRepository', () => ({
  getUserById: jest.fn(),
}));

import * as sessionModule from '@/lib/auth/session';
import * as userRepo from '@/modules/users/infrastructure/firestoreUserRepository';
import { requireAuth, requireOwner, requireAdmin } from '@/lib/auth/authorization';
import type { UserProfile } from '@/modules/users/domain/types';

const mockVerify = jest.mocked(sessionModule.verifySession);
const mockGetUser = jest.mocked(userRepo.getUserById);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('requireAuth', () => {
  it('returns the session user when authenticated', async () => {
    mockVerify.mockResolvedValue(user);
    const result = await requireAuth();
    expect(result).toEqual(user);
  });

  it('redirects to /login when session is missing', async () => {
    mockVerify.mockResolvedValue(null);
    await expect(requireAuth()).rejects.toThrow('REDIRECT:/login');
  });
});

describe('requireOwner', () => {
  it('returns session immediately when role is owner', async () => {
    mockVerify.mockResolvedValue(owner);
    const result = await requireOwner();
    expect(result).toEqual(owner);
    expect(mockGetUser).not.toHaveBeenCalled();
  });

  it('returns session immediately when role is admin', async () => {
    mockVerify.mockResolvedValue(admin);
    const result = await requireOwner();
    expect(result).toEqual(admin);
    expect(mockGetUser).not.toHaveBeenCalled();
  });

  it('redirects to /login when session is missing', async () => {
    mockVerify.mockResolvedValue(null);
    await expect(requireOwner()).rejects.toThrow('REDIRECT:/login');
  });

  it('redirects to /dashboard when user has no owner/admin role and no Firestore fallback', async () => {
    mockVerify.mockResolvedValue(user);
    mockGetUser.mockResolvedValue({ ...user, role: 'user', name: 'Test', createdAt: '', updatedAt: '' } as UserProfile);
    await expect(requireOwner()).rejects.toThrow('REDIRECT:/dashboard');
  });

  it('returns upgraded session when Firestore profile shows owner role', async () => {
    mockVerify.mockResolvedValue(user);
    mockGetUser.mockResolvedValue({ ...user, role: 'owner', name: 'Test', createdAt: '', updatedAt: '' } as UserProfile);
    const result = await requireOwner();
    expect(result.role).toBe('owner');
  });

  it('redirects to /dashboard when user has no profile in Firestore', async () => {
    mockVerify.mockResolvedValue(user);
    mockGetUser.mockResolvedValue(null);
    await expect(requireOwner()).rejects.toThrow('REDIRECT:/dashboard');
  });
});

describe('requireAdmin', () => {
  it('returns session immediately when role is admin', async () => {
    mockVerify.mockResolvedValue(admin);
    const result = await requireAdmin();
    expect(result).toEqual(admin);
    expect(mockGetUser).not.toHaveBeenCalled();
  });

  it('redirects to /login when session is missing', async () => {
    mockVerify.mockResolvedValue(null);
    await expect(requireAdmin()).rejects.toThrow('REDIRECT:/login');
  });

  it('redirects to /dashboard when role is owner (not admin)', async () => {
    mockVerify.mockResolvedValue(owner);
    mockGetUser.mockResolvedValue({ ...owner, role: 'owner', name: 'Test', createdAt: '', updatedAt: '' } as UserProfile);
    await expect(requireAdmin()).rejects.toThrow('REDIRECT:/dashboard');
  });

  it('redirects to /dashboard when role is user with no Firestore fallback', async () => {
    mockVerify.mockResolvedValue(user);
    mockGetUser.mockResolvedValue({ ...user, role: 'user', name: 'Test', createdAt: '', updatedAt: '' } as UserProfile);
    await expect(requireAdmin()).rejects.toThrow('REDIRECT:/dashboard');
  });

  it('returns upgraded session when Firestore profile shows admin role', async () => {
    mockVerify.mockResolvedValue(user);
    mockGetUser.mockResolvedValue({ ...user, role: 'admin', name: 'Test', createdAt: '', updatedAt: '' } as UserProfile);
    const result = await requireAdmin();
    expect(result.role).toBe('admin');
  });

  it('redirects to /dashboard when user has no profile in Firestore', async () => {
    mockVerify.mockResolvedValue(user);
    mockGetUser.mockResolvedValue(null);
    await expect(requireAdmin()).rejects.toThrow('REDIRECT:/dashboard');
  });
});
