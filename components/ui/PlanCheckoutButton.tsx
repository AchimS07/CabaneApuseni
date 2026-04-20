/**
 * components/ui/PlanCheckoutButton.tsx
 * Client component: initiates a Stripe Checkout session for an authenticated owner.
 * Used on the pricing page when the user is already logged in as an owner.
 */
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { SubscriptionTier } from '@/lib/subscription/plans';

interface PlanCheckoutButtonProps {
  planId: SubscriptionTier;
  recommended?: boolean;
}

export function PlanCheckoutButton({ planId, recommended = false }: PlanCheckoutButtonProps) {
  const t = useTranslations('pricingPage');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        // Keep button in loading/disabled state while redirect is in progress
        window.location.href = data.url;
        return;
      }
      setError(data.error ?? t('checkoutError'));
    } catch {
      setError(t('checkoutError'));
    }
    setLoading(false);
  }

  return (
    <div className="mt-auto">
      <button
        onClick={handleCheckout}
        disabled={loading}
        aria-busy={loading}
        className={[
          'block w-full rounded-lg px-6 py-3 text-center text-sm font-semibold transition',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-60',
          recommended
            ? 'bg-ember-500 text-white hover:bg-ember-600 focus:ring-ember-500'
            : 'bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-700',
        ].join(' ')}
      >
        {loading ? t('subscribing') : t('subscribeTo', { name: planId === 'basic' ? 'Basic' : 'Pro' })}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-center text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
