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
    <main className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold text-gray-900">Cabane disponibile</h1>
      <p className="mb-8 text-gray-500">
        {cabins.length > 0
          ? `${cabins.length} ${cabins.length === 1 ? 'cabană disponibilă' : 'cabane disponibile'}`
          : 'Căutăm cabane pentru tine…'}
      </p>

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
        </>
      )}
    </main>
  );
}
