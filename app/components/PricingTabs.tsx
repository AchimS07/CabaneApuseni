'use client';

import { useState } from 'react';
import { PricingCard, type PricingCardProps } from '@/components/ui/PricingCard';

type Audience = 'clients' | 'owners';

const clientPlans: PricingCardProps[] = [
  {
    name: 'Gratuit',
    price: '0 lei',
    period: 'lună',
    description: 'Perfect pentru a descoperi platforma fără niciun cost.',
    features: [
      { text: 'Browsing cabane nelimitat', included: true },
      { text: 'Vizualizare disponibilitate', included: true },
      { text: 'Până la 2 rezervări / lună', included: true },
      { text: 'Suport standard (e-mail)', included: true },
      { text: 'Rezervări nelimitate', included: false },
      { text: 'Reduceri de sezon', included: false },
      { text: 'Acces anticipat la cabane noi', included: false },
      { text: 'Suport prioritar', included: false },
    ],
    ctaLabel: 'Începe gratuit',
    ctaHref: '/register',
  },
  {
    name: 'Explorer',
    price: '29 lei',
    period: 'lună',
    description: 'Pentru turiștii activi care rezervă frecvent.',
    features: [
      { text: 'Browsing cabane nelimitat', included: true },
      { text: 'Vizualizare disponibilitate', included: true },
      { text: 'Rezervări nelimitate', included: true },
      { text: 'Suport prioritar (chat)', included: true },
      { text: 'Acces anticipat la cabane noi', included: true },
      { text: 'Reduceri de sezon', included: true },
      { text: 'Oferte exclusive cabane premium', included: false },
      { text: 'Serviciu concierge personal', included: false },
    ],
    ctaLabel: 'Alege Explorer',
    ctaHref: '/register?plan=explorer',
    highlighted: true,
    badge: 'Recomandat',
  },
  {
    name: 'Premium',
    price: '69 lei',
    period: 'lună',
    description: 'Experiență completă cu beneficii exclusive.',
    features: [
      { text: 'Browsing cabane nelimitat', included: true },
      { text: 'Vizualizare disponibilitate', included: true },
      { text: 'Rezervări nelimitate', included: true },
      { text: 'Suport prioritar 24/7', included: true },
      { text: 'Acces anticipat la cabane noi', included: true },
      { text: 'Reduceri de sezon', included: true },
      { text: 'Oferte exclusive cabane premium', included: true },
      { text: 'Serviciu concierge personal', included: true },
    ],
    ctaLabel: 'Alege Premium',
    ctaHref: '/register?plan=premium',
  },
];

const ownerPlans: PricingCardProps[] = [
  {
    name: 'Starter',
    price: '0 lei',
    period: 'lună',
    description: 'Listează prima ta cabană și descoperă platforma.',
    features: [
      { text: '1 cabană activă', included: true },
      { text: 'Calendar disponibilitate', included: true },
      { text: 'Gestionare rezervări', included: true },
      { text: 'Statistici de bază', included: true },
      { text: 'Comision standard 12%', included: true },
      { text: 'Plasare prioritară în căutări', included: false },
      { text: 'Statistici avansate', included: false },
      { text: 'Suport dedicat', included: false },
    ],
    ctaLabel: 'Listează gratuit',
    ctaHref: '/register?role=owner',
  },
  {
    name: 'Pro',
    price: '99 lei',
    period: 'lună',
    description: 'Pentru proprietarii cu mai multe cabane.',
    features: [
      { text: 'Până la 5 cabane active', included: true },
      { text: 'Calendar disponibilitate', included: true },
      { text: 'Gestionare rezervări', included: true },
      { text: 'Statistici avansate', included: true },
      { text: 'Comision redus 8%', included: true },
      { text: 'Plasare prioritară în căutări', included: true },
      { text: 'Insignă „Proprietar verificat"', included: true },
      { text: 'Suport dedicat', included: false },
    ],
    ctaLabel: 'Alege Pro',
    ctaHref: '/register?role=owner&plan=pro',
    highlighted: true,
    badge: 'Cel mai popular',
  },
  {
    name: 'Business',
    price: '249 lei',
    period: 'lună',
    description: 'Soluția completă pentru portofolii mari.',
    features: [
      { text: 'Cabane nelimitate', included: true },
      { text: 'Calendar disponibilitate', included: true },
      { text: 'Gestionare rezervări', included: true },
      { text: 'Statistici avansate + rapoarte', included: true },
      { text: 'Comision minim 5%', included: true },
      { text: 'Plasare prioritară & featured', included: true },
      { text: 'Insignă „Proprietar verificat"', included: true },
      { text: 'Suport dedicat & account manager', included: true },
    ],
    ctaLabel: 'Alege Business',
    ctaHref: '/register?role=owner&plan=business',
  },
];

export function PricingTabs() {
  const [audience, setAudience] = useState<Audience>('clients');

  const plans = audience === 'clients' ? clientPlans : ownerPlans;

  return (
    <div>
      {/* Toggle */}
      <div className="mb-12 flex justify-center">
        <div
          className="inline-flex rounded-xl border border-gray-200 bg-gray-100 p-1"
          role="tablist"
          aria-label="Selectează tipul de cont"
        >
          <button
            role="tab"
            aria-selected={audience === 'clients'}
            onClick={() => setAudience('clients')}
            className={[
              'rounded-lg px-6 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
              audience === 'clients'
                ? 'bg-white text-indigo-700 shadow'
                : 'text-gray-600 hover:text-gray-900',
            ].join(' ')}
          >
            🏕️ Pentru turiști
          </button>
          <button
            role="tab"
            aria-selected={audience === 'owners'}
            onClick={() => setAudience('owners')}
            className={[
              'rounded-lg px-6 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
              audience === 'owners'
                ? 'bg-white text-indigo-700 shadow'
                : 'text-gray-600 hover:text-gray-900',
            ].join(' ')}
          >
            🏠 Pentru proprietari
          </button>
        </div>
      </div>

      {/* Plans grid */}
      <div
        role="tabpanel"
        aria-label={
          audience === 'clients'
            ? 'Planuri pentru turiști'
            : 'Planuri pentru proprietari'
        }
        className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
      >
        {plans.map((plan) => (
          <PricingCard key={plan.name} {...plan} />
        ))}
      </div>

      <p className="mt-8 text-center text-sm text-gray-500">
        Toate prețurile includ TVA. Poți anula oricând, fără penalizări.
      </p>
    </div>
  );
}
