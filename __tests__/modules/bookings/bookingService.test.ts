/**
 * Unit tests for bookingService domain logic.
 * Repositories are mocked — no real Firestore connections.
 */
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mock dependencies before importing the module under test
jest.mock('@/modules/bookings/infrastructure/firestoreBookingRepository');
jest.mock('@/modules/cabins/infrastructure/firestoreCabinRepository');
jest.mock('@/lib/observability/logger', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn() }),
}));

import * as bookingRepo from '@/modules/bookings/infrastructure/firestoreBookingRepository';
import * as cabinRepo from '@/modules/cabins/infrastructure/firestoreCabinRepository';
import {
  createBooking,
  cancelBooking,
  confirmBooking,
  confirmBookingForOwner,
  rejectBookingForOwner,
  getUserBookings,
  getAllBookings,
  getOwnerBookings,
} from '@/modules/bookings/application/bookingService';
import type { SessionUser } from '@/lib/auth/session';
import type { Cabin } from '@/modules/cabins/domain/types';

const mockCabin: Cabin = {
  id: 'cabin-1',
  title: 'Cabana Test',
  slug: 'cabana-test',
  description: 'O cabana de test',
  location: 'Munții Apuseni',
  maxGuests: 4,
  pricePerNight: 300,
  amenities: [],
  imageUrls: [],
  published: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockActor: SessionUser = {
  uid: 'user-1',
  email: 'test@example.com',
  role: 'user',
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('createBooking', () => {
  it('returns a booking when input is valid', async () => {
    jest.mocked(cabinRepo.getCabinById).mockResolvedValue(mockCabin);
    jest.mocked(bookingRepo.saveBooking).mockResolvedValue(undefined);

    const result = await createBooking(
      {
        cabinId: 'cabin-1',
        checkIn: '2030-07-10',
        checkOut: '2030-07-13',
        guestCount: 2,
      },
      mockActor,
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.totalPrice).toBe(900); // 3 nights × 300
      expect(result.data.status).toBe('pending');
      expect(result.data.userId).toBe('user-1');
    }
  });

  it('fails when cabin is not published', async () => {
    jest.mocked(cabinRepo.getCabinById).mockResolvedValue({ ...mockCabin, published: false });

    const result = await createBooking(
      { cabinId: 'cabin-1', checkIn: '2030-07-10', checkOut: '2030-07-13', guestCount: 2 },
      mockActor,
    );

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('UNAVAILABLE');
  });

  it('fails when guestCount exceeds maxGuests', async () => {
    jest.mocked(cabinRepo.getCabinById).mockResolvedValue(mockCabin);

    const result = await createBooking(
      { cabinId: 'cabin-1', checkIn: '2030-07-10', checkOut: '2030-07-13', guestCount: 10 },
      mockActor,
    );

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('VALIDATION_ERROR');
  });

  it('fails validation for past check-in date', async () => {
    const result = await createBooking(
      { cabinId: 'cabin-1', checkIn: '2020-01-01', checkOut: '2020-01-03', guestCount: 1 },
      mockActor,
    );

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('VALIDATION_ERROR');
  });

  it('fails with NOT_FOUND when cabin does not exist', async () => {
    jest.mocked(cabinRepo.getCabinById).mockResolvedValue(null);

    const result = await createBooking(
      { cabinId: 'unknown-cabin', checkIn: '2030-07-10', checkOut: '2030-07-13', guestCount: 1 },
      mockActor,
    );

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NOT_FOUND');
  });

  it('fails with VALIDATION_ERROR when check-in and check-out are the same day', async () => {
    jest.mocked(cabinRepo.getCabinById).mockResolvedValue(mockCabin);

    const result = await createBooking(
      { cabinId: 'cabin-1', checkIn: '2030-07-10', checkOut: '2030-07-10', guestCount: 1 },
      mockActor,
    );

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('cancelBooking', () => {
  it('cancels a pending booking owned by the user', async () => {
    jest.mocked(bookingRepo.getBookingById).mockResolvedValue({
      id: 'bk-1',
      userId: 'user-1',
      cabin: { id: 'cabin-1', title: 'Test', slug: 'test', pricePerNight: 300 },
      checkIn: '2030-07-10',
      checkOut: '2030-07-13',
      guestCount: 2,
      status: 'pending',
      totalPrice: 900,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    });
    jest.mocked(bookingRepo.updateBookingStatus).mockResolvedValue(undefined);

    const result = await cancelBooking('bk-1', mockActor);
    expect(result.ok).toBe(true);
  });

  it('rejects cancellation when user does not own the booking', async () => {
    jest.mocked(bookingRepo.getBookingById).mockResolvedValue({
      id: 'bk-1',
      userId: 'other-user',
      cabin: { id: 'cabin-1', title: 'Test', slug: 'test', pricePerNight: 300 },
      checkIn: '2030-07-10',
      checkOut: '2030-07-13',
      guestCount: 2,
      status: 'pending',
      totalPrice: 900,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    });

    const result = await cancelBooking('bk-1', mockActor);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('FORBIDDEN');
  });
});

const ownerActor: SessionUser = { uid: 'owner-1', email: 'owner@example.com', role: 'owner' };
const ownerCabin = {
  id: 'cabin-1',
  ownerId: 'owner-1',
  title: 'Cabana Test',
  slug: 'cabana-test',
  description: 'desc',
  location: 'loc',
  maxGuests: 4,
  pricePerNight: 300,
  amenities: [],
  imageUrls: [],
  published: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};
const pendingBooking = {
  id: 'bk-2',
  userId: 'user-1',
  cabin: { id: 'cabin-1', title: 'Test', slug: 'test', pricePerNight: 300 },
  checkIn: '2030-07-10',
  checkOut: '2030-07-13',
  guestCount: 2,
  status: 'pending' as const,
  totalPrice: 900,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('confirmBookingForOwner', () => {
  it('allows cabin owner to confirm a pending booking', async () => {
    jest.mocked(bookingRepo.getBookingById).mockResolvedValue(pendingBooking);
    jest.mocked(cabinRepo.getCabinById).mockResolvedValue(ownerCabin);
    jest.mocked(bookingRepo.updateBookingStatus).mockResolvedValue(undefined);

    const result = await confirmBookingForOwner('bk-2', ownerActor);
    expect(result.ok).toBe(true);
    expect(bookingRepo.updateBookingStatus).toHaveBeenCalledWith('bk-2', 'confirmed');
  });

  it('rejects confirmation when actor does not own the cabin', async () => {
    jest.mocked(bookingRepo.getBookingById).mockResolvedValue(pendingBooking);
    jest.mocked(cabinRepo.getCabinById).mockResolvedValue({ ...ownerCabin, ownerId: 'other-owner' });

    const result = await confirmBookingForOwner('bk-2', ownerActor);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('FORBIDDEN');
  });

  it('rejects confirmation when booking is not pending', async () => {
    jest.mocked(bookingRepo.getBookingById).mockResolvedValue({ ...pendingBooking, status: 'confirmed' });
    jest.mocked(cabinRepo.getCabinById).mockResolvedValue(ownerCabin);

    const result = await confirmBookingForOwner('bk-2', ownerActor);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('CONFLICT');
  });
});

describe('rejectBookingForOwner', () => {
  it('allows cabin owner to reject a pending booking', async () => {
    jest.mocked(bookingRepo.getBookingById).mockResolvedValue(pendingBooking);
    jest.mocked(cabinRepo.getCabinById).mockResolvedValue(ownerCabin);
    jest.mocked(bookingRepo.updateBookingStatus).mockResolvedValue(undefined);

    const result = await rejectBookingForOwner('bk-2', ownerActor);
    expect(result.ok).toBe(true);
    expect(bookingRepo.updateBookingStatus).toHaveBeenCalledWith('bk-2', 'cancelled');
  });

  it('rejects rejection when actor does not own the cabin', async () => {
    jest.mocked(bookingRepo.getBookingById).mockResolvedValue(pendingBooking);
    jest.mocked(cabinRepo.getCabinById).mockResolvedValue({ ...ownerCabin, ownerId: 'other-owner' });

    const result = await rejectBookingForOwner('bk-2', ownerActor);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('FORBIDDEN');
  });
});

const adminActor: SessionUser = { uid: 'admin-1', email: 'admin@example.com', role: 'admin' };

describe('confirmBooking (admin-only)', () => {
  it('allows admin to confirm any booking', async () => {
    jest.mocked(bookingRepo.getBookingById).mockResolvedValue(pendingBooking);
    jest.mocked(bookingRepo.updateBookingStatus).mockResolvedValue(undefined);

    const result = await confirmBooking('bk-2', adminActor);
    expect(result.ok).toBe(true);
    expect(bookingRepo.updateBookingStatus).toHaveBeenCalledWith('bk-2', 'confirmed');
  });

  it('rejects non-admin actors', async () => {
    const result = await confirmBooking('bk-2', ownerActor);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('FORBIDDEN');
  });

  it('rejects regular users', async () => {
    const result = await confirmBooking('bk-2', mockActor);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('FORBIDDEN');
  });

  it('returns NOT_FOUND when booking does not exist', async () => {
    jest.mocked(bookingRepo.getBookingById).mockResolvedValue(null);

    const result = await confirmBooking('nonexistent', adminActor);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NOT_FOUND');
  });
});

describe('cancelBooking — edge cases', () => {
  it('returns NOT_FOUND when booking does not exist', async () => {
    jest.mocked(bookingRepo.getBookingById).mockResolvedValue(null);

    const result = await cancelBooking('nonexistent', mockActor);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NOT_FOUND');
  });

  it('returns CONFLICT when booking is already cancelled', async () => {
    jest.mocked(bookingRepo.getBookingById).mockResolvedValue({
      ...pendingBooking,
      id: 'bk-3',
      userId: 'user-1',
      status: 'cancelled' as const,
    });

    const result = await cancelBooking('bk-3', mockActor);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('CONFLICT');
  });

  it('allows admin to cancel any booking', async () => {
    jest.mocked(bookingRepo.getBookingById).mockResolvedValue({
      ...pendingBooking,
      id: 'bk-4',
      userId: 'other-user',
    });
    jest.mocked(bookingRepo.updateBookingStatus).mockResolvedValue(undefined);

    const result = await cancelBooking('bk-4', adminActor);
    expect(result.ok).toBe(true);
  });
});

describe('confirmBookingForOwner — edge cases', () => {
  it('returns NOT_FOUND when booking does not exist', async () => {
    jest.mocked(bookingRepo.getBookingById).mockResolvedValue(null);

    const result = await confirmBookingForOwner('nonexistent', ownerActor);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NOT_FOUND');
  });

  it('returns NOT_FOUND when cabin does not exist', async () => {
    jest.mocked(bookingRepo.getBookingById).mockResolvedValue(pendingBooking);
    jest.mocked(cabinRepo.getCabinById).mockResolvedValue(null);

    const result = await confirmBookingForOwner('bk-2', ownerActor);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NOT_FOUND');
  });

  it('allows admin to confirm booking on any cabin', async () => {
    jest.mocked(bookingRepo.getBookingById).mockResolvedValue(pendingBooking);
    jest.mocked(cabinRepo.getCabinById).mockResolvedValue({ ...ownerCabin, ownerId: 'someone-else' });
    jest.mocked(bookingRepo.updateBookingStatus).mockResolvedValue(undefined);

    const result = await confirmBookingForOwner('bk-2', adminActor);
    expect(result.ok).toBe(true);
  });
});

describe('rejectBookingForOwner — edge cases', () => {
  it('returns NOT_FOUND when booking does not exist', async () => {
    jest.mocked(bookingRepo.getBookingById).mockResolvedValue(null);

    const result = await rejectBookingForOwner('nonexistent', ownerActor);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NOT_FOUND');
  });

  it('returns CONFLICT when booking is not in pending state', async () => {
    jest.mocked(bookingRepo.getBookingById).mockResolvedValue({
      ...pendingBooking,
      status: 'confirmed' as const,
    });
    jest.mocked(cabinRepo.getCabinById).mockResolvedValue(ownerCabin);

    const result = await rejectBookingForOwner('bk-2', ownerActor);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('CONFLICT');
  });

  it('returns NOT_FOUND when cabin does not exist', async () => {
    jest.mocked(bookingRepo.getBookingById).mockResolvedValue(pendingBooking);
    jest.mocked(cabinRepo.getCabinById).mockResolvedValue(null);

    const result = await rejectBookingForOwner('bk-2', ownerActor);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NOT_FOUND');
  });

  it('allows admin to reject booking on any cabin', async () => {
    jest.mocked(bookingRepo.getBookingById).mockResolvedValue(pendingBooking);
    jest.mocked(cabinRepo.getCabinById).mockResolvedValue({ ...ownerCabin, ownerId: 'someone-else' });
    jest.mocked(bookingRepo.updateBookingStatus).mockResolvedValue(undefined);

    const result = await rejectBookingForOwner('bk-2', adminActor);
    expect(result.ok).toBe(true);
  });
});

describe('getUserBookings', () => {
  it('returns bookings for the authenticated user', async () => {
    jest.mocked(bookingRepo.listBookingsByUser).mockResolvedValue([pendingBooking]);

    const result = await getUserBookings(mockActor);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toHaveLength(1);
      expect(result.data[0]!.userId).toBe('user-1');
    }
    expect(bookingRepo.listBookingsByUser).toHaveBeenCalledWith('user-1');
  });

  it('returns an empty array when user has no bookings', async () => {
    jest.mocked(bookingRepo.listBookingsByUser).mockResolvedValue([]);

    const result = await getUserBookings(mockActor);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toHaveLength(0);
  });
});

describe('getAllBookings', () => {
  it('returns all bookings', async () => {
    jest.mocked(bookingRepo.listAllBookings).mockResolvedValue([pendingBooking]);

    const result = await getAllBookings();
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toHaveLength(1);
  });

  it('returns an empty array when there are no bookings', async () => {
    jest.mocked(bookingRepo.listAllBookings).mockResolvedValue([]);

    const result = await getAllBookings();
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toHaveLength(0);
  });
});

describe('getOwnerBookings', () => {
  it('returns bookings for all cabins owned by the actor', async () => {
    jest.mocked(cabinRepo.listCabinsByOwner).mockResolvedValue([ownerCabin]);
    jest.mocked(bookingRepo.listBookingsByCabinIds).mockResolvedValue([pendingBooking]);

    const result = await getOwnerBookings(ownerActor);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toHaveLength(1);
    expect(bookingRepo.listBookingsByCabinIds).toHaveBeenCalledWith(['cabin-1']);
  });

  it('returns an empty array when the owner has no cabins', async () => {
    jest.mocked(cabinRepo.listCabinsByOwner).mockResolvedValue([]);
    jest.mocked(bookingRepo.listBookingsByCabinIds).mockResolvedValue([]);

    const result = await getOwnerBookings(ownerActor);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toHaveLength(0);
  });

  it('returns INTERNAL_ERROR when repo throws', async () => {
    jest.mocked(cabinRepo.listCabinsByOwner).mockRejectedValue(new Error('Firestore error'));

    const result = await getOwnerBookings(ownerActor);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('INTERNAL_ERROR');
  });
});
