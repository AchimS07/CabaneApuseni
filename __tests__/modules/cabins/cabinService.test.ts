/**
 * Unit tests for cabinService domain logic.
 * Repositories are mocked — no real Firestore connections.
 */
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

jest.mock('@/modules/cabins/infrastructure/firestoreCabinRepository');
jest.mock('@/lib/observability/logger', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn() }),
}));

import * as cabinRepo from '@/modules/cabins/infrastructure/firestoreCabinRepository';
import {
  createCabin,
  editCabin,
  removeCabin,
  getOwnerCabins,
  getPublishedCabins,
  getAllCabins,
  getCabinDetail,
} from '@/modules/cabins/application/cabinService';
import { MOCK_CABINS } from '@/modules/cabins/application/mockCabins';
import type { SessionUser } from '@/lib/auth/session';
import type { Cabin } from '@/modules/cabins/domain/types';

const ownerSession: SessionUser = { uid: 'owner-1', email: 'owner@example.com', role: 'owner' };
const adminSession: SessionUser = { uid: 'admin-1', email: 'admin@example.com', role: 'admin' };
const otherSession: SessionUser = { uid: 'other-1', email: 'other@example.com', role: 'owner' };

const mockCabin: Cabin = {
  id: 'cabin-1',
  ownerId: 'owner-1',
  title: 'Cabana Test',
  slug: 'cabana-test',
  description: 'O cabana de test cu descriere suficient de lunga.',
  location: 'Munții Apuseni',
  maxGuests: 4,
  pricePerNight: 300,
  amenities: [],
  imageUrls: [],
  published: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

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

beforeEach(() => {
  jest.clearAllMocks();
});

describe('createCabin', () => {
  it('creates a cabin and sets ownerId from actor', async () => {
    jest.mocked(cabinRepo.saveCabin).mockResolvedValue(undefined);

    const result = await createCabin(validInput, ownerSession);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.ownerId).toBe('owner-1');
      expect(result.data.title).toBe(validInput.title);
    }
    expect(cabinRepo.saveCabin).toHaveBeenCalledTimes(1);
    const [, savedData] = jest.mocked(cabinRepo.saveCabin).mock.calls[0]!;
    expect(savedData.ownerId).toBe('owner-1');
  });

  it('returns VALIDATION_ERROR for invalid input', async () => {
    const result = await createCabin({ ...validInput, title: 'AB' }, ownerSession);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('editCabin', () => {
  it('allows owner to edit their own cabin', async () => {
    jest.mocked(cabinRepo.getCabinById).mockResolvedValue(mockCabin);
    jest.mocked(cabinRepo.updateCabin).mockResolvedValue(undefined);

    const result = await editCabin('cabin-1', { title: 'New Title' }, ownerSession);

    expect(result.ok).toBe(true);
    expect(cabinRepo.updateCabin).toHaveBeenCalledWith('cabin-1', { title: 'New Title' });
  });

  it('allows admin to edit any cabin', async () => {
    jest.mocked(cabinRepo.getCabinById).mockResolvedValue(mockCabin);
    jest.mocked(cabinRepo.updateCabin).mockResolvedValue(undefined);

    const result = await editCabin('cabin-1', { title: 'New Title' }, adminSession);
    expect(result.ok).toBe(true);
  });

  it('rejects edit when user does not own the cabin', async () => {
    jest.mocked(cabinRepo.getCabinById).mockResolvedValue(mockCabin);

    const result = await editCabin('cabin-1', { title: 'New Title' }, otherSession);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('FORBIDDEN');
  });

  it('returns NOT_FOUND when cabin does not exist', async () => {
    jest.mocked(cabinRepo.getCabinById).mockResolvedValue(null);

    const result = await editCabin('nonexistent', { title: 'New Title' }, ownerSession);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NOT_FOUND');
  });
});

describe('removeCabin', () => {
  it('allows owner to remove their own cabin', async () => {
    jest.mocked(cabinRepo.getCabinById).mockResolvedValue(mockCabin);
    jest.mocked(cabinRepo.deleteCabin).mockResolvedValue(undefined);

    const result = await removeCabin('cabin-1', ownerSession);
    expect(result.ok).toBe(true);
    expect(cabinRepo.deleteCabin).toHaveBeenCalledWith('cabin-1');
  });

  it('rejects removal by a different owner', async () => {
    jest.mocked(cabinRepo.getCabinById).mockResolvedValue(mockCabin);

    const result = await removeCabin('cabin-1', otherSession);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('FORBIDDEN');
  });
});

describe('getOwnerCabins', () => {
  it('returns cabins for the given owner', async () => {
    jest.mocked(cabinRepo.listCabinsByOwner).mockResolvedValue([mockCabin]);

    const result = await getOwnerCabins('owner-1');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toHaveLength(1);
      expect(result.data[0]!.ownerId).toBe('owner-1');
    }
    expect(cabinRepo.listCabinsByOwner).toHaveBeenCalledWith('owner-1');
  });

  it('returns empty array when owner has no cabins', async () => {
    jest.mocked(cabinRepo.listCabinsByOwner).mockResolvedValue([]);

    const result = await getOwnerCabins('owner-1');

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toHaveLength(0);
  });
});

describe('getPublishedCabins', () => {
  it('returns published cabins from Firestore when available', async () => {
    jest.mocked(cabinRepo.listPublishedCabins).mockResolvedValue([mockCabin]);

    const result = await getPublishedCabins();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toHaveLength(1);
      expect(result.data[0]!.id).toBe('cabin-1');
    }
  });

  it('falls back to MOCK_CABINS when Firestore throws', async () => {
    jest.mocked(cabinRepo.listPublishedCabins).mockRejectedValue(new Error('Firestore unavailable'));

    const result = await getPublishedCabins();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual(MOCK_CABINS);
      expect(result.data.length).toBeGreaterThan(0);
    }
  });

  it('falls back to MOCK_CABINS when Firestore returns empty list', async () => {
    jest.mocked(cabinRepo.listPublishedCabins).mockResolvedValue([]);

    const result = await getPublishedCabins();

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toEqual(MOCK_CABINS);
  });
});

describe('getAllCabins', () => {
  it('returns all cabins from Firestore', async () => {
    jest.mocked(cabinRepo.listAllCabins).mockResolvedValue([mockCabin]);

    const result = await getAllCabins();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toHaveLength(1);
      expect(result.data[0]!.id).toBe('cabin-1');
    }
  });

  it('returns an empty array when no cabins exist', async () => {
    jest.mocked(cabinRepo.listAllCabins).mockResolvedValue([]);

    const result = await getAllCabins();
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toHaveLength(0);
  });

  it('returns INTERNAL_ERROR when Firestore throws', async () => {
    jest.mocked(cabinRepo.listAllCabins).mockRejectedValue(new Error('Firestore error'));

    const result = await getAllCabins();
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('getCabinDetail', () => {
  it('returns the cabin when found in Firestore', async () => {
    jest.mocked(cabinRepo.getCabinBySlug).mockResolvedValue(mockCabin);

    const result = await getCabinDetail('cabana-test');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.slug).toBe('cabana-test');
  });

  it('falls back to MOCK_CABINS when Firestore returns null for a known slug', async () => {
    jest.mocked(cabinRepo.getCabinBySlug).mockResolvedValue(null);

    const mockSlug = MOCK_CABINS[0]!.slug;
    const result = await getCabinDetail(mockSlug);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.slug).toBe(mockSlug);
  });

  it('returns NOT_FOUND when cabin does not exist in Firestore or mock data', async () => {
    jest.mocked(cabinRepo.getCabinBySlug).mockResolvedValue(null);

    const result = await getCabinDetail('nonexistent-cabin-xyz');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NOT_FOUND');
  });

  it('falls back to MOCK_CABINS when Firestore throws but slug exists in mocks', async () => {
    jest.mocked(cabinRepo.getCabinBySlug).mockRejectedValue(new Error('Firestore error'));

    // Use a slug guaranteed to be in MOCK_CABINS
    const mockSlug = MOCK_CABINS[0]!.slug;
    const result = await getCabinDetail(mockSlug);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.slug).toBe(mockSlug);
  });

  it('returns INTERNAL_ERROR when Firestore throws and slug is not in mocks', async () => {
    jest.mocked(cabinRepo.getCabinBySlug).mockRejectedValue(new Error('Firestore error'));

    const result = await getCabinDetail('nonexistent-cabin-xyz');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('removeCabin — NOT_FOUND', () => {
  it('returns NOT_FOUND when cabin does not exist', async () => {
    jest.mocked(cabinRepo.getCabinById).mockResolvedValue(null);

    const result = await removeCabin('nonexistent', ownerSession);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NOT_FOUND');
  });
});

describe('getOwnerCabins — error handling', () => {
  it('returns INTERNAL_ERROR when Firestore throws', async () => {
    jest.mocked(cabinRepo.listCabinsByOwner).mockRejectedValue(new Error('Firestore error'));

    const result = await getOwnerCabins('owner-1');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('createCabin — error handling', () => {
  it('returns INTERNAL_ERROR when saveCabin throws', async () => {
    jest.mocked(cabinRepo.saveCabin).mockRejectedValue(new Error('Firestore write failed'));

    const result = await createCabin(validInput, ownerSession);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('INTERNAL_ERROR');
  });
});
