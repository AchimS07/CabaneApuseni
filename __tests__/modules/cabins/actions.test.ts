/**
 * Unit tests for modules/cabins/actions.ts server actions.
 * verifySession and cabin service functions are mocked.
 */
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

jest.mock('@/lib/auth/session', () => ({
  verifySession: jest.fn(),
}));
jest.mock('@/modules/cabins/application/cabinService', () => ({
  createCabin: jest.fn(),
  editCabin: jest.fn(),
  removeCabin: jest.fn(),
}));
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

import * as sessionModule from '@/lib/auth/session';
import * as cabinService from '@/modules/cabins/application/cabinService';
import {
  createCabinAction,
  updateCabinAction,
  togglePublishAction,
  deleteCabinAction,
} from '@/modules/cabins/actions';
import { ok, fail } from '@/lib/result';
import type { Cabin } from '@/modules/cabins/domain/types';

const mockVerify = jest.mocked(sessionModule.verifySession);
const mockCreate = jest.mocked(cabinService.createCabin);
const mockEdit = jest.mocked(cabinService.editCabin);
const mockRemove = jest.mocked(cabinService.removeCabin);

const ownerSession = { uid: 'owner-1', email: 'owner@example.com', role: 'owner' as const };
const adminSession = { uid: 'admin-1', email: 'admin@example.com', role: 'admin' as const };
const userSession = { uid: 'user-1', email: 'user@example.com', role: 'user' as const };

const validInput = {
  title: 'Cabana Test',
  slug: 'cabana-test',
  description: 'O cabana de test cu descriere suficient de lunga.',
  location: 'Munții Apuseni',
  maxGuests: 4,
  pricePerNight: 300,
  amenities: [],
  imageUrls: [],
  published: false,
};

const mockCabin: Cabin = {
  id: 'cabin-1',
  ownerId: 'owner-1',
  ...validInput,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('createCabinAction', () => {
  it('creates a cabin and returns cabinId when session is valid (owner)', async () => {
    mockVerify.mockResolvedValue(ownerSession);
    mockCreate.mockResolvedValue(ok(mockCabin));

    const result = await createCabinAction(validInput);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.cabinId).toBe('cabin-1');
    expect(mockCreate).toHaveBeenCalledWith(validInput, ownerSession);
  });

  it('creates a cabin when session is admin', async () => {
    mockVerify.mockResolvedValue(adminSession);
    mockCreate.mockResolvedValue(ok({ ...mockCabin, ownerId: 'admin-1', id: 'cabin-2' }));

    const result = await createCabinAction(validInput);
    expect(result.ok).toBe(true);
  });

  it('returns error when session is missing', async () => {
    mockVerify.mockResolvedValue(null);

    const result = await createCabinAction(validInput);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/authentication/i);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('returns error when session role is user (not owner/admin)', async () => {
    mockVerify.mockResolvedValue(userSession);

    const result = await createCabinAction(validInput);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/owner/i);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('returns validation error from service', async () => {
    mockVerify.mockResolvedValue(ownerSession);
    mockCreate.mockResolvedValue(
      fail('VALIDATION_ERROR', 'Invalid cabin data.', { title: ['Title is required'] }),
    );

    const result = await createCabinAction(validInput);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('Invalid cabin data.');
      expect(result.details).toEqual({ title: ['Title is required'] });
    }
  });
});

describe('updateCabinAction', () => {
  it('updates a cabin and returns ok', async () => {
    mockVerify.mockResolvedValue(ownerSession);
    mockEdit.mockResolvedValue(ok(undefined));

    const result = await updateCabinAction('cabin-1', { title: 'New Title' });
    expect(result.ok).toBe(true);
    expect(mockEdit).toHaveBeenCalledWith('cabin-1', { title: 'New Title' }, ownerSession);
  });

  it('returns error when session is missing', async () => {
    mockVerify.mockResolvedValue(null);

    const result = await updateCabinAction('cabin-1', { title: 'New Title' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/authentication/i);
    expect(mockEdit).not.toHaveBeenCalled();
  });

  it('returns error when access is denied', async () => {
    mockVerify.mockResolvedValue(ownerSession);
    mockEdit.mockResolvedValue(fail('FORBIDDEN', 'Access denied.'));

    const result = await updateCabinAction('cabin-1', { title: 'New Title' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('Access denied.');
  });

  it('returns error when cabin is not found', async () => {
    mockVerify.mockResolvedValue(ownerSession);
    mockEdit.mockResolvedValue(fail('NOT_FOUND', 'Cabin not found.'));

    const result = await updateCabinAction('nonexistent', { title: 'New Title' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('Cabin not found.');
  });
});

describe('togglePublishAction', () => {
  it('publishes a cabin (published=true)', async () => {
    mockVerify.mockResolvedValue(ownerSession);
    mockEdit.mockResolvedValue(ok(undefined));

    const result = await togglePublishAction('cabin-1', true);
    expect(result.ok).toBe(true);
    expect(mockEdit).toHaveBeenCalledWith('cabin-1', { published: true }, ownerSession);
  });

  it('unpublishes a cabin (published=false)', async () => {
    mockVerify.mockResolvedValue(ownerSession);
    mockEdit.mockResolvedValue(ok(undefined));

    const result = await togglePublishAction('cabin-1', false);
    expect(result.ok).toBe(true);
    expect(mockEdit).toHaveBeenCalledWith('cabin-1', { published: false }, ownerSession);
  });

  it('returns error when session is missing', async () => {
    mockVerify.mockResolvedValue(null);

    const result = await togglePublishAction('cabin-1', true);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/authentication/i);
    expect(mockEdit).not.toHaveBeenCalled();
  });

  it('returns error when access is denied', async () => {
    mockVerify.mockResolvedValue(ownerSession);
    mockEdit.mockResolvedValue(fail('FORBIDDEN', 'Access denied.'));

    const result = await togglePublishAction('cabin-1', true);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('Access denied.');
  });
});

describe('deleteCabinAction', () => {
  it('deletes a cabin and returns ok', async () => {
    mockVerify.mockResolvedValue(ownerSession);
    mockRemove.mockResolvedValue(ok(undefined));

    const result = await deleteCabinAction('cabin-1');
    expect(result.ok).toBe(true);
    expect(mockRemove).toHaveBeenCalledWith('cabin-1', ownerSession);
  });

  it('returns error when session is missing', async () => {
    mockVerify.mockResolvedValue(null);

    const result = await deleteCabinAction('cabin-1');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/authentication/i);
    expect(mockRemove).not.toHaveBeenCalled();
  });

  it('returns error when access is denied', async () => {
    mockVerify.mockResolvedValue(ownerSession);
    mockRemove.mockResolvedValue(fail('FORBIDDEN', 'Access denied.'));

    const result = await deleteCabinAction('cabin-1');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('Access denied.');
  });

  it('returns error when cabin is not found', async () => {
    mockVerify.mockResolvedValue(ownerSession);
    mockRemove.mockResolvedValue(fail('NOT_FOUND', 'Cabin not found.'));

    const result = await deleteCabinAction('nonexistent');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('Cabin not found.');
  });

  it('allows admin to delete any cabin', async () => {
    mockVerify.mockResolvedValue(adminSession);
    mockRemove.mockResolvedValue(ok(undefined));

    const result = await deleteCabinAction('cabin-1');
    expect(result.ok).toBe(true);
    expect(mockRemove).toHaveBeenCalledWith('cabin-1', adminSession);
  });
});
