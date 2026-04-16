'use client';

import { useState, useId, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBookingAction } from '@/modules/bookings/actions';
import { StarIcon, CalendarIcon, UsersIcon } from '@/components/ui/Icons';
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
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
}

function formatDate(iso: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const CLEANING_FEE = 0; // included
const PLATFORM_FEE_PCT = 0.12;

/**
 * AirBnb-inspired booking widget.
 * – Inline date range inputs styled as a connected block
 * – Guest counter popover with Adults/Children +/- counters
 * – Price breakdown with nights, cleaning fee, service fee, total
 * – "Nu ești taxat acum" note
 */
export default function BookingForm({ cabin, isAuthenticated }: BookingFormProps) {
  const t = useTranslations('booking');

  const router = useRouter();
  const formId = useId();

  const tomorrow = getTomorrow();

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [guestPopoverOpen, setGuestPopoverOpen] = useState(false);
  const guestPopoverRef = useRef<HTMLDivElement>(null);

  const guestCount = adults + children;

  // Close guest popover on outside click
  useEffect(() => {
    if (!guestPopoverOpen) return;
    function handler(e: MouseEvent) {
      if (guestPopoverRef.current && !guestPopoverRef.current.contains(e.target as Node)) {
        setGuestPopoverOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [guestPopoverOpen]);

  const nights = calcNights(checkIn, checkOut);
  const subtotal = nights * cabin.pricePerNight;
  const platformFee = Math.round(subtotal * PLATFORM_FEE_PCT);
  const totalPrice = subtotal + platformFee + CLEANING_FEE;

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

    if (!isAuthenticated) {
      const redirect = encodeURIComponent(`/cabins/${cabin.slug}`);
      router.push(`/login?redirect=${redirect}`);
      return;
    }

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
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card">

      {/* Price + rating header */}
      <div className="flex items-start justify-between">
        <p className="text-xl font-bold text-gray-900">
          {cabin.pricePerNight}{' '}
          <span className="text-base font-normal text-gray-500">{t('pricePerNight')}</span>
        </p>
        <span className="flex items-center gap-1 text-sm font-medium text-gray-700">
          <StarIcon size={14} className="text-gray-900" aria-hidden="true" />
          {t('newBadge')}
        </span>
      </div>

      <form id={formId} onSubmit={handleSubmit} noValidate className="mt-5">

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* Date range block */}
        <div className="overflow-hidden rounded-xl border border-gray-300">

          {/* Check-in */}
          <div
            className={[
              'flex flex-col border-b border-gray-300 px-3 py-3',
              fieldErrors.checkIn ? 'bg-red-50' : '',
            ].join(' ')}
          >
            <label
              htmlFor={`${formId}-checkin`}
              className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-900"
            >
              <CalendarIcon size={12} aria-hidden="true" />
              Check-in
            </label>
            <input
              id={`${formId}-checkin`}
              type="date"
              value={checkIn}
              min={tomorrow}
              onChange={(e) => {
                setCheckIn(e.target.value);
                if (checkOut && e.target.value >= checkOut) setCheckOut('');
              }}
              required
              aria-describedby={fieldErrors.checkIn ? `${formId}-checkin-err` : undefined}
              aria-invalid={!!fieldErrors.checkIn}
              className="bg-transparent text-sm text-gray-900 focus:outline-none"
            />
            {fieldErrors.checkIn && (
              <p id={`${formId}-checkin-err`} className="mt-1 text-xs text-red-600" role="alert">
                {fieldErrors.checkIn}
              </p>
            )}
          </div>

          {/* Check-out */}
          <div
            className={[
              'flex flex-col border-b border-gray-300 px-3 py-3',
              fieldErrors.checkOut ? 'bg-red-50' : '',
            ].join(' ')}
          >
            <label
              htmlFor={`${formId}-checkout`}
              className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-900"
            >
              <CalendarIcon size={12} aria-hidden="true" />
              Check-out
            </label>
            <input
              id={`${formId}-checkout`}
              type="date"
              value={checkOut}
              min={minCheckOut}
              onChange={(e) => setCheckOut(e.target.value)}
              required
              aria-describedby={fieldErrors.checkOut ? `${formId}-checkout-err` : undefined}
              aria-invalid={!!fieldErrors.checkOut}
              className="bg-transparent text-sm text-gray-900 focus:outline-none"
            />
            {fieldErrors.checkOut && (
              <p id={`${formId}-checkout-err`} className="mt-1 text-xs text-red-600" role="alert">
                {fieldErrors.checkOut}
              </p>
            )}
          </div>

          {/* Guests popover trigger */}
          <div ref={guestPopoverRef} className="relative">
            <button
              type="button"
              onClick={() => setGuestPopoverOpen((o) => !o)}
              aria-expanded={guestPopoverOpen}
              aria-haspopup="dialog"
              aria-controls={`${formId}-guest-popover`}
              className="flex w-full flex-col px-3 py-3 text-left focus:outline-none"
            >
              <span className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-900">
                <UsersIcon size={12} aria-hidden="true" />
                {t('guests')}
              </span>
              <span className="text-sm text-gray-900">
                {guestCount} {guestCount === 1 ? t('guestSingular') : t('guestPlural')}
              </span>
            </button>

            {guestPopoverOpen && (
              <div
                id={`${formId}-guest-popover`}
                role="dialog"
                aria-label={t('selectGuestsAriaLabel')}
                className="absolute bottom-[calc(100%+4px)] left-0 right-0 z-20 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl"
              >
                {/* Adults */}
                <GuestCounter
                  label={t('adults')}
                  sublabel={t('adultsAge')}
                  value={adults}
                  min={1}
                  max={cabin.maxGuests - children}
                  onChange={setAdults}
                  decreaseAriaLabel={t('decreaseLabel', { label: t('adults') })}
                  increaseAriaLabel={t('increaseLabel', { label: t('adults') })}
                />
                {/* Children */}
                <GuestCounter
                  label={t('children')}
                  sublabel={t('childrenAge')}
                  value={children}
                  min={0}
                  max={cabin.maxGuests - adults}
                  onChange={setChildren}
                  decreaseAriaLabel={t('decreaseLabel', { label: t('children') })}
                  increaseAriaLabel={t('increaseLabel', { label: t('children') })}
                />
                {fieldErrors.guestCount && (
                  <p className="mt-2 text-xs text-red-600" role="alert">
                    {fieldErrors.guestCount}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => setGuestPopoverOpen(false)}
                  className="mt-4 w-full text-right text-sm font-semibold text-gray-900 underline"
                >
                  {t('applyGuests')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="mt-4 flex flex-col gap-1">
          <label htmlFor={`${formId}-notes`} className="text-xs font-medium text-gray-700">
            {t('notes')}{' '}
            <span className="font-normal text-gray-400">{t('notesOptional')}</span>
          </label>
          <textarea
            id={`${formId}-notes`}
            rows={2}
            maxLength={500}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('notesPlaceholder')}
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          />
        </div>

        {/* Reserve button */}
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-xl bg-brand py-4 text-base font-bold text-white shadow-sm transition hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {t('processing')}
            </span>
          ) : isAuthenticated ? (
            t('bookNow')
          ) : (
            t('loginToBook')
          )}
        </button>

        <p className="mt-2 text-center text-xs text-gray-500">
          {t('notChargedNow')}
        </p>

        {/* Price breakdown */}
        {nights > 0 && (
          <div className="mt-5 space-y-3 border-t border-gray-100 pt-5 text-sm">
            <div className="flex justify-between text-gray-700">
              <span>
                {cabin.pricePerNight} RON × {nights}{' '}
                {nights === 1 ? t('nightSingular') : t('nightPlural')}
              </span>
              <span>{subtotal} RON</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>{t('cleaningFee')}</span>
              <span>{t('included')}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>{t('serviceFee', { pct: Math.round(PLATFORM_FEE_PCT * 100) })}</span>
              <span>{platformFee} RON</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-3 font-bold text-gray-900">
              <span>{t('total')}</span>
              <span>{totalPrice} RON</span>
            </div>
            {checkIn && checkOut && (
              <p className="text-xs text-gray-400">
                {formatDate(checkIn)} – {formatDate(checkOut)}
              </p>
            )}
          </div>
        )}
      </form>

      {/* Report link */}
      <p className="mt-5 text-center text-xs text-gray-400">
        <button
          type="button"
          className="underline transition hover:text-gray-600"
        >
          {t('reportListing')}
        </button>
      </p>
    </div>
  );
}

// ── GuestCounter sub-component ────────────────────────────────────────────────

interface GuestCounterProps {
  label: string;
  sublabel: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  decreaseAriaLabel?: string;
  increaseAriaLabel?: string;
}

function GuestCounter({ label, sublabel, value, min, max, onChange, decreaseAriaLabel, increaseAriaLabel }: GuestCounterProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{sublabel}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={decreaseAriaLabel ?? `Decrease ${label.toLowerCase()}`}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition hover:border-gray-900 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <span aria-hidden="true" className="text-lg leading-none">−</span>
        </button>
        <span
          className="w-5 text-center text-sm font-medium"
          aria-live="polite"
          aria-atomic="true"
        >
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label={increaseAriaLabel ?? `Increase ${label.toLowerCase()}`}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition hover:border-gray-900 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <span aria-hidden="true" className="text-lg leading-none">+</span>
        </button>
      </div>
    </div>
  );
}

