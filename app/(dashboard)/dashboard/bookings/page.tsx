import { requireAuth } from '@/lib/auth/authorization';
import { getUserBookings } from '@/modules/bookings/application/bookingService';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { CancelBookingButton } from '@/components/ui/CancelBookingButton';
import type { Metadata } from 'next';
import type { BookingStatus } from '@/modules/bookings/domain/types';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('myBookings');
  return { title: t('metaTitle') };
}

export const dynamic = 'force-dynamic';

/** Statuses that can still be cancelled by the user */
const CANCELLABLE: BookingStatus[] = ['pending', 'confirmed'];

interface Props {
  searchParams: Promise<{ success?: string }>;
}

export default async function BookingsPage({ searchParams }: Props) {
  const session = await requireAuth();
  const [result, params] = await Promise.all([
    getUserBookings(session),
    searchParams,
  ]);
  const bookings = result.ok ? result.data : [];
  const showSuccess = params.success === '1';
  const t = await getTranslations('myBookings');

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">{t('title')}</h1>

      {/* Success notification after a new booking */}
      {showSuccess && (
        <div
          role="status"
          aria-live="polite"
          className="mb-6 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
        >
          <span aria-hidden="true" className="mt-0.5 shrink-0 text-base">✅</span>
          <p>
            <strong>{t('successTitle')}</strong> {t('successMessage')}
          </p>
        </div>
      )}

      {bookings.length === 0 ? (
        <EmptyState
          icon="📅"
          title={t('emptyTitle')}
          description={t('emptyDescription')}
          action={{ label: t('exploreCabins'), href: '/cabins' }}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">{t('cabin')}</th>
                <th className="px-4 py-3 font-medium">{t('period')}</th>
                <th className="px-4 py-3 font-medium">{t('guests')}</th>
                <th className="px-4 py-3 font-medium">{t('total')}</th>
                <th className="px-4 py-3 font-medium">{t('status')}</th>
                <th className="px-4 py-3 font-medium">
                  <span className="sr-only">{t('actions')}</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 font-medium text-gray-900">
                    {b.cabin.title}
                  </td>
                  <td className="px-4 py-4 text-gray-600">
                    <span className="whitespace-nowrap">
                      {b.checkIn}
                    </span>
                    <span className="mx-1 text-gray-400">→</span>
                    <span className="whitespace-nowrap">
                      {b.checkOut}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-gray-600">{b.guestCount}</td>
                  <td className="px-4 py-4 font-medium text-forest-700">
                    {b.totalPrice} RON
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="px-4 py-4">
                    {CANCELLABLE.includes(b.status) && (
                      <CancelBookingButton bookingId={b.id} />
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
