/**
 * lib/subscription/plans.ts
 * Subscription tier definitions, limits, and plan metadata.
 * Safe to import in both server and shared code.
 */

export type SubscriptionTier = 'basic' | 'pro';

export const LISTING_LIMITS: Record<SubscriptionTier, number> = { basic: 1, pro: 5 };
export const PHOTO_LIMITS: Record<SubscriptionTier, number> = { basic: 5, pro: 15 };

export interface Plan {
  id: SubscriptionTier;
  name: string;
  priceRon: number;
  stripePriceIdEnvKey: string;
  listingLimit: number;
  photoLimit: number;
  features: { label: string; included: boolean }[];
  recommended?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    priceRon: 50,
    stripePriceIdEnvKey: 'STRIPE_BASIC_PRICE_ID',
    listingLimit: 1,
    photoLimit: 5,
    features: [
      { label: '1 caban\u0103 activ\u0103', included: true },
      { label: '5 fotografii per listing', included: true },
      { label: 'Plasare standard \u00een c\u0103utare', included: true },
      { label: 'Badge "Recomandat"', included: false },
      { label: 'Analiz\u0103 rezerv\u0103ri', included: false },
      { label: 'Suport prioritar', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    priceRon: 150,
    stripePriceIdEnvKey: 'STRIPE_PRO_PRICE_ID',
    listingLimit: 5,
    photoLimit: 15,
    recommended: true,
    features: [
      { label: '5 cabane active', included: true },
      { label: '15 fotografii per listing', included: true },
      { label: 'Plasare boosted \u00een c\u0103utare', included: true },
      { label: 'Badge "Recomandat"', included: true },
      { label: 'Analiz\u0103 rezerv\u0103ri', included: true },
      { label: 'Suport prioritar', included: true },
    ],
  },
];

export function getTierFromStripePrice(priceId: string): SubscriptionTier | null {
  if (priceId === process.env.STRIPE_BASIC_PRICE_ID) return 'basic';
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return 'pro';
  return null;
}
