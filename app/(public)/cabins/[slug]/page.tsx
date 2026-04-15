import { notFound } from 'next/navigation';
import { getCabinDetail } from '@/modules/cabins/application/cabinService';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await getCabinDetail(slug);
  if (!result.ok) return { title: 'Cabana negăsită' };
  return {
    title: result.data.title,
    description: result.data.description.slice(0, 160),
  };
}

export const revalidate = 300;

export default async function CabinDetailPage({ params }: Props) {
  const { slug } = await params;
  const result = await getCabinDetail(slug);
  if (!result.ok) notFound();
  const cabin = result.data;

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      {/* Image */}
      {cabin.imageUrls[0] ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cabin.imageUrls[0]}
          alt={cabin.title}
          className="mb-8 h-72 w-full rounded-2xl object-cover"
        />
      ) : (
        <div
          className="mb-8 flex h-72 items-center justify-center rounded-2xl bg-indigo-50 text-7xl"
          aria-hidden="true"
        >
          🏔️
        </div>
      )}

      <h1 className="text-3xl font-bold">{cabin.title}</h1>
      <p className="mt-1 text-gray-500">{cabin.location}</p>

      <div className="mt-4 flex flex-wrap gap-6">
        <span className="text-xl font-semibold text-indigo-700">
          {cabin.pricePerNight} RON / noapte
        </span>
        <span className="text-gray-600">Capacitate: {cabin.maxGuests} persoane</span>
      </div>

      <p className="mt-6 text-gray-700 leading-relaxed">{cabin.description}</p>

      {cabin.amenities.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold">Dotări</h2>
          <ul className="flex flex-wrap gap-2">
            {cabin.amenities.map((a) => (
              <li key={a} className="rounded-full bg-indigo-50 px-3 py-1 text-sm text-indigo-700">
                {a}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-10">
        <a
          href="/login"
          className="inline-block rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
        >
          Rezervă acum
        </a>
      </div>
    </main>
  );
}
