import type { Metadata } from 'next';
import Link from 'next/link';
import { requireOwner } from '@/lib/auth/authorization';
import { getOwnerCabins } from '@/modules/cabins/application/cabinService';
import { getOwnerBookings } from '@/modules/bookings/application/bookingService';
import { getProfile } from '@/modules/users/application/userService';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SubscriptionBanner } from '@/components/ui/SubscriptionBanner';
import { PaymentVerifier } from '@/components/ui/PaymentVerifier';
import {
  HomeIcon,
  CheckCircleIcon,
  CalendarIcon,
  StarOutlineIcon,
  PackageIcon,
  XCircleIcon,
  ChevronRightIcon,
  ClipboardListIcon,
  PlusIcon,
} from '@/components/ui/Icons';
import type React from 'react';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('ownerDashboard');
  return { title: t('metaTitle') };
}

export const dynamic = 'force-dynamic';

export default async function OwnerDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireOwner();
  const t = await getTranslations('ownerDashboard');
  const params = await searchParams;
  const subscriptionSuccess = params['subscription'] === 'success';

  const [cabinsResult, bookingsResult, profileResult] = await Promise.all([
    getOwnerCabins(session.uid),
    getOwnerBookings(session),
    getProfile(session.uid),
  ]);

  const cabins = cabinsResult.ok ? cabinsResult.data : [];
  const bookings = bookingsResult.ok ? bookingsResult.data : [];
  const profile = profileResult.ok ? profileResult.data : null;

  const totalCabins = cabins.length;
  const publishedCabins = cabins.filter((c) => c.published).length;
  const pendingBookings = bookings.filter((b) => b.status === 'pending').length;

  const planLabel = profile?.subscriptionTier === 'pro'
    ? 'Pro'
    : profile?.subscriptionTier === 'basic'
    ? 'Basic'
    : t('planInactive');

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

      {/* Payment verification on redirect from Netopia */}
      {subscriptionSuccess && <PaymentVerifier />}

      {/* Subscription status banner */}
      <SubscriptionBanner
        tier={profile?.subscriptionTier ?? null}
        status={profile?.subscriptionStatus ?? null}
        expiresAt={profile?.subscriptionExpiresAt ?? null}
      />

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label={t('planActive')}
          value={planLabel}
          icon={
            profile?.subscriptionTier === 'pro'
              ? <StarOutlineIcon size={20} />
              : profile?.subscriptionTier === 'basic'
              ? <PackageIcon size={20} />
              : <XCircleIcon size={20} />
          }
          variant={profile?.subscriptionStatus === 'active' ? 'success' : 'warning'}
        />
        <KpiCard label={t('totalCabins')} value={totalCabins} icon={<HomeIcon size={20} />} />
        <KpiCard
          label={t('published')}
          value={publishedCabins}
          icon={<CheckCircleIcon size={20} />}
          variant="success"
        />
        <KpiCard
          label={t('pendingBookings')}
          value={pendingBookings}
          icon={<CalendarIcon size={20} />}
          variant={pendingBookings > 0 ? 'warning' : 'default'}
        />
      </div>

      {/* Empty state when owner has no cabins */}
      {totalCabins === 0 ? (
        <EmptyState
          icon="🏠"
          title={t('noCabinsTitle')}
          description={t('noCabinsDesc')}
          action={
            profile?.subscriptionStatus === 'active'
              ? { label: t('addCabin'), href: '/dashboard/owner/listings/new' }
              : undefined
          }
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
              icon={<HomeIcon size={22} />}
              title={t('myCabins')}
              description={t('myCabinsDesc')}
              openLabel={t('open')}
            />
            <QuickLink
              href="/dashboard/owner/bookings"
              icon={<ClipboardListIcon size={22} />}
              title={t('bookings')}
              description={bookingsDesc}
              openLabel={t('open')}
            />
            {profile?.subscriptionStatus === 'active' && (
              <QuickLink
                href="/dashboard/owner/listings/new"
                icon={<PlusIcon size={22} />}
                title={t('addNewCabin')}
                description={t('addNewCabinDesc')}
                openLabel={t('open')}
              />
            )}
          </div>
        </section>
      )}
    </section>
  );
}

interface KpiCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  variant?: 'default' | 'warning' | 'success';
}

function KpiCard({ label, value, icon, variant = 'default' }: KpiCardProps) {
  const variantClasses = {
    default: 'border-gray-200 bg-white',
    warning: 'border-earth-200 bg-earth-50',
    success: 'border-pine-200 bg-pine-50',
  };
  const iconClasses = {
    default: 'text-gray-400',
    warning: 'text-earth-500',
    success: 'text-pine-600',
  };
  const valueClasses = {
    default: 'text-gray-900',
    warning: 'text-earth-700',
    success: 'text-pine-700',
  };

  return (
    <div className={'rounded-xl border p-5 shadow-sm ' + variantClasses[variant]}>
      <span className={iconClasses[variant]} aria-hidden="true">{icon}</span>
      <p className="mt-2 text-sm text-gray-500">{label}</p>
      <p className={'mt-1 text-3xl font-bold ' + valueClasses[variant]}>{value}</p>
    </div>
  );
}

interface QuickLinkProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  openLabel: string;
}

function QuickLink({ href, icon, title, description, openLabel }: QuickLinkProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-xl border bg-white p-6 shadow-sm transition hover:border-pine-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-pine-500 focus-visible:ring-offset-2"
    >
      <span className="mb-3 text-pine-600" aria-hidden="true">{icon}</span>
      <h3 className="text-base font-semibold text-gray-900 group-hover:text-pine-700">
        {title}
      </h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-pine-600 group-hover:underline">
        {openLabel}
        <ChevronRightIcon size={14} />
      </span>
    </Link>
  );
}
