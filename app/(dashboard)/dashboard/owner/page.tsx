import type { Metadata } from 'next';
import Link from 'next/link';
import { requireOwner } from '@/lib/auth/authorization';
import { getOwnerCabins } from '@/modules/cabins/application/cabinService';
import { getOwnerBookings } from '@/modules/bookings/application/bookingService';
import { getProfile } from '@/modules/users/application/userService';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SubscriptionBanner } from '@/components/ui/SubscriptionBanner';

export const metadata: Metadata = { title: 'Dashboard proprietar' };
export const dynamic = 'force-dynamic';

export default async function OwnerDashboardPage() {
  const session = await requireOwner();

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
    : 'Inactiv';

  return (
    <section className="space-y-8">
      <SectionHeader
        title="Dashboard proprietar"
        description="Privire de ansamblu asupra activității tale."
      />

      {/* Subscription status banner */}
      <SubscriptionBanner
        tier={profile?.subscriptionTier ?? null}
        status={profile?.subscriptionStatus ?? null}
        expiresAt={profile?.subscriptionExpiresAt ?? null}
      />

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Plan activ"
          value={planLabel}
          icon={profile?.subscriptionTier === 'pro' ? '⭐' : profile?.subscriptionTier === 'basic' ? '📦' : '❌'}
          variant={profile?.subscriptionStatus === 'active' ? 'success' : 'warning'}
        />
        <KpiCard label="Cabane total" value={totalCabins} icon="🏠" />
        <KpiCard
          label="Publicate"
          value={publishedCabins}
          icon="✅"
          variant="success"
        />
        <KpiCard
          label="Rezervări în așteptare"
          value={pendingBookings}
          icon="⏳"
          variant={pendingBookings > 0 ? 'warning' : 'default'}
        />
      </div>

      {/* Empty state when owner has no cabins */}
      {totalCabins === 0 ? (
        <EmptyState
          icon="🏠"
          title="Nu ai nicio cabană înregistrată"
          description="Adaugă prima ta cabană pentru a începe să primești rezervări."
          action={
            profile?.subscriptionStatus === 'active'
              ? { label: '+ Adaugă cabana', href: '/dashboard/owner/listings/new' }
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
            Acces rapid
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <QuickLink
              href="/dashboard/owner/listings"
              icon="🏠"
              title="Cabane mele"
              description="Gestionează listingurile tale."
            />
            <QuickLink
              href="/dashboard/owner/bookings"
              icon="📋"
              title="Rezervări"
              description={
                pendingBookings > 0
                  ? pendingBookings + (pendingBookings === 1 ? ' rezervare în așteptare' : ' rezervări în așteptare')
                  : 'Vezi toate rezervările'
              }
            />
            {profile?.subscriptionStatus === 'active' && (
              <QuickLink
                href="/dashboard/owner/listings/new"
                icon="➕"
                title="Adaugă cabana"
                description="Înregistrează o cabană nouă."
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
    <div className={'rounded-xl border p-5 shadow-sm ' + variantClasses[variant]}>
      <span className="text-2xl" aria-hidden="true">{icon}</span>
      <p className="mt-2 text-sm text-gray-500">{label}</p>
      <p className={'mt-1 text-3xl font-bold ' + valueClasses[variant]}>{value}</p>
    </div>
  );
}

interface QuickLinkProps {
  href: string;
  icon: string;
  title: string;
  description: string;
}

function QuickLink({ href, icon, title, description }: QuickLinkProps) {
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
        Deschide →
      </span>
    </Link>
  );
}
