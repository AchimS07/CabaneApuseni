/**
 * modules/bookings/domain/types.ts
 */
import type { CabinSnapshot } from '@/modules/cabins/domain/types';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  userId: string;
  /** Denormalized cabin snapshot to avoid extra reads on booking lists. */
  cabin: CabinSnapshot;
  checkIn: string;   // YYYY-MM-DD
  checkOut: string;  // YYYY-MM-DD
  guestCount: number;
  status: BookingStatus;
  totalPrice: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
