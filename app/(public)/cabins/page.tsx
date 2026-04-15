import Link from 'next/link';
import { getPublishedCabins } from '@/modules/cabins/application/cabinService';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cabane disponibile',
};

export const revalidate = 300; // ISR: 5 minutes

export default async function CabinsPage() {
  const result = await getPublishedCabins();
  const cabins = result.ok ? result.data : [];

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Cabane disponibile</h1>

      {cabins.length === 0 ? (
        <p className="text-gray-500">Nu există cabane disponibile momentan.</p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cabins.map((cabin) => (
            <li key={cabin.id}>
              <Link
                href={`/cabins/${cabin.slug}`}
                className="group block overflow-hidden rounded-xl border shadow-sm transition hover:shadow-md"
              >
                {cabin.imageUrls[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cabin.imageUrls[0]}
                    alt={cabin.title}
                    className="h-48 w-full object-cover transition group-hover:scale-105"
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
                  <h2 className="font-semibold text-gray-900">{cabin.title}</h2>
                  <p className="mt-1 text-sm text-gray-500">{cabin.location}</p>
                  <p className="mt-2 font-medium text-indigo-700">
                    {cabin.pricePerNight} RON / noapte
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
