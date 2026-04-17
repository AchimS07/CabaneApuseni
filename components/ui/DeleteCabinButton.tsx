'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { deleteCabinAction } from '@/modules/cabins/actions';

interface DeleteCabinButtonProps {
  cabinId: string;
  cabinTitle: string;
}

/**
 * Danger button that deletes a cabin listing after confirmation.
 * Only shown in the owner listings table.
 */
export function DeleteCabinButton({ cabinId, cabinTitle }: DeleteCabinButtonProps) {
  const t = useTranslations('deleteCabin');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleDelete() {
    const confirmed = window.confirm(t('confirmMessage', { title: cabinTitle }));
    if (!confirmed) return;

    setLoading(true);
    setError('');
    try {
      const result = await deleteCabinAction(cabinId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    } catch {
      setError(t('errorGeneric'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={t('ariaLabel', { title: cabinTitle })}
      >
        {loading ? t('deleting') : t('delete')}
      </button>
      {error && (
        <p className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
