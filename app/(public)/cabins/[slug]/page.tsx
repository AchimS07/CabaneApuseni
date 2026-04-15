import { notFound } from 'next/navigation';
import { getCabinDetail } from '@/modules/cabins/application/cabinService';
import { verifySession } from '@/lib/auth/session';
import BookingForm from '@/components/forms/BookingForm';
import Link from 'next/link';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

// Force dynamic so we can read the session cookie for auth-aware UI
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await getCabinDetail(slug);
  if (!result.ok) return { title: 'Cabana negăsită' };
  return {
    title: result.data.title,
    description: result.data.description.slice(0, 160),
  };
}

export default async function CabinDetailPage({ params }: Props) {
  const { slug } = await params;

  const [result, session] = await Promise.all([
    getCabinDetail(slug),
    verifySession(),
  ]);

  if (!result.ok) notFound();
  const cabin = result.data;

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      {/* Back link */}
      <Link
        href="/cabins"
        className="mb-6 inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
      >
        ← Înapoi la cabane
      </Link>

      {/* Hero image */}
      {cabin.imageUrls[0] ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cabin.imageUrls[0]}
          alt={cabin.title}
          className="mb-8 h-72 w-full rounded-2xl object-cover sm:h-96"
        />
      ) : (
        <div
          className="mb-8 flex h-72 items-center justify-center rounded-2xl bg-indigo-50 text-7xl sm:h-96"
          aria-hidden="true"
        >
          🏔️
        </div>
      )}

      {/* Two-column layout: details + booking form */}
      <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-10">
        {/* ── Left column: cabin details ── */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{cabin.title}</h1>

          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <span aria-hidden="true">📍</span>
              {cabin.location}
            </span>
            <span className="flex items-center gap-1">
              <span aria-hidden="true">👥</span>
              Capacitate: {cabin.maxGuests}{' '}
              {cabin.maxGuests === 1 ? 'persoană' : 'persoane'}
            </span>
          </div>

          <p className="mt-3 text-xl font-semibold text-indigo-700">
            {cabin.pricePerNight} RON{' '}
            <span className="text-base font-normal text-gray-500">/ noapte</span>
          </p>

          {/* Description */}
          <section aria-labelledby="description-heading" className="mt-6">
            <h2
              id="description-heading"
              className="mb-2 text-lg font-semibold text-gray-900"
            >
              Descriere
            </h2>
            <p className="leading-relaxed text-gray-700 whitespace-pre-wrap">
              {cabin.description}
            </p>
          </section>

          {/* Amenities */}
          {cabin.amenities.length > 0 && (
            <section aria-labelledby="amenities-heading" className="mt-8">
              <h2
                id="amenities-heading"
                className="mb-3 text-lg font-semibold text-gray-900"
              >
                Dotări
              </h2>
              <ul className="flex flex-wrap gap-2">
                {cabin.amenities.map((a) => (
                  <li
                    key={a}
                    className="rounded-full bg-indigo-50 px-3 py-1 text-sm text-indigo-700"
                  >
                    {a}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Additional images */}
          {cabin.imageUrls.length > 1 && (
            <section aria-labelledby="gallery-heading" className="mt-8">
              <h2
                id="gallery-heading"
                className="mb-3 text-lg font-semibold text-gray-900"
              >
                Galerie foto
              </h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {cabin.imageUrls.slice(1).map((url, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={url}
                    src={url}
                    alt={`${cabin.title} – imagine ${i + 2}`}
                    className="h-40 w-full rounded-lg object-cover"
                  />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ── Right column: booking form ── */}
        <aside aria-label="Formular de rezervare" className="mt-10 lg:mt-0">
          <div className="lg:sticky lg:top-24">
            <BookingForm
              cabin={{
                id: cabin.id,
                slug: cabin.slug,
                maxGuests: cabin.maxGuests,
                pricePerNight: cabin.pricePerNight,
              }}
              isAuthenticated={!!session}
            />
          </div>
        </aside>
      </div>
    </main>
  );
}
