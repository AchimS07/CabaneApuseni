'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { type Cabin } from '@/modules/cabins/domain/types';
import { WishlistButton } from '@/components/ui/WishlistButton';
import { ChevronLeftIcon, ChevronRightIcon, StarIcon, MapPinIcon } from '@/components/ui/Icons';

interface Props {
  cabin: Cabin;
}

/** Average rating displayed if no reviews — shows "Nou" */
const PLACEHOLDER_RATING = null;

export default function CabinCard({ cabin }: Props) {
  const photos = cabin.imageUrls;
  const [photoIndex, setPhotoIndex] = useState(0);
  const [hovered, setHovered] = useState(false);

  const prev = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setPhotoIndex((i) => (i - 1 + photos.length) % photos.length);
    },
    [photos.length],
  );

  const next = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setPhotoIndex((i) => (i + 1) % photos.length);
    },
    [photos.length],
  );

  const currentPhoto = photos[photoIndex] ?? '';

  return (
    <article
      className="group cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link
        href={`/cabins/${cabin.slug}`}
        className="block focus-visible:outline-none"
        aria-label={`${cabin.title}, ${cabin.location}, ${cabin.pricePerNight} RON pe noapte`}
      >
        {/* ── Photo section ── */}
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100">
          {currentPhoto ? (
            <Image
              src={currentPhoto}
              alt={`${cabin.title} – fotografie ${photoIndex + 1}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              priority={false}
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center text-6xl text-gray-300"
              aria-hidden="true"
            >
              🏔️
            </div>
          )}

          {/* Wishlist button */}
          <div className="absolute right-3 top-3">
            <WishlistButton
              cabinId={cabin.id}
              cabinSlug={cabin.slug}
              iconSize={22}
            />
          </div>

          {/* Carousel arrows — visible on hover when multiple photos */}
          {photos.length > 1 && hovered && (
            <>
              <button
                type="button"
                onClick={prev}
                aria-label="Fotografie anterioară"
                className="absolute left-2 top-1/2 z-10 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-md transition hover:scale-105 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <ChevronLeftIcon size={14} className="text-gray-700" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Fotografie următoare"
                className="absolute right-2 top-1/2 z-10 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-md transition hover:scale-105 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <ChevronRightIcon size={14} className="text-gray-700" aria-hidden="true" />
              </button>
            </>
          )}

          {/* Dot indicators */}
          {photos.length > 1 && (
            <div
              className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1"
              aria-hidden="true"
            >
              {photos.map((_, i) => (
                <span
                  key={i}
                  className={[
                    'block rounded-full transition-all duration-200',
                    i === photoIndex
                      ? 'h-1.5 w-1.5 bg-white'
                      : 'h-1 w-1 bg-white/60',
                  ].join(' ')}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Info section ── */}
        <div className="mt-3">
          {/* Row 1: location + rating */}
          <div className="flex items-start justify-between gap-2">
            <p className="flex items-center gap-1 text-sm font-medium text-[#222222] truncate">
              <MapPinIcon size={13} className="shrink-0 text-gray-400" aria-hidden="true" />
              {cabin.location}
            </p>
            {PLACEHOLDER_RATING !== null ? (
              <span className="flex shrink-0 items-center gap-0.5 text-sm font-medium text-[#222222]">
                <StarIcon size={12} className="text-[#222222]" aria-hidden="true" />
                {PLACEHOLDER_RATING}
              </span>
            ) : (
              <span className="shrink-0 text-xs text-gray-500">Nou</span>
            )}
          </div>

          {/* Row 2: cabin name */}
          <p className="mt-0.5 line-clamp-1 text-sm text-gray-500">{cabin.title}</p>

          {/* Row 3: amenity highlight */}
          {cabin.amenities.length > 0 && (
            <p className="mt-0.5 line-clamp-1 text-sm text-gray-400">
              {cabin.amenities.slice(0, 2).join(' · ')}
            </p>
          )}

          {/* Row 4: price */}
          <p className="mt-2 text-sm text-[#222222]">
            <span className="font-semibold">{cabin.pricePerNight} RON</span>
            <span className="text-gray-500"> / noapte</span>
          </p>
        </div>
      </Link>
    </article>
  );
}
