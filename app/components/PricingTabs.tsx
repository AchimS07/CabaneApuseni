'use client';

import { useState } from 'react';
import { PricingCard, type PricingCardProps } from '@/components/ui/PricingCard';
import { useTranslations } from 'next-intl';

type Audience = 'clients' | 'owners';

export function PricingTabs() {
  const t = useTranslations('pricing');
  const [audience, setAudience] = useState<Audience>('clients');

  const clientPlans: PricingCardProps[] = [
    {
      name: t('free.name'),
      price: t('free.price'),
      period: t('period'),
      description: t('free.description'),
      features: [
        { text: t('free.f1'), included: true },
        { text: t('free.f2'), included: true },
        { text: t('free.f3'), included: true },
        { text: t('free.f4'), included: true },
        { text: t('free.f5'), included: false },
        { text: t('free.f6'), included: false },
        { text: t('free.f7'), included: false },
        { text: t('free.f8'), included: false },
      ],
      ctaLabel: t('free.cta'),
      ctaHref: '/register',
    },
    {
      name: t('explorer.name'),
      price: t('explorer.price'),
      period: t('period'),
      description: t('explorer.description'),
      features: [
        { text: t('explorer.f1'), included: true },
        { text: t('explorer.f2'), included: true },
        { text: t('explorer.f3'), included: true },
        { text: t('explorer.f4'), included: true },
        { text: t('explorer.f5'), included: true },
        { text: t('explorer.f6'), included: true },
        { text: t('explorer.f7'), included: false },
        { text: t('explorer.f8'), included: false },
      ],
      ctaLabel: t('explorer.cta'),
      ctaHref: '/register?plan=explorer',
      highlighted: true,
      badge: t('recommended'),
    },
    {
      name: t('premium.name'),
      price: t('premium.price'),
      period: t('period'),
      description: t('premium.description'),
      features: [
        { text: t('premium.f1'), included: true },
        { text: t('premium.f2'), included: true },
        { text: t('premium.f3'), included: true },
        { text: t('premium.f4'), included: true },
        { text: t('premium.f5'), included: true },
        { text: t('premium.f6'), included: true },
        { text: t('premium.f7'), included: true },
        { text: t('premium.f8'), included: true },
      ],
      ctaLabel: t('premium.cta'),
      ctaHref: '/register?plan=premium',
    },
  ];

  const ownerPlans: PricingCardProps[] = [
    {
      name: t('basic.name'),
      price: t('basic.price'),
      period: t('period'),
      description: t('basic.description'),
      features: [
        { text: t('basic.f1'), included: true },
        { text: t('basic.f2'), included: true },
        { text: t('basic.f3'), included: true },
        { text: t('basic.f4'), included: true },
        { text: t('basic.f5'), included: false },
        { text: t('basic.f6'), included: false },
        { text: t('basic.f7'), included: false },
      ],
      ctaLabel: t('basic.cta'),
      ctaHref: '/register/owner?plan=basic',
    },
    {
      name: t('pro.name'),
      price: t('pro.price'),
      period: t('period'),
      description: t('pro.description'),
      features: [
        { text: t('pro.f1'), included: true },
        { text: t('pro.f2'), included: true },
        { text: t('pro.f3'), included: true },
        { text: t('pro.f4'), included: true },
        { text: t('pro.f5'), included: true },
        { text: t('pro.f6'), included: true },
        { text: t('pro.f7'), included: true },
      ],
      ctaLabel: t('pro.cta'),
      ctaHref: '/register/owner?plan=pro',
      highlighted: true,
      badge: t('recommended'),
    },
  ];

  const plans = audience === 'clients' ? clientPlans : ownerPlans;

  return (
    <div>
      {/* Toggle */}
      <div className="mb-12 flex justify-center">
        <div
          className="inline-flex rounded-xl border border-gray-200 bg-gray-100 p-1"
          role="tablist"
          aria-label={t('tabsLabel')}
        >
          <button
            role="tab"
            aria-selected={audience === 'clients'}
            onClick={() => setAudience('clients')}
            className={[
              'rounded-lg px-6 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-pine-500',
              audience === 'clients'
                ? 'bg-white text-pine-700 shadow'
                : 'text-gray-600 hover:text-gray-900',
            ].join(' ')}
          >
            {t('forTourists')}
          </button>
          <button
            role="tab"
            aria-selected={audience === 'owners'}
            onClick={() => setAudience('owners')}
            className={[
              'rounded-lg px-6 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-pine-500',
              audience === 'owners'
                ? 'bg-white text-pine-700 shadow'
                : 'text-gray-600 hover:text-gray-900',
            ].join(' ')}
          >
            {t('forOwners')}
          </button>
        </div>
      </div>

      {/* Plans grid */}
      <div
        role="tabpanel"
        aria-label={
          audience === 'clients' ? t('touristsTabLabel') : t('ownersTabLabel')
        }
        className={
          audience === 'owners'
            ? 'mx-auto grid max-w-3xl gap-8 sm:grid-cols-2'
            : 'grid gap-8 sm:grid-cols-2 lg:grid-cols-3'
        }
      >
        {plans.map((plan) => (
          <PricingCard key={plan.name} {...plan} />
        ))}
      </div>

      <p className="mt-8 text-center text-sm text-gray-500">
        {t('vatNote')}
      </p>
    </div>
  );
}
