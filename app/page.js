'use client';

import { useState, useEffect, useCallback } from 'react';
import CabinCard from '../components/CabinCard';
import { getPublishedCabins } from '../lib/firestore';

export default function HomePage() {
  const [cabins,      setCabins]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [lastDoc,     setLastDoc]     = useState(null);
  const [hasMore,     setHasMore]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getPublishedCabins(null, 12);
      setCabins(result.cabins);
      setLastDoc(result.lastDoc);
      setHasMore(result.cabins.length === 12);
    } catch {
      setError('Unable to load cabins. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = async () => {
    if (!hasMore || loadingMore || !lastDoc) return;
    try {
      setLoadingMore(true);
      const result = await getPublishedCabins(lastDoc, 12);
      setCabins((prev) => [...prev, ...result.cabins]);
      setLastDoc(result.lastDoc);
      setHasMore(result.cabins.length === 12);
    } catch {
      setError('Failed to load more cabins.');
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => { load(); }, [load]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Hero */}
      <section className="relative bg-forest-800 rounded-2xl overflow-hidden mb-12 py-20 px-8 text-white">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Discover Mountain Cabins in the Apuseni
          </h1>
          <p className="text-forest-100 text-lg leading-relaxed">
            Escape to nature. Browse authentic cabins nestled in the heart of the Apuseni Mountains.
          </p>
        </div>
        <div
          className="absolute inset-0 bg-gradient-to-br from-forest-950 via-forest-800 to-forest-600"
          aria-hidden="true"
        />
      </section>

      {/* Listings */}
      <section aria-labelledby="listings-heading">
        <h2 id="listings-heading" className="text-2xl font-semibold text-stone-800 mb-6">
          Available Cabins
        </h2>

        {loading ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            aria-label="Loading cabins"
            aria-busy="true"
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-stone-100 rounded-xl h-72 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-600 mb-4">{error}</p>
            <button onClick={load} className="btn-primary">Try Again</button>
          </div>
        ) : cabins.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-6xl" aria-hidden="true">🏔️</span>
            <p className="text-stone-500 text-lg mt-4">No cabins listed yet. Check back soon!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {cabins.map((cabin) => (
                <CabinCard key={cabin.id} cabin={cabin} />
              ))}
            </div>
            {hasMore && (
              <div className="mt-12 text-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="btn-primary px-10 rounded-full"
                >
                  {loadingMore ? 'Loading…' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

