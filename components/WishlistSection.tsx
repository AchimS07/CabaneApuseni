'use client';

/**
 * components/WishlistSection.tsx
 * Client-side section that shows the user's wishlisted cabins.
 * Can be embedded in any server component page.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/hooks/useAuth';
import { useWishlist } from '@/lib/hooks/useWishlist';
import { getWishlistedCabins } from '@/lib/firestore';
import { fetchCabinById } from '@/lib/serverActions';
import type { Cabin } from '@/modules/cabins/domain/types';
import { WishlistButton } from '@/components/ui/WishlistButton';
import { MapPinIcon } from '@/components/ui/Icons';
import { useTranslations } from 'next-intl';

export function WishlistSection() {
  const t = useTranslations('wishlist');
  const { user, loading: authLoading } = useAuth();
  const { wishlist } = useWishlist();
  const [cabins, setCabins] = useState<Cabin[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setFetching(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setFetching(true);
      try {
        const ids = await getWishlistedCabins(user!.uid);
        const results = await Promise.all(ids.map((id) => fetchCabinById(id)));
        if (!cancelled) {
          setCabins(
            results
              .filter((r) => r.ok)
              .map((r) => (r as { ok: true; data: Cabin }).data),
          );
        }
      } finally {
        if (!cancelled) setFetching(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  // Keep list in sync with real-time wishlist toggle state
  const displayedCabins = cabins.filter((c) => wishlist.has(c.id));

  if (authLoading || fetching) {
    return (
      <div className="mt-10">
        <h2 className="mb-4 text-xl font-bold text-gray-900">{t('heading')}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl bg-gray-100"
              style={{ aspectRatio: '1' }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <section className="mt-10" aria-labelledby="wishlist-heading">
      <div className="mb-4 flex items-center justify-between">
        <h2 id="wishlist-heading" className="text-xl font-bold text-gray-900">
          {t('heading')}
        </h2>
        <Link
          href="/cabins"
          className="text-sm font-medium text-pine-600 underline transition hover:no-underline"
        >
          {t('exploreCabins')}
        </Link>
      </div>

      {displayedCabins.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center">
          <span className="mb-3 text-4xl" aria-hidden="true">🤍</span>
          <p className="text-sm font-medium text-gray-700">{t('empty')}</p>
          <p className="mt-1 text-sm text-gray-500">
            {t('emptyHint')}
          </p>
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {displayedCabins.map((cabin) => (
            <li key={cabin.id}>
              <article className="group cursor-pointer">
                <Link
                  href={`/cabins/${cabin.slug}`}
                  className="block focus-visible:outline-none"
                  aria-label={t('cabinAriaLabel', { title: cabin.title, location: cabin.location })}
                >
                  <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100">
                    {cabin.imageUrls[0] ? (
                      <Image
                        src={cabin.imageUrls[0]}
                        alt={t('photoAlt', { title: cabin.title })}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center text-5xl text-gray-300"
                        aria-hidden="true"
                      >
                        🏔️
                      </div>
                    )}
                    <div className="absolute right-3 top-3">
                      <WishlistButton
                        cabinId={cabin.id}
                        cabinSlug={cabin.slug}
                        iconSize={20}
                      />
                    </div>
                  </div>
                  <div className="mt-2.5">
                    <p className="flex items-center gap-1 text-sm font-medium text-[#222]">
                      <MapPinIcon size={12} className="text-gray-400" aria-hidden="true" />
                      {cabin.location}
                    </p>
                    <p className="mt-0.5 text-sm text-gray-500 line-clamp-1">{cabin.title}</p>
                    <p className="mt-1.5 text-sm">
                      <span className="font-semibold text-[#222]">{cabin.pricePerNight} RON</span>
                      <span className="text-gray-500"> {t('perNight')}</span>
                    </p>
                  </div>
                </Link>
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
