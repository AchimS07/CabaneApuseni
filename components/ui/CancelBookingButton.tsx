'use client';

import { useState } from 'react';
import { cancelBookingAction } from '@/modules/bookings/actions';
import { useTranslations } from 'next-intl';

interface CancelBookingButtonProps {
  bookingId: string;
}

/**
 * Button that cancels a booking after a browser confirmation prompt.
 * Shows a success message on completion; shows an error if it fails.
 */
export function CancelBookingButton({ bookingId }: CancelBookingButtonProps) {
  const t = useTranslations('myBookings');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleCancel() {
    const confirmed = window.confirm(t('confirmCancel'));
    if (!confirmed) return;

    setLoading(true);
    setError('');
    try {
      const result = await cancelBookingAction(bookingId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSuccess(true);
    } catch {
      setError(t('cancelError'));
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <span className="text-xs font-medium text-green-700" role="status">
        ✓ Anulată
      </span>
    );
  }

  return (
    <div>
      <button
        onClick={handleCancel}
        disabled={loading}
        className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={t('cancelBooking')}
      >
        {loading ? t('cancelling') : t('cancel')}
      </button>
      {error && (
        <p className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
