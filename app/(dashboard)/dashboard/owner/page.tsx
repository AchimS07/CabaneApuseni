import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { requireOwner } from '@/lib/auth/authorization';
import { getOwnerCabins } from '@/modules/cabins/application/cabinService';
import { getOwnerBookings } from '@/modules/bookings/application/bookingService';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('ownerDashboard');
  return { title: t('metaTitle') };
}

export const dynamic = 'force-dynamic';

export default async function OwnerDashboardPage() {
  const session = await requireOwner();
  const t = await getTranslations('ownerDashboard');

  const [cabinsResult, bookingsResult] = await Promise.all([
    getOwnerCabins(session.uid),
    getOwnerBookings(session),
  ]);

  const cabins = cabinsResult.ok ? cabinsResult.data : [];
  const bookings = bookingsResult.ok ? bookingsResult.data : [];

  const totalCabins = cabins.length;
  const publishedCabins = cabins.filter((c) => c.published).length;
  const pendingBookings = bookings.filter((b) => b.status === 'pending').length;

  const today = new Date().toISOString().split('T')[0];
  const upcomingStays = bookings.filter(
    (b) => b.status === 'confirmed' && b.checkIn >= today,
  ).length;

  const bookingsDesc = pendingBookings > 0
    ? t('bookingsPendingDesc', {
        count: pendingBookings,
        suffix: pendingBookings === 1 ? t('bookingsSuffix1') : t('bookingsSuffixN'),
      })
    : t('allBookings');

  return (
    <section className="space-y-8">
      <SectionHeader
        title={t('title')}
        description={t('description')}
      />

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label={t('totalCabins')} value={totalCabins} icon="🏠" />
        <KpiCard
          label={t('published')}
          value={publishedCabins}
          icon="✅"
          variant="success"
        />
        <KpiCard
          label={t('pendingBookings')}
          value={pendingBookings}
          icon="⏳"
          variant={pendingBookings > 0 ? 'warning' : 'default'}
        />
        <KpiCard
          label={t('upcomingStays')}
          value={upcomingStays}
          icon="📅"
        />
      </div>

      {/* Empty state when owner has no cabins */}
      {totalCabins === 0 ? (
        <EmptyState
          icon="🏠"
          title={t('noCabinsTitle')}
          description={t('noCabinsDesc')}
          action={{ label: t('addCabin'), href: '/dashboard/owner/listings/new' }}
        />
      ) : (
        /* Quick-access links */
        <section aria-labelledby="quick-access-heading">
          <h2
            id="quick-access-heading"
            className="mb-4 text-lg font-semibold text-gray-900"
          >
            {t('quickAccess')}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <QuickLink
              href="/dashboard/owner/listings"
              icon="🏠"
              title={t('myCabins')}
              description={t('myCabinsDesc')}
              openLabel={t('open')}
            />
            <QuickLink
              href="/dashboard/owner/bookings"
              icon="📋"
              title={t('bookings')}
              description={bookingsDesc}
              openLabel={t('open')}
            />
            <QuickLink
              href="/dashboard/owner/listings/new"
              icon="➕"
              title={t('addNewCabin')}
              description={t('addNewCabinDesc')}
              openLabel={t('open')}
            />
          </div>
        </section>
      )}
    </section>
  );
}

interface KpiCardProps {
  label: string;
  value: number;
  icon: string;
  variant?: 'default' | 'warning' | 'success';
}

function KpiCard({ label, value, icon, variant = 'default' }: KpiCardProps) {
  const variantClasses = {
    default: 'border-gray-200 bg-white',
    warning: 'border-yellow-200 bg-yellow-50',
    success: 'border-green-200 bg-green-50',
  };
  const valueClasses = {
    default: 'text-gray-900',
    warning: 'text-yellow-800',
    success: 'text-green-800',
  };

  return (
    <div className={`rounded-xl border p-5 shadow-sm ${variantClasses[variant]}`}>
      <span className="text-2xl" aria-hidden="true">{icon}</span>
      <p className="mt-2 text-sm text-gray-500">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${valueClasses[variant]}`}>{value}</p>
    </div>
  );
}

interface QuickLinkProps {
  href: string;
  icon: string;
  title: string;
  description: string;
  openLabel: string;
}

function QuickLink({ href, icon, title, description, openLabel }: QuickLinkProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-xl border bg-white p-6 shadow-sm transition hover:border-indigo-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    >
      <span className="mb-3 text-3xl" aria-hidden="true">{icon}</span>
      <h3 className="text-base font-semibold text-gray-900 group-hover:text-indigo-700">
        {title}
      </h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      <span className="mt-4 text-sm font-medium text-indigo-600 group-hover:underline">
        {openLabel}
      </span>
    </Link>
  );
}
