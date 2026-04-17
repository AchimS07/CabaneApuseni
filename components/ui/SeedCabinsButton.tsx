'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { seedMockCabinsAction } from '@/modules/cabins/actions';

/**
 * Admin-only button that seeds the 3 mock cabins into Firestore.
 * Idempotent — already-existing cabins are skipped.
 */
export function SeedCabinsButton() {
  const t = useTranslations('seedCabins');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  async function handleSeed() {
    setLoading(true);
    setMessage('');
    setIsError(false);
    try {
      const result = await seedMockCabinsAction();
      if (!result.ok) {
        setIsError(true);
        setMessage(result.error);
        return;
      }
      const { seeded, skipped } = result;
      if (seeded === 0) {
        setMessage(t('allExisted', { skipped }));
      } else {
        setMessage(t('added', { seeded, suffix: skipped > 0 ? t('skippedSuffix', { skipped }) : '' }));
        router.refresh();
      }
    } catch {
      setIsError(true);
      setMessage(t('errorGeneric'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleSeed}
        disabled={loading}
        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pine-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={t('ariaLabel')}
      >
        {loading ? t('adding') : t('buttonText')}
      </button>
      {message && (
        <p
          className={`text-xs ${isError ? 'text-red-600' : 'text-green-700'}`}
          role="status"
          aria-live="polite"
        >
          {message}
        </p>
      )}
    </div>
  );
}
