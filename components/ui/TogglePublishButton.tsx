'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { togglePublishAction } from '@/modules/cabins/actions';
import { useTranslations } from 'next-intl';

interface TogglePublishButtonProps {
  cabinId: string;
  published: boolean;
}

/**
 * Button that toggles a cabin's published state.
 */
export function TogglePublishButton({ cabinId, published }: TogglePublishButtonProps) {
  const router = useRouter();
  const t = useTranslations('ownerListings');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleToggle() {
    setLoading(true);
    setError('');
    try {
      const result = await togglePublishAction(cabinId, !published);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    } catch {
      setError(t('toggleError'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleToggle}
        disabled={loading}
        className={[
          'rounded-md px-3 py-1.5 text-xs font-medium transition',
          'focus:outline-none focus:ring-2 focus:ring-offset-1',
          'disabled:cursor-not-allowed disabled:opacity-50',
          published
            ? 'border border-gray-300 text-gray-600 hover:bg-gray-50 focus:ring-gray-400'
            : 'border border-green-300 text-green-700 hover:bg-green-50 focus:ring-green-500',
        ].join(' ')}
        aria-label={published ? t('unpublishCabin') : t('publishCabin')}
      >
        {loading ? t('publishing') : published ? t('unpublish') : t('publish')}
      </button>
      {error && (
        <p className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
