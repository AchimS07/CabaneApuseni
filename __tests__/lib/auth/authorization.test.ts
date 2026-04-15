import { describe, it, expect } from '@jest/globals';
import { canAccess, hasRole } from '@/lib/auth/authorization';
import type { SessionUser } from '@/lib/auth/session';

const user: SessionUser = {
  uid: 'user-1',
  email: 'user@example.com',
  role: 'user',
};

const admin: SessionUser = {
  uid: 'admin-1',
  email: 'admin@example.com',
  role: 'admin',
};

describe('hasRole', () => {
  it('allows any authenticated user for role=user', () => {
    expect(hasRole(user, 'user')).toBe(true);
    expect(hasRole(admin, 'user')).toBe(true);
  });

  it('allows only admins for role=admin', () => {
    expect(hasRole(user, 'admin')).toBe(false);
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
});
