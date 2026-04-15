'use server';

/**
 * modules/bookings/actions.ts
 * Server Actions for booking operations.
 * Used by client components (BookingForm, CancelBookingButton).
 */
import { verifySession } from '@/lib/auth/session';
import {
  createBooking,
  cancelBooking,
} from '@/modules/bookings/application/bookingService';
import { revalidatePath } from 'next/cache';

export interface CreateBookingInput {
  cabinId: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  notes?: string;
}

export type CreateBookingResult =
  | { ok: true; bookingId: string }
  | { ok: false; error: string; details?: Record<string, string[]> };

export type CancelBookingResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Creates a booking. Requires an authenticated session.
 * Returns a typed result instead of throwing so the client can handle errors gracefully.
 */
export async function createBookingAction(
  input: CreateBookingInput,
): Promise<CreateBookingResult> {
  const session = await verifySession();
  if (!session) {
    return { ok: false, error: 'Authentication required.' };
  }

  const result = await createBooking(input, session);
  if (!result.ok) {
    return {
      ok: false,
      error: result.error.message,
      details: result.error.details,
    };
  }

  revalidatePath('/dashboard/bookings');
  return { ok: true, bookingId: result.data.id };
}

/**
 * Cancels a booking owned by the current user (or admin).
 * Revalidates the bookings list on success.
 */
export async function cancelBookingAction(
  bookingId: string,
): Promise<CancelBookingResult> {
  const session = await verifySession();
  if (!session) {
    return { ok: false, error: 'Authentication required.' };
  }

  const result = await cancelBooking(bookingId, session);
  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  revalidatePath('/dashboard/bookings');
  return { ok: true };
}
