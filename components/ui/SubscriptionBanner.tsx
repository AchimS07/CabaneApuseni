/**
 * components/ui/SubscriptionBanner.tsx
 * Client component: displays subscription status with upgrade / plan management actions.
 */
'use client';

import Link from 'next/link';
import type { SubscriptionTier, SubscriptionStatus } from '@/modules/users/domain/types';
import { useTranslations } from 'next-intl';
import { CheckCircleIcon, AlertTriangleIcon, XCircleIcon } from '@/components/ui/Icons';

interface SubscriptionBannerProps {
  tier: SubscriptionTier | null;
  status: SubscriptionStatus | null;
  expiresAt: string | null;
}

export function SubscriptionBanner({ tier, status, expiresAt }: SubscriptionBannerProps) {
  const t = useTranslations('subscriptionBanner');

  const expiryLabel = expiresAt
    ? new Date(expiresAt).toLocaleDateString()
    : null;

  if (status === 'active' && tier) {
    const planLabel = tier === 'basic' ? 'Basic' : 'Pro';
    return (
      <div
        role="status"
        aria-label={t('activeAriaLabel', { plan: planLabel })}
        className="flex flex-col gap-3 rounded-xl border border-pine-200 bg-pine-50 p-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3">
          <CheckCircleIcon size={20} className="shrink-0 text-pine-600" />
          <div>
            <p className="text-sm font-semibold text-pine-800">
              {t('activeTitle', { plan: planLabel })}
            </p>
            {expiryLabel && (
              <p className="text-xs text-pine-700">
                {t('renewsAt', { date: expiryLabel })}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {tier === 'basic' && (
            <Link
              href="/pricing"
              className="rounded-md border border-pine-300 bg-white px-3 py-1.5 text-xs font-medium text-pine-700 hover:bg-pine-50 focus:outline-none focus:ring-2 focus:ring-pine-500 focus:ring-offset-1"
            >
              {t('upgradeToPro')}
            </Link>
          )}
          <Link
            href="/pricing"
            className="rounded-md bg-pine-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-pine-700 focus:outline-none focus:ring-2 focus:ring-pine-500 focus:ring-offset-1"
          >
            {t('manageSubscription')}
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'past_due') {
    return (
      <div
        role="alert"
        className="flex flex-col gap-3 rounded-xl border border-earth-200 bg-earth-50 p-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3">
          <AlertTriangleIcon size={20} className="shrink-0 text-earth-600" />
          <div>
            <p className="text-sm font-semibold text-earth-800">{t('pastDueTitle')}</p>
            <p className="text-xs text-earth-700">
              {t('pastDueDescription')}
            </p>
          </div>
        </div>
        <Link
          href="/pricing"
          className="rounded-md bg-ember-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-ember-600 focus:outline-none focus:ring-2 focus:ring-ember-500 focus:ring-offset-1"
        >
          {t('renewPlan')}
        </Link>
      </div>
    );
  }

  // cancelled or null — no active subscription
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-center gap-3">
        <XCircleIcon size={20} className="shrink-0 text-red-500" />
        <div>
          <p className="text-sm font-semibold text-red-800">{t('noSubscriptionTitle')}</p>
          <p className="text-xs text-red-700">
            {t('noSubscriptionDescription')}
          </p>
        </div>
      </div>
      <Link
        href="/pricing"
        className="inline-block rounded-md bg-ember-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-ember-600 focus:outline-none focus:ring-2 focus:ring-ember-500 focus:ring-offset-1"
      >
        {t('choosePlan')}
      </Link>
    </div>
  );
}
