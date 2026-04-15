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

  const allImages = cabin.imageUrls;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Back link */}
      <Link
        href="/cabins"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 transition hover:text-forest-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 rounded-md"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Înapoi la cabane
      </Link>

      {/* Title + meta */}
      <h1 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">{cabin.title}</h1>
      <div className="mb-5 flex flex-wrap items-center gap-4 text-sm text-gray-500">
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

      {/* Photo grid — Airbnb style */}
      {allImages.length > 0 && (
        <div className="mb-10 overflow-hidden rounded-2xl">
          {allImages.length === 1 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={allImages[0]}
              alt={cabin.title}
              className="h-72 w-full object-cover sm:h-[28rem]"
            />
          ) : (
            <div className="grid h-72 grid-cols-2 gap-2 sm:h-[28rem]">
              {/* Main large image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={allImages[0]}
                alt={cabin.title}
                className="h-full w-full object-cover"
              />
              {/* Side grid — up to 4 images */}
              <div className={`grid gap-2 ${allImages.length >= 5 ? 'grid-rows-2' : 'grid-rows-1'}`}>
                {allImages.slice(1, allImages.length >= 5 ? 5 : 3).map((url, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={url}
                    src={url}
                    alt={`${cabin.title} – imagine ${i + 2}`}
                    className={`h-full w-full object-cover ${
                      allImages.length >= 5
                        ? allImages.slice(1, 5).length === 4
                          ? i < 2
                            ? 'col-span-1'
                            : 'col-span-1'
                          : ''
                        : ''
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* No images fallback */}
      {allImages.length === 0 && (
        <div
          className="mb-10 flex h-72 items-center justify-center rounded-2xl bg-forest-50 text-7xl sm:h-[28rem]"
          aria-hidden="true"
        >
          🏔️
        </div>
      )}

      {/* Two-column layout: details + booking */}
      <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-12">
        {/* ── Left: cabin details ── */}
        <div>
          <p className="mb-6 text-2xl font-bold text-gray-900">
            <span className="text-forest-700">{cabin.pricePerNight} RON</span>{' '}
            <span className="text-base font-normal text-gray-500">/ noapte</span>
          </p>

          {/* Description */}
          <section aria-labelledby="description-heading">
            <h2
              id="description-heading"
              className="mb-3 text-lg font-bold text-gray-900"
            >
              Descriere
            </h2>
            <p className="leading-relaxed text-gray-700 whitespace-pre-wrap">
              {cabin.description}
            </p>
          </section>

          {/* Amenities */}
          {cabin.amenities.length > 0 && (
            <section aria-labelledby="amenities-heading" className="mt-10">
              <h2
                id="amenities-heading"
                className="mb-4 text-lg font-bold text-gray-900"
              >
                Dotări
              </h2>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {cabin.amenities.map((a) => (
                  <li
                    key={a}
                    className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-3 py-2.5 text-sm text-gray-700 shadow-sm"
                  >
                    <span className="text-forest-600" aria-hidden="true">✓</span>
                    {a}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Additional images gallery */}
          {allImages.length > 5 && (
            <section aria-labelledby="gallery-heading" className="mt-10">
              <h2
                id="gallery-heading"
                className="mb-4 text-lg font-bold text-gray-900"
              >
                Galerie foto
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {allImages.slice(5).map((url, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={url}
                    src={url}
                    alt={`${cabin.title} – imagine ${i + 6}`}
                    className="aspect-[4/3] w-full rounded-xl object-cover"
                  />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ── Right: booking widget ── */}
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
