import { requireAuth } from '@/lib/auth/authorization';
import { getProfile } from '@/modules/users/application/userService';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('dashboard');
  return { title: t('title') };
}

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await requireAuth();
  const profileResult = await getProfile(session.uid);
  const name = profileResult.ok ? profileResult.data.name : session.email ?? 'Utilizator';
  const role = profileResult.ok ? profileResult.data.role : session.role;
  const t = await getTranslations('dashboard');

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">
        {t('welcomeBack', { name })}
      </h1>
      <p className="mb-8 text-gray-500">
        {role === 'owner' ? t('subtitleOwner') : t('subtitleUser')}
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/bookings"
          className="group flex flex-col rounded-xl border bg-white p-6 shadow-sm transition hover:border-indigo-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <span className="mb-3 text-3xl" aria-hidden="true">📅</span>
          <h2 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-700">
            {t('myBookings')}
          </h2>
          <p className="mt-1 text-sm text-gray-500">{t('myBookingsDesc')}</p>
          <span className="mt-4 text-sm font-medium text-indigo-600 group-hover:underline">
            {t('viewBookings')}
          </span>
        </Link>

        <Link
          href="/cabins"
          className="group flex flex-col rounded-xl border bg-white p-6 shadow-sm transition hover:border-indigo-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <span className="mb-3 text-3xl" aria-hidden="true">🏔️</span>
          <h2 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-700">
            {t('searchCabins')}
          </h2>
          <p className="mt-1 text-sm text-gray-500">{t('searchCabinsDesc')}</p>
          <span className="mt-4 text-sm font-medium text-indigo-600 group-hover:underline">
            {t('explore')}
          </span>
        </Link>

        {role === 'owner' && (
          <Link
            href="/dashboard/owner"
            className="group flex flex-col rounded-xl border bg-white p-6 shadow-sm transition hover:border-indigo-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <span className="mb-3 text-3xl" aria-hidden="true">🧑‍💼</span>
            <h2 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-700">
              {t('ownerDashboard')}
            </h2>
            <p className="mt-1 text-sm text-gray-500">{t('ownerDashboardDesc')}</p>
            <span className="mt-4 text-sm font-medium text-indigo-600 group-hover:underline">
              {t('openDashboard')}
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}
