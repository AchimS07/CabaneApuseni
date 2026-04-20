/**
 * app/(public)/pricing/page.tsx
 */
import Link from 'next/link';
import type { Metadata } from 'next';
import { PLANS } from '@/lib/subscription/plans';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('pricingPage');
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    openGraph: {
      title: t('metaTitle'),
      description: t('metaDescription'),
      url: '/pricing',
      type: 'website',
    },
    twitter: {
      title: t('metaTitle'),
      description: t('metaDescription'),
    },
  };
}

export default async function PricingPage() {
  const t = await getTranslations('pricingPage');

  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
          {t('heading')}
        </h1>
        <p className="mt-3 text-lg text-gray-500">
          {t('subtitle')}
        </p>
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        {PLANS.map((plan) => (
          <article
            key={plan.id}
            className={
              'relative flex flex-col rounded-2xl border p-8 shadow-sm' +
              (plan.recommended
                ? ' border-pine-500 bg-white ring-2 ring-pine-500'
                : ' border-gray-200 bg-white')
            }
            aria-label={'Plan ' + plan.name}
          >
            {plan.recommended && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-pine-600 px-4 py-1 text-xs font-semibold text-white">
                  {t('recommended')}
                </span>
              </div>
            )}

            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
              <div className="mt-3 flex items-end gap-1">
                <span className="text-4xl font-extrabold text-gray-900">{plan.priceRon}</span>
                <span className="mb-1 text-lg font-medium text-gray-500">RON</span>
                <span className="mb-1 text-sm text-gray-400">{t('perMonth')}</span>
              </div>
            </div>

            <ul className="mb-8 flex-1 space-y-3" aria-label={t('featuresLabel', { name: plan.name })}>
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <span
                    aria-hidden="true"
                    className={f.included ? 'text-green-500' : 'text-gray-300'}
                  >
                    {f.included ? '✓' : '✗'}
                  </span>
                  <span className={f.included ? 'text-gray-700' : 'text-gray-400'}>
                    {f.label}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href={'/register/owner?plan=' + plan.id}
              className={
                'block rounded-lg px-6 py-3 text-center text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2' +
                (plan.recommended
                  ? ' bg-ember-500 text-white hover:bg-ember-600 focus:ring-ember-500'
                  : ' bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-700')
              }
            >
              {t('ctaPrefix')} {plan.name}
            </Link>
          </article>
        ))}
      </div>

      <p className="mt-10 text-center text-sm text-gray-500">
        {t('haveAccount')}{' '}
        <Link href="/login" className="font-medium text-pine-600 hover:underline">
          {t('signInLink')}
        </Link>{' '}
        {t('manageDashboard')}
      </p>
    </main>
  );
}
