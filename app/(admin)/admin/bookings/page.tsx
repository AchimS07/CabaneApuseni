import { requireAdmin } from '@/lib/auth/authorization';
import { getAllBookings } from '@/modules/bookings/application/bookingService';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import Link from 'next/link';
import type { Metadata } from 'next';
import type { BookingStatus } from '@/modules/bookings/domain/types';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('adminBookingsPage');
  return { title: t('metaTitle') };
}

export const dynamic = 'force-dynamic';

type StatusFilter = BookingStatus | 'all';

const STATUS_TABS: StatusFilter[] = [
  'all',
  'pending',
  'confirmed',
  'cancelled',
  'completed',
];

interface Props {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminBookingsPage({ searchParams }: Props) {
  await requireAdmin();
  const [result, params, t] = await Promise.all([
    getAllBookings(),
    searchParams,
    getTranslations('adminBookingsPage'),
  ]);

  const activeStatus = (params.status ?? 'all') as StatusFilter;
  const allBookings = result.ok ? result.data : [];

  const filtered =
    activeStatus === 'all'
      ? allBookings
      : allBookings.filter((b) => b.status === activeStatus);

  const pendingCount = allBookings.filter((b) => b.status === 'pending').length;

  const STATUS_LABELS: Record<StatusFilter, string> = {
    all: t('filterAll'),
    pending: t('filterPending'),
    confirmed: t('filterConfirmed'),
    cancelled: t('filterCancelled'),
    completed: t('filterCompleted'),
  };

  const description =
    allBookings.length === 1
      ? t('descriptionSingular')
      : t('descriptionPlural', { count: allBookings.length });

  return (
    <div>
      <SectionHeader
        title={t('title')}
        description={description}
      />

      {!result.ok && (
        <div
          role="alert"
          className="mb-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {t('loadError')}
        </div>
      )}

      {/* Status tabs */}
      <nav
        aria-label={t('filterLabel')}
        className="mb-6 flex flex-wrap gap-2 border-b pb-4"
      >
        {STATUS_TABS.map((s) => {
          const isActive = activeStatus === s;
          const count =
            s === 'all'
              ? allBookings.length
              : allBookings.filter((b) => b.status === s).length;
          return (
            <Link
              key={s}
              href={
                s === 'all'
                  ? '/admin/bookings'
                  : `/admin/bookings?status=${s}`
              }
              aria-current={isActive ? 'page' : undefined}
              className={[
                'inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition',
                'focus:outline-none focus:ring-2 focus:ring-pine-500 focus:ring-offset-1',
                isActive
                  ? 'bg-ember-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
              ].join(' ')}
            >
              {STATUS_LABELS[s]}
              {s === 'pending' && pendingCount > 0 && (
                <span
                  className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                    isActive ? 'bg-white text-pine-700' : 'bg-yellow-400 text-white'
                  }`}
                  aria-label={t('pendingAriaLabel', { count: pendingCount })}
                >
                  {pendingCount}
                </span>
              )}
              {s !== 'pending' && (
                <span className={isActive ? 'opacity-75' : 'opacity-50'}>{count}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {filtered.length === 0 ? (
        <EmptyState
          icon="📋"
          title={`${t('emptyTitlePrefix')} ${activeStatus !== 'all' ? STATUS_LABELS[activeStatus].toLowerCase() : ''}`.trim()}
          description={t('emptyDescription')}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm" aria-label={t('tableAriaLabel')}>
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th scope="col" className="px-4 py-3">{t('colCabin')}</th>
                <th scope="col" className="px-4 py-3">{t('colPeriod')}</th>
                <th scope="col" className="px-4 py-3">{t('colGuests')}</th>
                <th scope="col" className="px-4 py-3">{t('colTotal')}</th>
                <th scope="col" className="px-4 py-3">{t('colNotes')}</th>
                <th scope="col" className="px-4 py-3">{t('colStatus')}</th>
                <th scope="col" className="px-4 py-3">{t('colCreated')}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    <Link
                      href={`/cabins/${b.cabin.slug}`}
                      className="hover:text-pine-600 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {b.cabin.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <span className="whitespace-nowrap">{b.checkIn}</span>
                    <span className="mx-1 text-gray-400">→</span>
                    <span className="whitespace-nowrap">{b.checkOut}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{b.guestCount}</td>
                  <td className="px-4 py-3 font-medium text-pine-700">
                    {b.totalPrice} RON
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs max-w-[160px]">
                    {b.notes ? (
                      <span className="line-clamp-2" title={b.notes}>{b.notes}</span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(b.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
