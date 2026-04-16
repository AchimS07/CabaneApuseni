'use client';

import { useState, useId } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createBookingAction } from '@/modules/bookings/actions';
import { useTranslations } from 'next-intl';

interface BookingFormProps {
  cabin: {
    id: string;
    slug: string;
    maxGuests: number;
    pricePerNight: number;
  };
  isAuthenticated: boolean;
}

function getTomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function calcNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const diff =
    new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Booking form for the cabin detail page.
 * - If the user is not authenticated, clicking "Rezervă" redirects to /login with a redirect param.
 * - If authenticated, submits to the createBookingAction server action.
 */
export default function BookingForm({ cabin, isAuthenticated }: BookingFormProps) {
  const router = useRouter();
  const formId = useId();
  const t = useTranslations('booking');

  const tomorrow = getTomorrow();

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guestCount, setGuestCount] = useState(1);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const nights = calcNights(checkIn, checkOut);
  const totalPrice = nights * cabin.pricePerNight;

  const minCheckOut = checkIn
    ? (() => {
        const d = new Date(checkIn);
        d.setDate(d.getDate() + 1);
        return d.toISOString().split('T')[0];
      })()
    : tomorrow;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    // If not authenticated, redirect to login with a return path
    if (!isAuthenticated) {
      const redirect = encodeURIComponent(`/cabins/${cabin.slug}`);
      router.push(`/login?redirect=${redirect}`);
      return;
    }

    // Basic client-side validation
    const errs: Record<string, string> = {};
    if (!checkIn) errs.checkIn = t('errors.checkInRequired');
    if (!checkOut) errs.checkOut = t('errors.checkOutRequired');
    if (checkIn && checkOut && new Date(checkOut) <= new Date(checkIn)) {
      errs.checkOut = t('errors.checkOutAfterCheckIn');
    }
    if (guestCount < 1) errs.guestCount = t('errors.minOneGuest');
    if (guestCount > cabin.maxGuests) {
      errs.guestCount = t('errors.maxGuests', { max: cabin.maxGuests });
    }
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const result = await createBookingAction({
        cabinId: cabin.id,
        checkIn,
        checkOut,
        guestCount,
        notes: notes || undefined,
      });

      if (!result.ok) {
        if (result.error === 'Authentication required.') {
          const redirect = encodeURIComponent(`/cabins/${cabin.slug}`);
          router.push(`/login?redirect=${redirect}`);
          return;
        }
        setError(result.error);
        // Surface field-level errors from the service
        if (result.details) {
          const flat: Record<string, string> = {};
          for (const [k, v] of Object.entries(result.details)) {
            if (v?.[0]) flat[k] = v[0];
          }
          setFieldErrors(flat);
        }
        return;
      }

      router.push('/dashboard/bookings?success=1');
    } catch {
      setError(t('errors.generic'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
      <p className="text-2xl font-bold text-gray-900">
        <span className="text-forest-700">{cabin.pricePerNight}</span>{' '}
        <span className="text-base font-normal text-gray-500">{t('pricePerNight')}</span>
      </p>

      <form
        id={formId}
        onSubmit={handleSubmit}
        noValidate
        className="mt-5 flex flex-col gap-4"
      >
        {error && (
          <div
            role="alert"
            className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Input
            label={t('checkIn')}
            id={`${formId}-checkin`}
            type="date"
            value={checkIn}
            min={tomorrow}
            onChange={(e) => {
              setCheckIn(e.target.value);
              // Reset checkout if it's no longer valid
              if (checkOut && e.target.value >= checkOut) setCheckOut('');
            }}
            required
            error={fieldErrors.checkIn}
          />
          <Input
            label={t('checkOut')}
            id={`${formId}-checkout`}
            type="date"
            value={checkOut}
            min={minCheckOut}
            onChange={(e) => setCheckOut(e.target.value)}
            required
            error={fieldErrors.checkOut}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor={`${formId}-guests`}
            className="text-sm font-medium text-gray-700"
          >
            {t('guests')}{' '}
            <span className="text-gray-400">
              {t('guestsMax', { max: cabin.maxGuests })}
            </span>
          </label>
          <input
            id={`${formId}-guests`}
            type="number"
            min={1}
            max={cabin.maxGuests}
            value={guestCount}
            onChange={(e) => setGuestCount(Number(e.target.value))}
            required
            aria-describedby={
              fieldErrors.guestCount ? `${formId}-guests-error` : undefined
            }
            aria-invalid={!!fieldErrors.guestCount}
            className={[
              'rounded-xl border px-3 py-2 text-sm shadow-sm transition',
              'focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-forest-500',
              fieldErrors.guestCount
                ? 'border-red-400 focus:ring-red-400'
                : 'border-gray-300',
            ].join(' ')}
          />
          {fieldErrors.guestCount && (
            <p
              id={`${formId}-guests-error`}
              className="text-xs text-red-600"
              role="alert"
            >
              {fieldErrors.guestCount}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor={`${formId}-notes`}
            className="text-sm font-medium text-gray-700"
          >
            {t('notes')}{' '}
            <span className="text-gray-400">{t('notesOptional')}</span>
          </label>
          <textarea
            id={`${formId}-notes`}
            rows={3}
            maxLength={500}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('notesPlaceholder')}
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm shadow-sm transition placeholder:text-gray-400 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500"
          />
        </div>

        {/* Price breakdown */}
        {nights > 0 && (
          <div className="rounded-xl bg-forest-50 px-4 py-3 text-sm">
            <div className="flex justify-between text-gray-700">
              <span>
                {cabin.pricePerNight} RON × {nights}{' '}
                {nights === 1 ? t('nightSingular') : t('nightPlural')}
              </span>
              <span>{totalPrice} RON</span>
            </div>
            <div className="mt-1 flex justify-between font-semibold text-gray-900">
              <span>{t('total')}</span>
              <span>{totalPrice} RON</span>
            </div>
          </div>
        )}

        <Button
          type="submit"
          loading={loading}
          size="lg"
          className="w-full"
        >
          {isAuthenticated ? t('bookNow') : t('loginToBook')}
        </Button>

        {!isAuthenticated && (
          <p className="text-center text-xs text-gray-500">
            {t('redirectToLogin')}
          </p>
        )}
      </form>
    </div>
  );
}
