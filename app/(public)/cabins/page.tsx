import Link from 'next/link';
import { getPublishedCabins } from '@/modules/cabins/application/cabinService';
import { EmptyState } from '@/components/ui/EmptyState';
import { AvailableCabinsMap } from '@/app/components/AvailableCabinsMap';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cabane disponibile',
  description: 'Explorează cabanele disponibile din Munții Apuseni.',
};

export const revalidate = 300; // ISR: 5 minutes

export default async function CabinsPage() {
  const result = await getPublishedCabins();
  const cabins = result.ok ? result.data : [];

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          Cabane disponibile
        </h1>
        <p className="mt-1 text-gray-500">
          {cabins.length > 0
            ? `${cabins.length} ${cabins.length === 1 ? 'cabană disponibilă' : 'cabane disponibile'} în Munții Apuseni`
            : 'Căutăm cabane pentru tine…'}
        </p>
      </div>

      {cabins.length === 0 ? (
        <EmptyState
          icon="🏔️"
          title="Nu există cabane disponibile momentan"
          description="Revino mai târziu – noi cabane sunt adăugate în permanență."
        />
      ) : (
        <>
          <AvailableCabinsMap cabins={cabins} />

          <ul
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            aria-label="Lista cabane disponibile"
          >
            {cabins.map((cabin) => (
              <li key={cabin.id}>
                <Link
                  href={`/cabins/${cabin.slug}`}
                  className="listing-card"
                  aria-label={`${cabin.title}, ${cabin.location}, ${cabin.pricePerNight} RON pe noapte`}
                >
                  {/* Photo */}
                  <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl bg-gray-100">
                    {cabin.imageUrls[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cabin.imageUrls[0]}
                        alt=""
                        aria-hidden="true"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center bg-forest-50 text-5xl"
                        aria-hidden="true"
                      >
                        🏔️
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="font-semibold leading-snug text-gray-900 line-clamp-1 group-hover:text-forest-700">
                        {cabin.title}
                      </h2>
                    </div>

                    <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-500">
                      <span aria-hidden="true">📍</span>
                      {cabin.location}
                    </p>

                    <div className="mt-3 flex items-center justify-between">
                      <p className="font-semibold text-gray-900">
                        <span className="text-forest-700">{cabin.pricePerNight}</span>{' '}
                        <span className="text-sm font-normal text-gray-500">RON / noapte</span>
                      </p>
                      <span className="text-xs text-gray-400">
                        👥 max {cabin.maxGuests}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
