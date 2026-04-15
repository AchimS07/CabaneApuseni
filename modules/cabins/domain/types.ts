/**
 * modules/cabins/domain/types.ts
 */

export interface Cabin {
  id: string;
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
