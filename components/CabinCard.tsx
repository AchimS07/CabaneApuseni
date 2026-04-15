'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { type Cabin } from '@/lib/firestore';
import ReportButton from './ReportButton';

interface Props {
  cabin: Cabin;
}

export default function CabinCard({ cabin }: Props) {
  const { user } = useAuth();
  const mainPhoto = cabin.photos[0] ?? '';

  return (
    <article className="card overflow-hidden hover:shadow-md transition-shadow group">
      <div className="relative aspect-[4/3] bg-stone-100">
        {mainPhoto ? (
          <Image
            src={mainPhoto}
            alt={cabin.title + ' – main photo'}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw,(max-width: 1024px) 50vw,25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-300 text-5xl" aria-hidden="true">
            🏔️
          </div>
        )}
        {user && (
          <div className="absolute top-2 right-2">
            <ReportButton contentType="listing" contentId={cabin.id} />
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-stone-800 leading-snug line-clamp-2 flex-1">{cabin.title}</h3>
          <span className="text-forest-700 font-bold text-sm whitespace-nowrap shrink-0">
            {'€' + cabin.basePricePerNight + '/night'}
          </span>
        </div>
        <p className="text-stone-500 text-xs flex items-center gap-1 mb-4">
          <span aria-hidden="true">📍</span>
          {cabin.location}
        </p>
        <Link
          href={'/cabins/' + cabin.id}
          className="btn-primary w-full justify-center"
          aria-label={'View cabin: ' + cabin.title}
        >
          View Cabin
        </Link>
      </div>
    </article>
  );
}
