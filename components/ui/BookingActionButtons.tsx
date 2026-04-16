'use client';

import { useState } from 'react';
import { confirmBookingAction, rejectBookingAction } from '@/modules/bookings/actions';
import { useTranslations } from 'next-intl';

interface BookingActionButtonsProps {
  bookingId: string;
}

/**
 * Confirm / reject buttons for owner booking inbox.
 * Only rendered for pending bookings.
 * Shows inline success state after each action instead of a silent refresh.
 */
export function BookingActionButtons({ bookingId }: BookingActionButtonsProps) {
  const t = useTranslations('ownerBookings');
  const [loadingConfirm, setLoadingConfirm] = useState(false);
  const [loadingReject, setLoadingReject] = useState(false);
  const [error, setError] = useState('');
  const [outcome, setOutcome] = useState<'confirmed' | 'rejected' | null>(null);

  async function handleConfirm() {
    setLoadingConfirm(true);
    setError('');
    try {
      const result = await confirmBookingAction(bookingId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOutcome('confirmed');
    } catch {
      setError(t('actionError'));
    } finally {
      setLoadingConfirm(false);
    }
  }

  async function handleReject() {
    const confirmed = window.confirm(t('confirmReject'));
    if (!confirmed) return;

    setLoadingReject(true);
    setError('');
    try {
      const result = await rejectBookingAction(bookingId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOutcome('rejected');
    } catch {
      setError(t('actionError'));
    } finally {
      setLoadingReject(false);
    }
  }

  if (outcome === 'confirmed') {
    return (
      <span className="text-xs font-medium text-green-700" role="status">
        ✓ Confirmată
      </span>
    );
  }

  if (outcome === 'rejected') {
    return (
      <span className="text-xs font-medium text-red-600" role="status">
        ✗ Refuzată
      </span>
    );
  }

  const busy = loadingConfirm || loadingReject;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-2">
        <button
          onClick={handleConfirm}
          disabled={busy}
          className="rounded-md border border-green-300 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={t('confirmBooking')}
        >
          {loadingConfirm ? t('confirming') : t('confirm')}
        </button>
        <button
          onClick={handleReject}
          disabled={busy}
          className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={t('rejectBooking')}
        >
          {loadingReject ? t('rejecting') : t('reject')}
        </button>
      </div>
      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
