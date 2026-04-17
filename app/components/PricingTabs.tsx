'use client';

import { PricingCard, type PricingCardProps } from '@/components/ui/PricingCard';
import { useTranslations } from 'next-intl';

export function PricingTabs() {
  const t = useTranslations('pricing');

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

  return (
    <div>
      {/* Plans grid */}
      <div
        className="mx-auto grid max-w-3xl gap-8 sm:grid-cols-2"
        aria-label={t('ownersTabLabel')}
      >
        {ownerPlans.map((plan) => (
          <PricingCard key={plan.name} {...plan} />
        ))}
      </div>

      <p className="mt-8 text-center text-sm text-gray-500">
        {t('vatNote')}
      </p>
    </div>
  );
}
