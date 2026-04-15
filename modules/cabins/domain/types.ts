/**
 * modules/cabins/domain/types.ts
 */

export interface Cabin {
  id: string;
  /** UID of the owner who created this listing. Optional for legacy/seeded cabins. */
  ownerId?: string;
  title: string;
  slug: string;
  description: string;
  location: string;
  maxGuests: number;
  pricePerNight: number;
  amenities: string[];
  imageUrls: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Snapshot stored inside a booking document to avoid extra reads. */
export interface CabinSnapshot {
  id: string;
  title: string;
  slug: string;
  pricePerNight: number;
}
