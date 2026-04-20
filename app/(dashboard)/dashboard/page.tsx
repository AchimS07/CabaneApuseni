import { requireAuth } from '@/lib/auth/authorization';
import { getProfile } from '@/modules/users/application/userService';
import { getUserBookings } from '@/modules/bookings/application/bookingService';
import Link from 'next/link';
import type { Metadata } from 'next';
import { WishlistSection } from '@/components/WishlistSection';
import { getTranslations } from 'next-intl/server';
import {
  CalendarIcon,
  MountainIcon,
  UserIcon,
  HomeIcon,
} from '@/components/ui/Icons';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('dashboard');
  return { title: t('title') };
}

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ view?: string }>;
}

/** Returns the first letter(s) of the user's name for the avatar. */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default async function DashboardPage({ searchParams }: Props) {
  const { view } = await searchParams;
  const session = await requireAuth();
  const [profileResult, bookingsResult] = await Promise.all([
    getProfile(session.uid),
    getUserBookings(session),
  ]);
  const t = await getTranslations('dashboard');
  const tCommon = await getTranslations('common');
  const name = profileResult.ok ? profileResult.data.name : session.email ?? tCommon('guest');
  const role = profileResult.ok ? profileResult.data.role : session.role;

  const activeBookingCount =
    role !== 'owner' && bookingsResult.ok
      ? bookingsResult.data.filter(
          (b) => b.status === 'pending' || b.status === 'confirmed',
        ).length
      : 0;

  const initials = getInitials(name);

  if (view === 'favorites') {
    return (
      <div>
        <h1 className="mb-1 text-2xl font-bold text-gray-900">{t('favorites')}</h1>
        <p className="mb-8 text-gray-500">{t('favoritesDesc')}</p>
        <WishlistSection />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Hero banner ─────────────────────────────────────────── */}
      <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-br from-pine-50 to-white px-6 py-6 shadow-sm ring-1 ring-pine-100">
        {/* Avatar */}
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-pine-600 text-lg font-bold text-white shadow-sm"
          aria-hidden="true"
        >
          {initials}
        </div>

        {/* Text */}
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            {t('welcomeBack', { name })}
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {role === 'owner' ? t('subtitleOwner') : t('subtitleUser')}
          </p>
          {role !== 'owner' && (
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-pine-100 px-3 py-0.5 text-xs font-medium text-pine-700">
              <span
                className="h-1.5 w-1.5 rounded-full bg-pine-500"
                aria-hidden="true"
              />
              {activeBookingCount === 0
                ? t('noBookingsYet')
                : activeBookingCount === 1
                  ? t('oneActiveBooking')
                  : t('activeBookings', { count: activeBookingCount })}
            </span>
          )}
        </div>
      </div>

      {/* ── Quick actions ────────────────────────────────────────── */}
      {role !== 'owner' && (
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Bookings — secondary card */}
          <Link
            href="/dashboard/bookings"
            className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-pine-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-pine-500 focus:ring-offset-2"
          >
            <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-pine-100 text-pine-600">
              <CalendarIcon size={20} />
            </span>
            <h2 className="text-base font-semibold text-gray-900 group-hover:text-pine-700">
              {t('myBookings')}
            </h2>
            <p className="mt-1 text-sm text-gray-500 leading-snug">{t('myBookingsDesc')}</p>
            <span className="mt-4 text-sm font-medium text-pine-600 group-hover:underline">
              {t('viewBookings')}
            </span>
          </Link>

          {/* Explore — primary card */}
          <Link
            href="/cabins"
            className="group flex flex-col rounded-2xl bg-pine-600 p-5 shadow-sm transition hover:bg-pine-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-pine-500 focus:ring-offset-2"
          >
            <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white">
              <MountainIcon size={20} />
            </span>
            <h2 className="text-base font-semibold text-white">
              {t('searchCabins')}
            </h2>
            <p className="mt-1 text-sm text-pine-100 leading-snug">{t('searchCabinsDesc')}</p>
            <span className="mt-4 text-sm font-medium text-white/90 group-hover:underline">
              {t('explore')}
            </span>
          </Link>

          {/* Profile — tertiary card */}
          <Link
            href="/dashboard/profile"
            className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-pine-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-pine-500 focus:ring-offset-2"
          >
            <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-earth-100 text-earth-600">
              <UserIcon size={20} />
            </span>
            <h2 className="text-base font-semibold text-gray-900 group-hover:text-pine-700">
              {t('profileCard')}
            </h2>
            <p className="mt-1 text-sm text-gray-500 leading-snug">{t('profileCardDesc')}</p>
            <span className="mt-4 text-sm font-medium text-pine-600 group-hover:underline">
              {t('viewProfile')}
            </span>
          </Link>
        </div>
      )}

      {role === 'owner' && (
        <Link
          href="/dashboard/owner"
          className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-pine-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-pine-500 focus:ring-offset-2"
        >
          <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-pine-100 text-pine-600">
            <HomeIcon size={20} />
          </span>
          <h2 className="text-lg font-semibold text-gray-900 group-hover:text-pine-700">
            {t('ownerDashboard')}
          </h2>
          <p className="mt-1 text-sm text-gray-500">{t('ownerDashboardDesc')}</p>
          <span className="mt-4 text-sm font-medium text-pine-600 group-hover:underline">
            {t('openDashboard')}
          </span>
        </Link>
      )}

      {/* ── Favourites — not shown to owners ─────────────────────── */}
      {role !== 'owner' && <WishlistSection />}
    </div>
  );
}
