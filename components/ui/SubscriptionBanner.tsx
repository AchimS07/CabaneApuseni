/**
 * components/ui/SubscriptionBanner.tsx
 * Client component: displays subscription status with portal / upgrade actions.
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { SubscriptionTier, SubscriptionStatus } from '@/modules/users/domain/types';
import { useTranslations } from 'next-intl';

interface SubscriptionBannerProps {
  tier: SubscriptionTier | null;
  status: SubscriptionStatus | null;
  expiresAt: string | null;
}

export function SubscriptionBanner({ tier, status, expiresAt }: SubscriptionBannerProps) {
  const t = useTranslations('subscriptionBanner');
  const [loading, setLoading] = useState(false);

  async function openPortal() {
    setLoading(true);
    try {
      const res = await fetch('/api/subscriptions/portal', { method: 'POST' });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // silently fail — user remains on page
    } finally {
      setLoading(false);
    }
  }

  const expiryLabel = expiresAt
    ? new Date(expiresAt).toLocaleDateString()
    : null;

  if (status === 'active' && tier) {
    const planLabel = tier === 'basic' ? 'Basic' : 'Pro';
    return (
      <div
        role="status"
        aria-label={t('activeAriaLabel', { plan: planLabel })}
        className="flex flex-col gap-3 rounded-xl border border-green-200 bg-green-50 p-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl" aria-hidden="true">✅</span>
          <div>
            <p className="text-sm font-semibold text-green-800">
              {t('activeTitle', { plan: planLabel })}
            </p>
            {expiryLabel && (
              <p className="text-xs text-green-700">
                {t('renewsAt', { date: expiryLabel })}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {tier === 'basic' && (
            <Link
              href="/pricing"
              className="rounded-md border border-green-300 bg-white px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
            >
              {t('upgradeToPro')}
            </Link>
          )}
          <button
            onClick={openPortal}
            disabled={loading}
            aria-busy={loading}
            className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? t('opening') : t('manageSubscription')}
          </button>
        </div>
      </div>
    );
  }

  if (status === 'past_due') {
    return (
      <div
        role="alert"
        className="flex flex-col gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl" aria-hidden="true">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-yellow-800">{t('pastDueTitle')}</p>
            <p className="text-xs text-yellow-700">
              {t('pastDueDescription')}
            </p>
          </div>
        </div>
        <button
          onClick={openPortal}
          disabled={loading}
          aria-busy={loading}
          className="rounded-md bg-yellow-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? t('opening') : t('updatePayment')}
        </button>
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
        <span className="text-xl" aria-hidden="true">⛔</span>
        <div>
          <p className="text-sm font-semibold text-red-800">{t('noSubscriptionTitle')}</p>
          <p className="text-xs text-red-700">
            {t('noSubscriptionDescription')}
          </p>
        </div>
      </div>
      <Link
        href="/pricing"
        className="inline-block rounded-md bg-pine-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-pine-700 focus:outline-none focus:ring-2 focus:ring-pine-500 focus:ring-offset-1"
      >
        {t('choosePlan')}
      </Link>
    </div>
  );
}
