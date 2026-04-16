'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { setLocale } from '@/lib/i18n/setLocale';
import { locales, type Locale } from '@/i18n/config';

export function LanguageSwitcher() {
  const t = useTranslations('languageSwitcher');
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();

  function handleChange(next: Locale) {
    if (next === locale) return;
    startTransition(() => {
      setLocale(next);
    });
  }

  return (
    <div className="flex items-center gap-1" aria-label={t('label')}>
      {locales.map((l) => (
        <button
          key={l}
          onClick={() => handleChange(l)}
          disabled={isPending}
          aria-current={locale === l ? 'true' : undefined}
          className={[
            'rounded px-2 py-1 text-xs font-semibold uppercase transition',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500',
            'disabled:opacity-50',
            locale === l
              ? 'bg-indigo-600 text-white'
              : 'text-gray-600 hover:bg-gray-100',
          ].join(' ')}
        >
          {t(l)}
        </button>
      ))}
    </div>
  );
}
