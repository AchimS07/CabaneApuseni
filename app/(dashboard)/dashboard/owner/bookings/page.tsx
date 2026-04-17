import type { Metadata } from 'next';
import Link from 'next/link';
import { requireOwner } from '@/lib/auth/authorization';
import { getOwnerBookings } from '@/modules/bookings/application/bookingService';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { BookingActionButtons } from '@/components/ui/BookingActionButtons';
import type { BookingStatus } from '@/modules/bookings/domain/types';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('ownerBookings');
  return { title: t('metaTitle') };
}

export const dynamic = 'force-dynamic';

const STATUS_TABS: Array<BookingStatus | 'all'> = [
  'all',
  'pending',
  'confirmed',
  'cancelled',
  'completed',
];

interface Props {
  searchParams: Promise<{ status?: string }>;
}

export default async function OwnerBookingsPage({ searchParams }: Props) {
  const session = await requireOwner();
  const [result, params, t] = await Promise.all([
    getOwnerBookings(session),
    searchParams,
    getTranslations('ownerBookings'),
  ]);

  const activeStatus = (params.status ?? 'all') as BookingStatus | 'all';
  const allBookings = result.ok ? result.data : [];

  const filtered =
    activeStatus === 'all'
      ? allBookings
      : allBookings.filter((b) => b.status === activeStatus);

  const pendingCount = allBookings.filter((b) => b.status === 'pending').length;

  const STATUS_LABELS: Record<BookingStatus | 'all', string> = {
    all: t('filterAll'),
    pending: t('filterPending'),
    confirmed: t('filterConfirmed'),
    cancelled: t('filterCancelled'),
    completed: t('filterCompleted'),
  };

  const descSuffix = allBookings.length === 1 ? t('reservationSingular') : t('reservationPlural');

  return (
    <div>
      <SectionHeader
        title={t('title')}
        description={`${allBookings.length} ${descSuffix} ${t('total')}`}
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
              href={s === 'all' ? '/dashboard/owner/bookings' : `/dashboard/owner/bookings?status=${s}`}
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
                  aria-label={`${pendingCount} ${t('filterPending').toLowerCase()}`}
                >
                  {pendingCount}
                </span>
              )}
              {s !== 'pending' && (
                <span className={isActive ? 'opacity-75' : 'opacity-50'}>
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {filtered.length === 0 ? (
        <EmptyState
          icon="📋"
          title={`${t('emptyTitlePrefix')} ${activeStatus !== 'all' ? STATUS_LABELS[activeStatus].toLowerCase() : ''}`}
          description={
            activeStatus === 'pending'
              ? t('emptyDescPending')
              : t('emptyDescOther')
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm" aria-label={t('title')}>
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th scope="col" className="px-4 py-3">{t('colCabin')}</th>
                <th scope="col" className="px-4 py-3">{t('colPeriod')}</th>
                <th scope="col" className="px-4 py-3">{t('colGuests')}</th>
                <th scope="col" className="px-4 py-3">{t('colTotal')}</th>
                <th scope="col" className="px-4 py-3">{t('colNotes')}</th>
                <th scope="col" className="px-4 py-3">{t('colStatus')}</th>
                <th scope="col" className="px-4 py-3">
                  <span className="sr-only">{t('colActions')}</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 font-medium text-gray-900">
                    {b.cabin.title}
                  </td>
                  <td className="px-4 py-4 text-gray-600">
                    <span className="whitespace-nowrap">{b.checkIn}</span>
                    <span className="mx-1 text-gray-400">→</span>
                    <span className="whitespace-nowrap">{b.checkOut}</span>
                  </td>
                  <td className="px-4 py-4 text-gray-600">{b.guestCount}</td>
                  <td className="px-4 py-4 font-medium text-pine-700">
                    {b.totalPrice} RON
                  </td>
                  <td className="px-4 py-4 text-gray-500 text-xs max-w-[160px]">
                    {b.notes ? (
                      <span className="line-clamp-2" title={b.notes}>{b.notes}</span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="px-4 py-4">
                    {b.status === 'pending' && (
                      <BookingActionButtons bookingId={b.id} />
                    )}
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
