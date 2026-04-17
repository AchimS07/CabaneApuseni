'use client';

/**
 * app/components/CabinsView.tsx
 * Client-side view for the cabins listing page.
 * Receives pre-fetched cabins from the server component and handles:
 *  - Category filter bar
 *  - URL-based search param filtering (location, guests, price)
 *  - Grid / Map view toggle
 *  - Filter modal (price range, min guests, amenities)
 *  - Active filter pills
 */

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import CabinCard from '@/components/CabinCard';
import { AvailableCabinsMap } from '@/app/components/AvailableCabinsMap';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Cabin } from '@/modules/cabins/domain/types';
import {
  SlidersIcon,
  GridIcon,
  MapIcon,
  XIcon,
  MountainIcon,
  TreesIcon,
  WavesIcon,
  HomeIcon,
  PawIcon,
  FlameIcon,
} from '@/components/ui/Icons';

// ─── Categories ───────────────────────────────────────────────────────────────

type CategoryId = 'toate' | 'munte' | 'padure' | 'lac' | 'izolat' | 'animale' | 'foc';

const CATEGORY_IDS: { id: CategoryId; Icon: React.ComponentType<{ size?: number; className?: string }> | null }[] = [
  { id: 'toate', Icon: null },
  { id: 'munte', Icon: MountainIcon },
  { id: 'padure', Icon: TreesIcon },
  { id: 'lac', Icon: WavesIcon },
  { id: 'izolat', Icon: HomeIcon },
  { id: 'animale', Icon: PawIcon },
  { id: 'foc', Icon: FlameIcon },
] as const;

// ─── Filter state ─────────────────────────────────────────────────────────────

interface FilterState {
  minPrice: number;
  maxPrice: number;
  minGuests: number;
  amenities: string[];
}

const DEFAULT_FILTERS: FilterState = {
  minPrice: 0,
  maxPrice: 2000,
  minGuests: 1,
  amenities: [],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function collectAmenities(cabins: Cabin[]): string[] {
  const set = new Set<string>();
  cabins.forEach((c) => c.amenities.forEach((a) => set.add(a)));
  return Array.from(set).sort();
}

function filterCabins(
  cabins: Cabin[],
  {
    location,
    guests,
    filters,
  }: { location: string; guests: number; filters: FilterState },
): Cabin[] {
  return cabins.filter((c) => {
    if (
      location &&
      !c.location.toLowerCase().includes(location.toLowerCase()) &&
      !c.title.toLowerCase().includes(location.toLowerCase())
    ) {
      return false;
    }
    if (guests > 1 && c.maxGuests < guests) return false;
    if (c.pricePerNight < filters.minPrice) return false;
    if (c.pricePerNight > filters.maxPrice) return false;
    if (filters.minGuests > 1 && c.maxGuests < filters.minGuests) return false;
    if (filters.amenities.length > 0) {
      const hasAll = filters.amenities.every((a) =>
        c.amenities.some((ca) => ca.toLowerCase() === a.toLowerCase()),
      );
      if (!hasAll) return false;
    }
    return true;
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

interface CabinsViewProps {
  initialCabins: Cabin[];
}

export function CabinsView({ initialCabins }: CabinsViewProps) {
  const t = useTranslations('cabinsView');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL-driven filter values
  const locationParam = searchParams.get('location') ?? '';
  const guestsParam = Number(searchParams.get('guests') ?? 1);

  // Local UI state
  const [category, setCategory] = useState<CategoryId>('toate');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const modalRef = useRef<HTMLDialogElement>(null);

  // Open / close modal
  useEffect(() => {
    const dialog = modalRef.current;
    if (!dialog) return;
    if (filterModalOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [filterModalOpen]);

  // Close on backdrop click
  function handleDialogClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === modalRef.current) setFilterModalOpen(false);
  }

  // Close on Escape
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setFilterModalOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const allAmenities = useMemo(() => collectAmenities(initialCabins), [initialCabins]);

  const filteredCabins = useMemo(
    () =>
      filterCabins(initialCabins, {
        location: locationParam,
        guests: guestsParam,
        filters,
      }),
    [initialCabins, locationParam, guestsParam, filters],
  );

  // Build active filter pills for easy removal
  const activePills: { label: string; onRemove: () => void }[] = [];

  if (locationParam) {
    activePills.push({
      label: t('pillLocation', { value: locationParam }),
      onRemove: () => {
        const p = new URLSearchParams(searchParams.toString());
        p.delete('location');
        router.push(`${pathname}?${p}`);
      },
    });
  }
  if (guestsParam > 1) {
    activePills.push({
      label: t('pillMinGuests', { count: guestsParam }),
      onRemove: () => {
        const p = new URLSearchParams(searchParams.toString());
        p.delete('guests');
        router.push(`${pathname}?${p}`);
      },
    });
  }
  if (filters.minPrice > DEFAULT_FILTERS.minPrice) {
    activePills.push({
      label: t('pillMinPrice', { price: filters.minPrice }),
      onRemove: () => setFilters((f) => ({ ...f, minPrice: DEFAULT_FILTERS.minPrice })),
    });
  }
  if (filters.maxPrice < DEFAULT_FILTERS.maxPrice) {
    activePills.push({
      label: t('pillMaxPrice', { price: filters.maxPrice }),
      onRemove: () => setFilters((f) => ({ ...f, maxPrice: DEFAULT_FILTERS.maxPrice })),
    });
  }
  filters.amenities.forEach((a) => {
    activePills.push({
      label: a,
      onRemove: () =>
        setFilters((f) => ({ ...f, amenities: f.amenities.filter((x) => x !== a) })),
    });
  });

  const hasActiveFilters =
    activePills.length > 0 || filters.minGuests > 1 || category !== 'toate';

  function clearAll() {
    setFilters(DEFAULT_FILTERS);
    setCategory('toate');
    router.push(pathname);
  }

  const toggleAmenity = useCallback((amenity: string) => {
    setFilters((f) => ({
      ...f,
      amenities: f.amenities.includes(amenity)
        ? f.amenities.filter((a) => a !== amenity)
        : [...f.amenities, amenity],
    }));
  }, []);

  return (
    <div>
      {/* ── Category filter bar ── */}
      <div className="sticky top-[80px] z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 py-3">
            {/* Scrollable categories */}
            <div className="scrollbar-thin flex flex-1 items-center gap-2 overflow-x-auto pb-1 pt-1">
              {CATEGORY_IDS.map(({ id, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setCategory(id as CategoryId)}
                  aria-pressed={category === id}
                  className={[
                    'flex shrink-0 flex-col items-center gap-1 pb-2 pt-1 px-3 text-xs font-medium transition',
                    'border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
                    category === id
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                  ].join(' ')}
                >
                  {Icon ? (
                    <Icon size={22} aria-hidden="true" />
                  ) : (
                    <span className="text-xl" aria-hidden="true">✨</span>
                  )}
                  <span>{t(`categories.${id}`)}</span>
                </button>
              ))}
            </div>

            {/* Filter button */}
            <button
              type="button"
              onClick={() => setFilterModalOpen(true)}
              className={[
                'flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
                hasActiveFilters
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400',
              ].join(' ')}
              aria-label={t('openFiltersLabel')}
            >
              <SlidersIcon size={16} aria-hidden="true" />
              {t('filterBtn')}
              {hasActiveFilters && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-gray-900">
                  {activePills.length + (filters.minGuests > 1 ? 1 : 0) + (category !== 'toate' ? 1 : 0)}
                </span>
              )}
            </button>

            {/* View toggle */}
            <div
              className="hidden items-center rounded-xl border border-gray-200 sm:flex"
              role="group"
              aria-label={t('viewToggleLabel')}
            >
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                aria-pressed={viewMode === 'grid'}
                aria-label={t('gridViewLabel')}
                className={[
                  'flex items-center gap-1.5 rounded-l-xl px-3 py-2.5 text-xs font-medium transition',
                  viewMode === 'grid'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-50',
                ].join(' ')}
              >
                <GridIcon size={14} aria-hidden="true" />
                <span className="hidden lg:inline">{t('viewGrid')}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                aria-pressed={viewMode === 'map'}
                aria-label={t('mapViewLabel')}
                className={[
                  'flex items-center gap-1.5 rounded-r-xl px-3 py-2.5 text-xs font-medium transition',
                  viewMode === 'map'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-50',
                ].join(' ')}
              >
                <MapIcon size={14} aria-hidden="true" />
                <span className="hidden lg:inline">{t('viewMap')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Active filter pills */}
        {activePills.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            {activePills.map((pill) => (
              <span
                key={pill.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700"
              >
                {pill.label}
                <button
                  type="button"
                  onClick={pill.onRemove}
                  aria-label={t('removePillLabel', { label: pill.label })}
                  className="flex h-4 w-4 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                >
                  <XIcon size={10} aria-hidden="true" />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={clearAll}
              className="text-sm font-medium text-gray-900 underline transition hover:no-underline"
            >
              {t('clearAll')}
            </button>
          </div>
        )}

        {/* Result count */}
        <p className="mb-6 text-sm font-medium text-gray-500" aria-live="polite">
          {filteredCabins.length === 0
            ? t('noResults')
            : filteredCabins.length === 1
            ? t('countSingular')
            : t('countPlural', { count: filteredCabins.length })}
        </p>

        {viewMode === 'map' && filteredCabins.length > 0 && (
          <AvailableCabinsMap cabins={filteredCabins} />
        )}

        {filteredCabins.length === 0 ? (
          <EmptyState
            icon="🏔️"
            title={t('emptyTitle')}
            description={t('emptyDescription')}
            action={
              hasActiveFilters
                ? { label: t('clearFilters'), onClick: clearAll }
                : undefined
            }
          />
        ) : (
          <ul
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            aria-label={t('listAriaLabel')}
          >
            {filteredCabins.map((cabin) => (
              <li key={cabin.id}>
                <CabinCard cabin={cabin} />
              </li>
            ))}
          </ul>
        )}
      </main>

      {/* ── Filter modal ── */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-noninteractive-element-interactions */}
      <dialog
        ref={modalRef}
        onClick={handleDialogClick}
        onClose={() => setFilterModalOpen(false)}
        aria-label={t('filterPanelLabel')}
        className="m-auto w-full max-w-lg rounded-2xl border-0 p-0 shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-sm"
      >
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2 className="text-base font-semibold text-gray-900">{t('filterHeading')}</h2>
            <button
              type="button"
              onClick={() => setFilterModalOpen(false)}
              aria-label={t('closeFiltersLabel')}
              className="rounded-full p-1.5 text-gray-500 transition hover:bg-gray-100"
            >
              <XIcon size={18} aria-hidden="true" />
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto px-6 py-5" style={{ maxHeight: '70vh' }}>
            {/* Price range */}
            <section aria-labelledby="price-heading" className="mb-8">
              <h3 id="price-heading" className="mb-4 text-sm font-semibold text-gray-900">
                {t('priceHeading')}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs text-gray-500">{t('priceMin')}</span>
                  <input
                    type="number"
                    min={0}
                    max={filters.maxPrice}
                    value={filters.minPrice}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, minPrice: Number(e.target.value) }))
                    }
                    className="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs text-gray-500">{t('priceMax')}</span>
                  <input
                    type="number"
                    min={filters.minPrice}
                    max={9999}
                    value={filters.maxPrice}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, maxPrice: Number(e.target.value) }))
                    }
                    className="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </label>
              </div>
            </section>

            {/* Min guests */}
            <section aria-labelledby="guests-heading" className="mb-8">
              <h3 id="guests-heading" className="mb-4 text-sm font-semibold text-gray-900">
                {t('guestsHeading')}
              </h3>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setFilters((f) => ({ ...f, minGuests: Math.max(1, f.minGuests - 1) }))}
                  disabled={filters.minGuests <= 1}
                  aria-label={t('decreaseGuests')}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition hover:border-gray-900 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <span aria-hidden="true" className="text-lg leading-none">−</span>
                </button>
                <span className="w-6 text-center text-sm font-medium" aria-live="polite">
                  {filters.minGuests}
                </span>
                <button
                  type="button"
                  onClick={() => setFilters((f) => ({ ...f, minGuests: Math.min(20, f.minGuests + 1) }))}
                  aria-label={t('increaseGuests')}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition hover:border-gray-900"
                >
                  <span aria-hidden="true" className="text-lg leading-none">+</span>
                </button>
                <span className="ml-2 text-sm text-gray-500">{t('persons')}</span>
              </div>
            </section>

            {/* Amenities */}
            {allAmenities.length > 0 && (
              <section aria-labelledby="amenities-heading">
                <h3 id="amenities-heading" className="mb-4 text-sm font-semibold text-gray-900">
                  {t('amenitiesHeading')}
                </h3>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {allAmenities.map((amenity) => {
                    const checked = filters.amenities.includes(amenity);
                    return (
                      <label
                        key={amenity}
                        className={[
                          'flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm transition',
                          checked
                            ? 'border-gray-900 bg-gray-50 font-medium text-gray-900'
                            : 'border-gray-200 text-gray-600 hover:border-gray-400',
                        ].join(' ')}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleAmenity(amenity)}
                          className="accent-gray-900"
                        />
                        {amenity}
                      </label>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
            <button
              type="button"
              onClick={() => {
                setFilters(DEFAULT_FILTERS);
                setCategory('toate');
              }}
              className="text-sm font-semibold text-gray-900 underline transition hover:no-underline"
            >
              {t('clearAll')}
            </button>
            <button
              type="button"
              onClick={() => setFilterModalOpen(false)}
              className="rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              {t('showResults', {
                count: filteredCabins.length,
                suffix: filteredCabins.length === 1 ? t('resultSingular') : t('resultPlural'),
              })}
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
