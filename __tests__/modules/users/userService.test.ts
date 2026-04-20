/**
 * Unit tests for modules/users/application/userService.ts
 * Repositories are mocked — no real Firestore connections.
 */
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

jest.mock('@/modules/users/infrastructure/firestoreUserRepository', () => ({
  getUserById: jest.fn(),
  upsertUser: jest.fn(),
}));
jest.mock('@/lib/observability/logger', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn() }),
}));

import * as userRepo from '@/modules/users/infrastructure/firestoreUserRepository';
import { getProfile, updateProfile } from '@/modules/users/application/userService';
import type { UserProfile } from '@/modules/users/domain/types';

const mockGetUser = jest.mocked(userRepo.getUserById);
const mockUpsert = jest.mocked(userRepo.upsertUser);

const mockProfile: UserProfile = {
  uid: 'user-1',
  email: 'user@example.com',
  name: 'Ion Popescu',
  role: 'user',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  subscriptionTier: null,
  subscriptionStatus: null,
  subscriptionExpiresAt: null,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getProfile', () => {
  it('returns the user profile when found', async () => {
    mockGetUser.mockResolvedValue(mockProfile);

    const result = await getProfile('user-1');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.uid).toBe('user-1');
      expect(result.data.name).toBe('Ion Popescu');
    }
    expect(mockGetUser).toHaveBeenCalledWith('user-1');
  });

  it('returns NOT_FOUND when profile does not exist', async () => {
    mockGetUser.mockResolvedValue(null);

    const result = await getProfile('nonexistent');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('NOT_FOUND');
      expect(result.error.message).toMatch(/not found/i);
    }
  });
});

describe('updateProfile', () => {
  it('updates the profile with valid input', async () => {
    mockUpsert.mockResolvedValue(undefined);

    const result = await updateProfile('user-1', { name: 'Maria Ionescu' });
    expect(result.ok).toBe(true);
    expect(mockUpsert).toHaveBeenCalledWith('user-1', expect.objectContaining({ name: 'Maria Ionescu' }));
  });

  it('updates with optional phone and avatarUrl', async () => {
    mockUpsert.mockResolvedValue(undefined);

    const result = await updateProfile('user-1', {
      name: 'Maria Ionescu',
      phone: '+40723000000',
      avatarUrl: 'https://example.com/avatar.jpg',
    });
    expect(result.ok).toBe(true);
    expect(mockUpsert).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({
        name: 'Maria Ionescu',
        phone: '+40723000000',
        avatarUrl: 'https://example.com/avatar.jpg',
      }),
    );
  });

  it('returns VALIDATION_ERROR when name is too short', async () => {
    const result = await updateProfile('user-1', { name: 'A' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('VALIDATION_ERROR');
    }
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it('returns VALIDATION_ERROR when avatarUrl is not a valid URL', async () => {
    const result = await updateProfile('user-1', {
      name: 'Ion Popescu',
      avatarUrl: 'not-a-url',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('VALIDATION_ERROR');
      expect(result.error.details).toBeDefined();
    }
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it('returns VALIDATION_ERROR when input is empty', async () => {
    const result = await updateProfile('user-1', {} as { name: string });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('VALIDATION_ERROR');
    expect(mockUpsert).not.toHaveBeenCalled();
  });
});
