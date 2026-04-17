'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Cabin } from '@/modules/cabins/domain/types';

interface Props {
  cabins: Cabin[];
}

export function AvailableCabinsMap({ cabins }: Props) {
  const t = useTranslations('cabinsList');
  const [selectedCabinId, setSelectedCabinId] = useState(cabins[0]?.id ?? '');

  const selectedCabin = useMemo(
    () => cabins.find((cabin) => cabin.id === selectedCabinId) ?? cabins[0],
    [cabins, selectedCabinId],
  );

  if (!selectedCabin) return null;

  const mapQuery = `${selectedCabin.location}, Apuseni, Romania`;
  const mapsEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`;
  const mapsOpenUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;

  return (
    <section className="mb-10 rounded-xl border bg-white p-4 shadow-sm" aria-label={t('mapHeading')}>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{t('mapHeading')}</h2>
          <p className="text-sm text-gray-500">{t('mapSelectHint')}</p>
        </div>
        <a
          href={mapsOpenUrl}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-medium text-pine-600 hover:underline"
        >
          {t('openInMaps')}
        </a>
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {cabins.map((cabin) => {
          const isActive = cabin.id === selectedCabin.id;
          return (
            <button
              key={cabin.id}
              type="button"
              onClick={() => setSelectedCabinId(cabin.id)}
              className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-sm transition ${
                isActive
                  ? 'border-pine-600 bg-pine-50 text-pine-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-pine-300'
              }`}
              aria-pressed={isActive}
            >
              {cabin.title}
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-lg border">
        <iframe
          title={t('mapIframeTitle', { title: selectedCabin.title })}
          src={mapsEmbedUrl}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-80 w-full border-0"
        />
      </div>
    </section>
  );
}
