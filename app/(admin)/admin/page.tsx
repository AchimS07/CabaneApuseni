import { requireAdmin } from '@/lib/auth/authorization';
import { getAllCabins } from '@/modules/cabins/application/cabinService';
import { getAllBookings } from '@/modules/bookings/application/bookingService';
import { SectionHeader } from '@/components/ui/SectionHeader';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('adminDashboard');
  return { title: t('metaTitle') };
}

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  await requireAdmin();
  const t = await getTranslations('adminDashboard');

  const [cabinsResult, bookingsResult] = await Promise.all([
    getAllCabins(),
    getAllBookings(),
  ]);

  const cabinCount = cabinsResult.ok ? cabinsResult.data.length : 0;
  const bookingCount = bookingsResult.ok ? bookingsResult.data.length : 0;
  const pendingCount = bookingsResult.ok
    ? bookingsResult.data.filter((b) => b.status === 'pending').length
    : 0;
  const confirmedCount = bookingsResult.ok
    ? bookingsResult.data.filter((b) => b.status === 'confirmed').length
    : 0;

  return (
    <div>
      <SectionHeader
        title={t('title')}
        description={t('description')}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label={t('cabins')}
          value={cabinCount}
          icon="🏠"
          href="/admin/cabins"
        />
        <KpiCard
          label={t('totalBookings')}
          value={bookingCount}
          icon="📅"
          href="/admin/bookings"
        />
        <KpiCard
          label={t('pending')}
          value={pendingCount}
          icon="⏳"
          highlight={pendingCount > 0}
          variant="warning"
          href="/admin/bookings?status=pending"
        />
        <KpiCard
          label={t('confirmed')}
          value={confirmedCount}
          icon="✅"
          variant="success"
          href="/admin/bookings?status=confirmed"
        />
      </div>

      {/* Quick-access links */}
      <section className="mt-10" aria-labelledby="quick-access-heading">
        <h2
          id="quick-access-heading"
          className="mb-4 text-lg font-semibold text-gray-900"
        >
          {t('quickAccess')}
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/cabins"
            className="rounded-md border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {t('manageCabins')}
          </Link>
          <Link
            href="/admin/bookings"
            className="rounded-md border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Gestionează rezervări
          </Link>
          <Link
            href="/"
            className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            {t('viewPublicSite')}
          </Link>
        </div>
      </section>
    </div>
  );
}

interface KpiCardProps {
  label: string;
  value: number;
  icon: string;
  href?: string;
  highlight?: boolean;
  variant?: 'default' | 'warning' | 'success';
}

function KpiCard({ label, value, icon, href, variant = 'default' }: KpiCardProps) {
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

  const content = (
    <div
      className={`rounded-xl border p-5 shadow-sm transition ${variantClasses[variant]} ${href ? 'hover:shadow-md' : ''}`}
    >
      <span className="text-2xl" aria-hidden="true">
        {icon}
      </span>
      <p className="mt-2 text-sm text-gray-500">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${valueClasses[variant]}`}>
        {value}
      </p>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-xl"
      >
        {content}
      </Link>
    );
  }

  return content;
}
