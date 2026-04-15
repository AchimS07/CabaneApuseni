'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRequireRole } from '@/lib/hooks/useRequireRole';
import { getOwnerCabins, updateCabin, type Cabin } from '@/lib/firestore';

export default function OwnerListingsPage() {
  const { profile, loading: authLoading } = useRequireRole('owner');
  const [cabins,  setCabins]  = useState<Cabin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (!profile) return;
    getOwnerCabins(profile.uid)
      .then(setCabins)
      .catch(() => setError('Failed to load your listings.'))
      .finally(() => setLoading(false));
  }, [profile]);

  const togglePublished = async (cabin: Cabin) => {
    try {
      await updateCabin(cabin.id, { published: !cabin.published });
      setCabins((prev) =>
        prev.map((c) => (c.id === cabin.id ? { ...c, published: !c.published } : c)),
      );
    } catch { setError('Failed to update listing.'); }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center py-20" aria-label="Loading">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-700" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-stone-800">My Listings</h1>
        <Link href="/owner/listings/new" className="btn-primary">+ New Listing</Link>
      </div>

      {error && <p className="error-msg mb-4" role="alert">{error}</p>}

      {loading ? (
        <div className="space-y-4" aria-busy="true" aria-label="Loading listings">
          {[1, 2, 3].map((i) => <div key={i} className="bg-stone-100 rounded-xl h-24 animate-pulse" />)}
        </div>
      ) : cabins.length === 0 ? (
        <div className="card p-12 text-center">
          <span className="text-5xl" aria-hidden="true">🏡</span>
          <p className="text-stone-500 mt-4 mb-6">You haven’t listed any cabins yet.</p>
          <Link href="/owner/listings/new" className="btn-primary">Create Your First Listing</Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {cabins.map((cabin) => (
            <li key={cabin.id} className="card p-4 flex gap-4 items-center">
              <div className="relative rounded-lg overflow-hidden bg-stone-100 flex-none" style={{ width: 80, height: 64 }}>
                {cabin.photos[0] ? (
                  <Image
                    src={cabin.photos[0]}
                    alt={cabin.title}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-300 text-xl" aria-hidden="true">
                    🏔️
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-stone-800 truncate">{cabin.title}</h2>
                <p className="text-stone-500 text-sm">{cabin.location}</p>
                <p className="text-forest-700 text-sm font-medium">{'€' + cabin.basePricePerNight + '/night'}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                <span className={cabin.published ? 'badge-accepted' : 'badge-open'}>
                  {cabin.published ? 'Published' : 'Draft'}
                </span>
                <button
                  onClick={() => togglePublished(cabin)}
                  className="btn-secondary text-xs py-1 px-2"
                  aria-label={(cabin.published ? 'Unpublish ' : 'Publish ') + cabin.title}
                >
                  {cabin.published ? 'Unpublish' : 'Publish'}
                </button>
                <Link
                  href={'/owner/listings/' + cabin.id + '/edit'}
                  className="btn-secondary text-xs py-1 px-2"
                  aria-label={'Edit ' + cabin.title}
                >
                  Edit
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
