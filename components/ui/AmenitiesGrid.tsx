'use client';

import { useState } from 'react';

const AMENITY_EMOJIS: Record<string, string> = {
  'wi-fi': '📶',
  'wifi': '📶',
  'parcare': '🚗',
  'bucătărie': '🍳',
  'bucătărie utilată': '🍳',
  'șemineu': '🔥',
  'foc': '🔥',
  'saună': '🛁',
  'jacuzzi': '🛁',
  'jacuzzi exterior': '🛁',
  'ciubăr': '🪣',
  'grătar': '🍖',
  'terasă': '🪑',
  'smart tv': '📺',
  'tv': '📺',
  'încălzire centrală': '🌡️',
  'self check-in': '🔑',
  'animale acceptate': '🐾',
  'piscină': '🏊',
  'vedere munte': '⛰️',
  'internet': '📶',
};

function amenityEmoji(name: string): string {
  return AMENITY_EMOJIS[name.toLowerCase()] ?? '✓';
}

interface Props {
  amenities: string[];
  initialVisible: number;
  showMoreLabel: (extra: number) => string;
  showLessLabel: string;
}

export function AmenitiesGrid({ amenities, initialVisible, showMoreLabel, showLessLabel }: Props) {
  const [expanded, setExpanded] = useState(false);

  const visible = expanded ? amenities : amenities.slice(0, initialVisible);
  const extra = amenities.length > initialVisible ? amenities.length - initialVisible : 0;

  return (
    <div>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {visible.map((a) => (
          <li key={a} className="flex items-center gap-3 text-sm text-gray-700">
            <span className="text-xl leading-none" aria-hidden="true">{amenityEmoji(a)}</span>
            {a}
          </li>
        ))}
      </ul>
      {extra > 0 && !expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-5 rounded-xl border border-gray-900 px-5 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500"
        >
          {showMoreLabel(extra)}
        </button>
      )}
      {expanded && amenities.length > initialVisible && (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="mt-5 rounded-xl border border-gray-900 px-5 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500"
        >
          {showLessLabel}
        </button>
      )}
    </div>
  );
}
