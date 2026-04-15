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
import { createBooking, cancelBooking } from '@/modules/bookings/application/bookingService';
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
