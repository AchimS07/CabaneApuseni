'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Cabin } from '@/modules/cabins/domain/types';
import { AvailableCabinsMap } from './AvailableCabinsMap';
import { useTranslations } from 'next-intl';

type View = 'list' | 'map';

interface Props {
  cabins: Cabin[];
}

export function CabinsViewSwitcher({ cabins }: Props) {
  const [view, setView] = useState<View>('list');
  const [search, setSearch] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minGuests, setMinGuests] = useState('');
  const t = useTranslations('cabinsList');

  const maxPriceInCabins = useMemo(
    () => Math.max(...cabins.map((c) => c.pricePerNight), 0),
    [cabins],
  );

  const filtered = useMemo(() => {
    return cabins.filter((c) => {
      const q = search.trim().toLowerCase();
      if (q && !c.title.toLowerCase().includes(q) && !c.location.toLowerCase().includes(q)) {
        return false;
      }
      if (maxPrice && c.pricePerNight > Number(maxPrice)) return false;
      if (minGuests && c.maxGuests < Number(minGuests)) return false;
      return true;
    });
  }, [cabins, search, maxPrice, minGuests]);

  const hasFilters = search || maxPrice || minGuests;

  function clearFilters() {
    setSearch('');
    setMaxPrice('');
    setMinGuests('');
  }

  return (
    <>
      {/* Filter bar */}
      <div className="mb-6 rounded-xl border bg-gray-50 px-4 py-4">
        <div className="flex flex-wrap items-end gap-3">
          {/* Text search */}
          <div className="flex flex-1 min-w-[160px] flex-col gap-1">
            <label htmlFor="cabin-search" className="text-xs font-medium text-gray-600">
              {t('searchLabel')}
            </label>
            <input
              id="cabin-search"
              type="search"
              placeholder={t('searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Max price */}
          <div className="flex min-w-[120px] flex-col gap-1">
            <label htmlFor="cabin-price" className="text-xs font-medium text-gray-600">
              {t('priceMaxLabel')}
            </label>
            <input
              id="cabin-price"
              type="number"
              min={0}
              max={maxPriceInCabins}
              placeholder={maxPriceInCabins ? String(maxPriceInCabins) : '—'}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Min guests */}
          <div className="flex min-w-[120px] flex-col gap-1">
            <label htmlFor="cabin-guests" className="text-xs font-medium text-gray-600">
              {t('guestsMinLabel')}
            </label>
            <input
              id="cabin-guests"
              type="number"
              min={1}
              max={20}
              placeholder="1"
              value={minGuests}
              onChange={(e) => setMinGuests(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="self-end rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {t('resetFilters')}
            </button>
          )}
        </div>

        {hasFilters && (
          <p className="mt-2 text-xs text-gray-500">
            {filtered.length === 0
              ? t('noFilterResults')
              : filtered.length === 1
              ? t('filteredCountSingular')
              : t('filteredCountPlural', { count: filtered.length })}
          </p>
        )}
      </div>

      {/* View toggle */}
      <div className="mb-6 flex items-center gap-1 rounded-full border border-gray-200 bg-gray-100 p-1 w-fit">
        <button
          type="button"
          onClick={() => setView('list')}
          aria-pressed={view === 'list'}
          className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 ${
            view === 'list'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 5A.75.75 0 012.75 9h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 9.75zm0 5a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z"
              clipRule="evenodd"
            />
          </svg>
          {t('viewList')}
        </button>
        <button
          type="button"
          onClick={() => setView('map')}
          aria-pressed={view === 'map'}
          className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 ${
            view === 'map'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 15.134 17 12.703 17 9A7 7 0 103 9c0 3.703 1.698 6.134 3.354 7.585.83.799 1.654 1.38 2.274 1.765a11.87 11.87 0 00.757.433 6.884 6.884 0 00.299.148l.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z"
              clipRule="evenodd"
            />
          </svg>
          {t('viewMap')}
        </button>
      </div>

      {/* Map view */}
      {view === 'map' && <AvailableCabinsMap cabins={filtered} />}

      {/* List view */}
      {view === 'list' && (
        <>
          {filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-500">
              {t('noFilterResults')}{' '}
              <button
                type="button"
                onClick={clearFilters}
                className="font-medium text-indigo-600 hover:underline"
              >
                {t('resetFiltersLink')}
              </button>
            </p>
          ) : (
            <ul
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              aria-label={t('listAriaLabel')}
            >
              {filtered.map((cabin) => (
                <li key={cabin.id}>
                  <Link
                    href={`/cabins/${cabin.slug}`}
                    className="group block overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    aria-label={`${cabin.title}, ${cabin.location}, ${cabin.pricePerNight} RON ${t('perNight')}`}
                  >
                    {cabin.imageUrls[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cabin.imageUrls[0]}
                        alt=""
                        aria-hidden="true"
                        className="h-48 w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className="flex h-48 items-center justify-center bg-indigo-50 text-5xl"
                        aria-hidden="true"
                      >
                        🏔️
                      </div>
                    )}
                    <div className="p-4">
                      <h2 className="font-semibold text-gray-900 group-hover:text-indigo-700">
                        {cabin.title}
                      </h2>
                      <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                        <span aria-hidden="true">📍</span>
                        {cabin.location}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <p className="font-semibold text-indigo-700">
                          {cabin.pricePerNight}{' '}
                          <span className="text-xs font-normal text-gray-500">RON {t('perNight')}</span>
                        </p>
                        <span className="text-xs text-gray-400">
                          👥 max {cabin.maxGuests}
                        </span>
                      </div>
                      <span className="mt-3 inline-block text-sm font-medium text-indigo-600 group-hover:underline">
                        {t('viewDetails')}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </>
  );
}
