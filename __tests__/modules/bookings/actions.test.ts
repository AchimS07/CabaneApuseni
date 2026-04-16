/**
 * Unit tests for modules/bookings/actions.ts server actions.
 * verifySession and booking service functions are mocked.
 */
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

jest.mock('@/lib/auth/session', () => ({
  verifySession: jest.fn(),
}));
jest.mock('@/modules/bookings/application/bookingService', () => ({
  createBooking: jest.fn(),
  cancelBooking: jest.fn(),
  confirmBookingForOwner: jest.fn(),
  rejectBookingForOwner: jest.fn(),
}));
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

import * as sessionModule from '@/lib/auth/session';
import * as bookingService from '@/modules/bookings/application/bookingService';
import {
  createBookingAction,
  cancelBookingAction,
  confirmBookingAction,
  rejectBookingAction,
} from '@/modules/bookings/actions';
import { ok, fail } from '@/lib/result';
import type { Booking } from '@/modules/bookings/domain/types';

const mockVerify = jest.mocked(sessionModule.verifySession);
const mockCreate = jest.mocked(bookingService.createBooking);
const mockCancel = jest.mocked(bookingService.cancelBooking);
const mockConfirm = jest.mocked(bookingService.confirmBookingForOwner);
const mockReject = jest.mocked(bookingService.rejectBookingForOwner);

const userSession = { uid: 'user-1', email: 'user@example.com', role: 'user' as const };
const ownerSession = { uid: 'owner-1', email: 'owner@example.com', role: 'owner' as const };

const bookingInput = {
  cabinId: 'cabin-1',
  checkIn: '2030-07-10',
  checkOut: '2030-07-13',
  guestCount: 2,
};

const mockBooking: Booking = {
  id: 'bk-1',
  userId: 'user-1',
  cabin: { id: 'cabin-1', title: 'Test Cabin', slug: 'test-cabin', pricePerNight: 300 },
  checkIn: '2030-07-10',
  checkOut: '2030-07-13',
  guestCount: 2,
  status: 'pending',
  totalPrice: 900,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('createBookingAction', () => {
  it('returns ok with bookingId when booking is created successfully', async () => {
    mockVerify.mockResolvedValue(userSession);
    mockCreate.mockResolvedValue(ok(mockBooking));

    const result = await createBookingAction(bookingInput);

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.bookingId).toBe('bk-1');
    expect(mockCreate).toHaveBeenCalledWith(bookingInput, userSession);
  });

  it('returns error when session is missing', async () => {
    mockVerify.mockResolvedValue(null);

    const result = await createBookingAction(bookingInput);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/authentication/i);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('returns error when the booking service fails', async () => {
    mockVerify.mockResolvedValue(userSession);
    mockCreate.mockResolvedValue(fail('UNAVAILABLE', 'Cabin not available.'));

    const result = await createBookingAction(bookingInput);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('Cabin not available.');
  });
});

describe('cancelBookingAction', () => {
  it('cancels a booking and returns ok', async () => {
    mockVerify.mockResolvedValue(userSession);
    mockCancel.mockResolvedValue(ok(undefined));

    const result = await cancelBookingAction('bk-1');

    expect(result.ok).toBe(true);
    expect(mockCancel).toHaveBeenCalledWith('bk-1', userSession);
  });

  it('returns error when session is missing', async () => {
    mockVerify.mockResolvedValue(null);

    const result = await cancelBookingAction('bk-1');

    expect(result.ok).toBe(false);
    expect(mockCancel).not.toHaveBeenCalled();
  });

  it('returns error when cancel is denied (FORBIDDEN)', async () => {
    mockVerify.mockResolvedValue(userSession);
    mockCancel.mockResolvedValue(fail('FORBIDDEN', 'Access denied.'));

    const result = await cancelBookingAction('bk-1');

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('Access denied.');
  });
});

describe('confirmBookingAction (owner)', () => {
  it('confirms a booking for the cabin owner', async () => {
    mockVerify.mockResolvedValue(ownerSession);
    mockConfirm.mockResolvedValue(ok(undefined));

    const result = await confirmBookingAction('bk-1');

    expect(result.ok).toBe(true);
    expect(mockConfirm).toHaveBeenCalledWith('bk-1', ownerSession);
  });

  it('returns error when session is missing', async () => {
    mockVerify.mockResolvedValue(null);

    const result = await confirmBookingAction('bk-1');

    expect(result.ok).toBe(false);
    expect(mockConfirm).not.toHaveBeenCalled();
  });

  it('returns error when actor does not own the cabin', async () => {
    mockVerify.mockResolvedValue(ownerSession);
    mockConfirm.mockResolvedValue(fail('FORBIDDEN', 'Access denied.'));

    const result = await confirmBookingAction('bk-1');

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('Access denied.');
  });
});

describe('rejectBookingAction (owner)', () => {
  it('rejects a booking for the cabin owner', async () => {
    mockVerify.mockResolvedValue(ownerSession);
    mockReject.mockResolvedValue(ok(undefined));

    const result = await rejectBookingAction('bk-2');

    expect(result.ok).toBe(true);
    expect(mockReject).toHaveBeenCalledWith('bk-2', ownerSession);
  });

  it('returns error when booking is not in pending state', async () => {
    mockVerify.mockResolvedValue(ownerSession);
    mockReject.mockResolvedValue(fail('CONFLICT', 'Only pending bookings can be rejected.'));

    const result = await rejectBookingAction('bk-2');

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('Only pending bookings can be rejected.');
  });
});
