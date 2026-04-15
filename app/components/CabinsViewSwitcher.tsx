'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Cabin } from '@/modules/cabins/domain/types';
import { AvailableCabinsMap } from './AvailableCabinsMap';

type View = 'list' | 'map';

interface Props {
  cabins: Cabin[];
}

export function CabinsViewSwitcher({ cabins }: Props) {
  const [view, setView] = useState<View>('list');

  return (
    <>
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
          Listă
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
          Hartă
        </button>
      </div>

      {/* Map view */}
      {view === 'map' && <AvailableCabinsMap cabins={cabins} />}

      {/* List view */}
      {view === 'list' && (
        <ul
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          aria-label="Lista cabane disponibile"
        >
          {cabins.map((cabin) => (
            <li key={cabin.id}>
              <Link
                href={`/cabins/${cabin.slug}`}
                className="group block overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                aria-label={`${cabin.title}, ${cabin.location}, ${cabin.pricePerNight} RON pe noapte`}
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
                      <span className="text-xs font-normal text-gray-500">RON / noapte</span>
                    </p>
                    <span className="text-xs text-gray-400">
                      👥 max {cabin.maxGuests}
                    </span>
                  </div>
                  <span className="mt-3 inline-block text-sm font-medium text-indigo-600 group-hover:underline">
                    Vezi detalii →
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
