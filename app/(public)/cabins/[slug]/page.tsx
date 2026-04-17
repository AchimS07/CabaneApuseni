import { notFound } from 'next/navigation';
import { getCabinDetail } from '@/modules/cabins/application/cabinService';
import { verifySession } from '@/lib/auth/session';
import BookingForm from '@/components/forms/BookingForm';
import Link from 'next/link';
import type { Metadata } from 'next';
import { PhotoGrid } from '@/components/ui/PhotoGrid';
import { WishlistButton } from '@/components/ui/WishlistButton';
import { MapPinIcon, UsersIcon, StarIcon, ArrowLeftIcon, ShareIcon } from '@/components/ui/Icons';
import ReportButton from '@/components/ReportButton';

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

/** Maps common amenity names to emojis for a richer icon grid */
const AMENITY_EMOJIS: Record<string, string> = {
  'wi-fi': '📶',
  'wifi': '📶',
  'parcare': '🚗',
  'bucătărie': '🍳',
  'bucătărie utilată': '🍳',
  'șemineu': '🔥',
  'foc': '🔥',
  'saună': '🛁',
  'jacuzzi': '🛁',
  'jacuzzi exterior': '🛁',
  'ciubăr': '🪣',
  'grătar': '🍖',
  'terasă': '🪑',
  'smart tv': '📺',
  'tv': '📺',
  'încălzire centrală': '🌡️',
  'self check-in': '🔑',
  'animale acceptate': '🐾',
  'piscină': '🏊',
  'vedere munte': '⛰️',
  'internet': '📶',
};

function amenityEmoji(name: string): string {
  return AMENITY_EMOJIS[name.toLowerCase()] ?? '✓';
}

export default async function CabinDetailPage({ params }: Props) {
  const { slug } = await params;

  const [result, session] = await Promise.all([
    getCabinDetail(slug),
    verifySession(),
  ]);

  if (!result.ok) notFound();
  const cabin = result.data;

  const SHOW_AMENITIES = 6;
  const extraAmenities = cabin.amenities.length > SHOW_AMENITIES
    ? cabin.amenities.length - SHOW_AMENITIES
    : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 lg:px-8">

      {/* ── Top nav row ── */}
      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/cabins"
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500"
        >
          <ArrowLeftIcon size={16} aria-hidden="true" />
          Înapoi la cabane
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 underline transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500"
            aria-label="Distribuie"
          >
            <ShareIcon size={16} aria-hidden="true" />
            Distribuie
          </button>
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
              Max. {cabin.maxGuests} {cabin.maxGuests === 1 ? 'persoană' : 'persoane'}
            </span>
            <span className="flex items-center gap-1">
              <StarIcon size={13} className="text-[#222]" aria-hidden="true" />
              <span className="font-medium text-[#222]">Nou</span>
            </span>
          </div>

          {/* Host row */}
          <div className="flex items-center gap-3 border-b border-gray-200 py-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-pine-600 text-white text-lg font-bold">
              {cabin.title.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Cabane Apuseni</p>
              <p className="text-xs text-gray-500">Gazdă de 1 an</p>
            </div>
          </div>

          {/* Description */}
          <section aria-labelledby="description-heading" className="border-b border-gray-200 py-8">
            <h2 id="description-heading" className="mb-4 text-xl font-semibold text-gray-900">
              Despre această cabană
            </h2>
            <p className="leading-relaxed text-gray-700 whitespace-pre-wrap">
              {cabin.description}
            </p>
          </section>

          {/* Amenities */}
          {cabin.amenities.length > 0 && (
            <section aria-labelledby="amenities-heading" className="border-b border-gray-200 py-8">
              <h2 id="amenities-heading" className="mb-5 text-xl font-semibold text-gray-900">
                Ce oferă această cabană
              </h2>
              <AmenitiesGrid
                amenities={cabin.amenities}
                showAll={SHOW_AMENITIES}
              />
            </section>
          )}

          {/* Map section */}
          <section aria-labelledby="map-heading" className="py-8">
            <h2 id="map-heading" className="mb-5 text-xl font-semibold text-gray-900">
              Unde te afli
            </h2>
            <p className="mb-4 flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <MapPinIcon size={15} className="text-gray-400" aria-hidden="true" />
              {cabin.location}, Munții Apuseni
            </p>
            <div className="overflow-hidden rounded-2xl border border-gray-200">
              <iframe
                title={`Harta pentru ${cabin.title}`}
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
        <aside aria-label="Formular de rezervare" className="mt-10 lg:mt-0">
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

// ── Amenities grid sub-component ─────────────────────────────────────────────

interface AmenitiesGridProps {
  amenities: string[];
  showAll: number;
}

function AmenitiesGrid({ amenities, showAll }: AmenitiesGridProps) {
  const visible = amenities.slice(0, showAll);
  const extra = amenities.length > showAll ? amenities.length - showAll : 0;

  return (
    <div>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {visible.map((a) => (
          <li key={a} className="flex items-center gap-3 text-sm text-gray-700">
            <span className="text-xl leading-none" aria-hidden="true">{amenityEmoji(a)}</span>
            {a}
          </li>
        ))}
      </ul>
      {extra > 0 && (
        <button
          type="button"
          className="mt-5 rounded-xl border border-gray-900 px-5 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500"
        >
          Afișează toate dotările (+{extra})
        </button>
      )}
    </div>
  );
}

