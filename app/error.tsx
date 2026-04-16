'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorPageProps) {
  const t = useTranslations('errors');

  useEffect(() => {
    // TODO: log to Sentry
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-bold text-red-600">{t('title')}</h1>
      <p className="text-gray-600">
        {error.message || t('title')}
      </p>
      <button
        onClick={reset}
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {t('retry')}
      </button>
    </main>
  );
}
