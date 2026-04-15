/**
 * modules/bookings/application/bookingService.ts
 */
import { ok, fail, type Result } from '@/lib/result';
import { bookingSchema, type BookingInput } from '@/lib/validation/schemas';
import {
  getBookingById,
  listBookingsByUser,
  listBookingsByCabinIds,
  listAllBookings,
  saveBooking,
  updateBookingStatus,
  listOverlappingBookings,
} from '@/modules/bookings/infrastructure/firestoreBookingRepository';
import { getCabinById } from '@/modules/cabins/infrastructure/firestoreCabinRepository';
import { listCabinsByOwner } from '@/modules/cabins/infrastructure/firestoreCabinRepository';
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
  if (nights < 1) return fail('VALIDATION_ERROR', 'Check-out trebuie să fie cu cel puțin 1 noapte după check-in.');

  // Conflict check: ensure no overlapping active bookings for this cabin
  const overlapping = await listOverlappingBookings(
    parsed.data.cabinId,
    parsed.data.checkIn,
    parsed.data.checkOut,
  );
  if (overlapping.length > 0) {
    return fail('CONFLICT', 'Cabana nu este disponibilă în perioada selectată. Te rugăm să alegi alte date.');
  }

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

export async function getOwnerBookings(actor: SessionUser): Promise<Result<Booking[]>> {
  try {
    const ownedCabins = await listCabinsByOwner(actor.uid);
    const cabinIds = ownedCabins.map((c) => c.id);
    const bookings = await listBookingsByCabinIds(cabinIds);
    return ok(bookings);
  } catch (error) {
    log.error({ error, actorUid: actor.uid }, 'Failed to load owner bookings');
    return fail('INTERNAL_ERROR', 'Failed to load bookings.');
  }
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
  if (actor.role !== 'admin') return fail('FORBIDDEN', 'Access denied.');

  const booking = await getBookingById(id);
  if (!booking) return fail('NOT_FOUND', 'Booking not found.');

  await updateBookingStatus(id, 'confirmed');
  log.info({ id, actorUid: actor.uid }, 'Booking confirmed');
  return ok(undefined);
}

/**
 * Owner confirms a pending booking for one of their cabins.
 */
export async function confirmBookingForOwner(id: string, actor: SessionUser): Promise<Result<void>> {
  const booking = await getBookingById(id);
  if (!booking) return fail('NOT_FOUND', 'Booking not found.');
  if (booking.status !== 'pending') return fail('CONFLICT', 'Only pending bookings can be confirmed.');

  const cabin = await getCabinById(booking.cabin.id);
  if (!cabin) return fail('NOT_FOUND', 'Cabin not found.');
  if (actor.role !== 'admin' && cabin.ownerId !== actor.uid) {
    return fail('FORBIDDEN', 'Access denied.');
  }

  await updateBookingStatus(id, 'confirmed');
  log.info({ id, actorUid: actor.uid }, 'Booking confirmed by owner');
  return ok(undefined);
}

/**
 * Owner rejects (cancels) a pending booking for one of their cabins.
 */
export async function rejectBookingForOwner(id: string, actor: SessionUser): Promise<Result<void>> {
  const booking = await getBookingById(id);
  if (!booking) return fail('NOT_FOUND', 'Booking not found.');
  if (booking.status !== 'pending') return fail('CONFLICT', 'Only pending bookings can be rejected.');

  const cabin = await getCabinById(booking.cabin.id);
  if (!cabin) return fail('NOT_FOUND', 'Cabin not found.');
  if (actor.role !== 'admin' && cabin.ownerId !== actor.uid) {
    return fail('FORBIDDEN', 'Access denied.');
  }

  await updateBookingStatus(id, 'cancelled');
  log.info({ id, actorUid: actor.uid }, 'Booking rejected by owner');
  return ok(undefined);
}
