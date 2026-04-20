import { notFound } from 'next/navigation';
import { getCabinDetail } from '@/modules/cabins/application/cabinService';
import { verifySession } from '@/lib/auth/session';
import BookingForm from '@/components/forms/BookingForm';
import Link from 'next/link';
import type { Metadata } from 'next';
import { PhotoGrid } from '@/components/ui/PhotoGrid';
import { WishlistButton } from '@/components/ui/WishlistButton';
import { MapPinIcon, UsersIcon, StarIcon, ArrowLeftIcon } from '@/components/ui/Icons';
import ReportButton from '@/components/ReportButton';
import { ShareButton } from '@/components/ui/ShareButton';
import { AmenitiesGrid } from '@/components/ui/AmenitiesGrid';
import { getTranslations } from 'next-intl/server';

interface Props {
  params: Promise<{ slug: string }>;
}

// Force dynamic so we can read the session cookie for auth-aware UI
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const t = await getTranslations('cabin');
  const result = await getCabinDetail(slug);
  if (!result.ok) return { title: t('notFoundMeta') };
  const cabin = result.data;
  const description = cabin.description.slice(0, 160);
  const images = cabin.imageUrls[0]
    ? [{ url: cabin.imageUrls[0], alt: cabin.title, width: 1200, height: 800 }]
    : [];

  return {
    title: cabin.title,
    description,
    openGraph: {
      title: cabin.title,
      description,
      url: `/cabins/${cabin.slug}`,
      type: 'website',
      images,
    },
    twitter: {
      title: cabin.title,
      description,
      images: cabin.imageUrls[0] ? [cabin.imageUrls[0]] : [],
    },
  };
}

export default async function CabinDetailPage({ params }: Props) {
  const { slug } = await params;

  const [result, session, t] = await Promise.all([
    getCabinDetail(slug),
    verifySession(),
    getTranslations('cabin'),
  ]);

  if (!result.ok) notFound();
  const cabin = result.data;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://cabaneapuseni.ro';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: cabin.title,
    description: cabin.description,
    url: `${baseUrl}/cabins/${cabin.slug}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: cabin.location,
      addressRegion: 'Alba',
      addressCountry: 'RO',
    },
    amenityFeature: cabin.amenities.map((a) => ({
      '@type': 'LocationFeatureSpecification',
      name: a,
      value: true,
    })),
    ...(cabin.imageUrls[0] ? { image: cabin.imageUrls[0] } : {}),
    offers: {
      '@type': 'Offer',
      price: cabin.pricePerNight,
      priceCurrency: 'RON',
      availability: 'https://schema.org/InStock',
    },
  };

  const SHOW_AMENITIES = 6;

  const guestSuffix = cabin.maxGuests === 1 ? t('person') : t('persons');

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Top nav row ── */}
      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/cabins"
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500"
        >
          <ArrowLeftIcon size={16} aria-hidden="true" />
          {t('backToCabins')}
        </Link>
        <div className="flex items-center gap-2">
          <ShareButton
            title={cabin.title}
            url={`${baseUrl}/cabins/${cabin.slug}`}
            shareLabel={t('share')}
            ariaLabel={t('shareAriaLabel')}
          />
          <WishlistButton
            cabinId={cabin.id}
            cabinSlug={cabin.slug}
            iconSize={18}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 underline transition hover:bg-gray-100"
          />
        </div>
      </div>

      {/* ── Title (above photo grid on desktop) ── */}
      <h1 className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl">{cabin.title}</h1>

      {/* ── Photo grid ── */}
      <PhotoGrid images={cabin.imageUrls} altPrefix={cabin.title} />

      {/* ── Two-column layout ── */}
      <div className="mt-10 lg:grid lg:grid-cols-[1fr_380px] lg:gap-14">

        {/* ── Left column ── */}
        <div className="min-w-0">

          {/* Sub-title row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-gray-200 pb-6 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <MapPinIcon size={15} className="text-gray-400" aria-hidden="true" />
              {cabin.location}
            </span>
            <span className="flex items-center gap-1.5">
              <UsersIcon size={15} className="text-gray-400" aria-hidden="true" />
              {t('maxGuests', { count: cabin.maxGuests, suffix: guestSuffix })}
            </span>
            <span className="flex items-center gap-1">
              <StarIcon size={13} className="text-[#222]" aria-hidden="true" />
              <span className="font-medium text-[#222]">{t('newBadge')}</span>
            </span>
          </div>

          {/* Host row */}
          <div className="flex items-center gap-3 border-b border-gray-200 py-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-pine-600 text-white text-lg font-bold">
              {cabin.title.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{t('hostLabel')}</p>
              <p className="text-xs text-gray-500">{t('hostDuration')}</p>
            </div>
          </div>

          {/* Description */}
          <section aria-labelledby="description-heading" className="border-b border-gray-200 py-8">
            <h2 id="description-heading" className="mb-4 text-xl font-semibold text-gray-900">
              {t('about')}
            </h2>
            <p className="leading-relaxed text-gray-700 whitespace-pre-wrap">
              {cabin.description}
            </p>
          </section>

          {/* Amenities */}
          {cabin.amenities.length > 0 && (
            <section aria-labelledby="amenities-heading" className="border-b border-gray-200 py-8">
              <h2 id="amenities-heading" className="mb-5 text-xl font-semibold text-gray-900">
                {t('whatOffers')}
              </h2>
              <AmenitiesGrid
                amenities={cabin.amenities}
                initialVisible={SHOW_AMENITIES}
                showMoreLabel={(extra: number) => t('showMoreAmenities', { extra })}
                showLessLabel={t('showLessAmenities')}
              />
            </section>
          )}

          {/* Map section */}
          <section aria-labelledby="map-heading" className="py-8">
            <h2 id="map-heading" className="mb-5 text-xl font-semibold text-gray-900">
              {t('whereYouAre')}
            </h2>
            <p className="mb-4 flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <MapPinIcon size={15} className="text-gray-400" aria-hidden="true" />
              {t('locationSuffix', { location: cabin.location })}
            </p>
            <div className="overflow-hidden rounded-2xl border border-gray-200">
              <iframe
                title={t('mapTitle', { title: cabin.title })}
                src={`https://www.google.com/maps?q=${encodeURIComponent(`${cabin.location}, Apuseni, Romania`)}&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-72 w-full border-0 sm:h-96"
              />
            </div>
          </section>

          {/* Report & legal */}
          <div className="border-t border-gray-200 pt-6">
            {session && (
              <ReportButton contentType="listing" contentId={cabin.id} />
            )}
          </div>
        </div>

        {/* ── Right column: sticky booking widget ── */}
        <aside aria-label={t('bookingFormAriaLabel')} className="mt-10 lg:mt-0">
          <div className="lg:sticky lg:top-28">
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
    </div>
  );
}
