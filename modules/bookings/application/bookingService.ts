/**
 * modules/bookings/application/bookingService.ts
 */
import { ok, fail, type Result } from '@/lib/result';
import { bookingSchema, type BookingInput } from '@/lib/validation/schemas';
import {
  getBookingById,
  listBookingsByUser,
  listAllBookings,
  saveBooking,
  updateBookingStatus,
} from '@/modules/bookings/infrastructure/firestoreBookingRepository';
import { getCabinById } from '@/modules/cabins/infrastructure/firestoreCabinRepository';
import type { Booking } from '@/modules/bookings/domain/types';
import { canAccess } from '@/lib/auth/authorization';
import { createLogger } from '@/lib/observability/logger';
import type { SessionUser } from '@/lib/auth/session';
import { randomUUID } from 'crypto';

const log = createLogger({ module: 'bookingService' });

function calcNights(checkIn: string, checkOut: string): number {
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

export async function createBooking(
  input: BookingInput,
  actor: SessionUser,
): Promise<Result<Booking>> {
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) {
    return fail('VALIDATION_ERROR', 'Invalid booking data.', parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }

  const cabin = await getCabinById(parsed.data.cabinId);
  if (!cabin) return fail('NOT_FOUND', 'Cabin not found.');
  if (!cabin.published) return fail('UNAVAILABLE', 'This cabin is not available for booking.');
  if (parsed.data.guestCount > cabin.maxGuests) {
    return fail('VALIDATION_ERROR', `Max guests for this cabin is ${cabin.maxGuests}.`);
  }

  const nights = calcNights(parsed.data.checkIn, parsed.data.checkOut);
  if (nights < 1) return fail('VALIDATION_ERROR', 'Check-out must be at least 1 night after check-in.');

  const now = new Date().toISOString();
  const id = randomUUID();
  const booking: Booking = {
    id,
    userId: actor.uid,
    cabin: {
      id: cabin.id,
      title: cabin.title,
      slug: cabin.slug,
      pricePerNight: cabin.pricePerNight,
    },
    checkIn: parsed.data.checkIn,
    checkOut: parsed.data.checkOut,
    guestCount: parsed.data.guestCount,
    notes: parsed.data.notes,
    status: 'pending',
    totalPrice: nights * cabin.pricePerNight,
    createdAt: now,
    updatedAt: now,
  };

  await saveBooking(id, { ...booking });
  log.info({ id, userId: actor.uid, cabinId: cabin.id }, 'Booking created');
  return ok(booking);
}

export async function getUserBookings(actor: SessionUser): Promise<Result<Booking[]>> {
  const bookings = await listBookingsByUser(actor.uid);
  return ok(bookings);
}

export async function getAllBookings(): Promise<Result<Booking[]>> {
  const bookings = await listAllBookings();
  return ok(bookings);
}

export async function cancelBooking(id: string, actor: SessionUser): Promise<Result<void>> {
  const booking = await getBookingById(id);
  if (!booking) return fail('NOT_FOUND', 'Booking not found.');
  if (!canAccess(actor, booking.userId)) return fail('FORBIDDEN', 'Access denied.');
  if (booking.status === 'cancelled') return fail('CONFLICT', 'Booking is already cancelled.');

  await updateBookingStatus(id, 'cancelled');
  log.info({ id, actorUid: actor.uid }, 'Booking cancelled');
  return ok(undefined);
}

export async function confirmBooking(id: string, actor: SessionUser): Promise<Result<void>> {
  const booking = await getBookingById(id);
  if (!booking) return fail('NOT_FOUND', 'Booking not found.');

  await updateBookingStatus(id, 'confirmed');
  log.info({ id, actorUid: actor.uid }, 'Booking confirmed');
  return ok(undefined);
}
