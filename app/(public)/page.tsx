import Link from 'next/link';
import type { Metadata } from 'next';
import { PricingTabs } from '@/app/components/PricingTabs';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('home.meta');
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function HomePage() {
  const t = await getTranslations('home');
  const tTrust = await getTranslations('home.trust');

  return (
    <main>
      {/* Hero */}
      <section className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-forest-900 via-forest-700 to-forest-500 px-4 text-center text-white">
        {/* Decorative blobs */}
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden="true"
        >
          <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-forest-400/20 blur-3xl" />
          <div className="absolute -bottom-32 right-0 h-[28rem] w-[28rem] rounded-full bg-earth-500/20 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <span className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm">
            🏔️ Munții Apuseni, România
          </span>

          <h1 className="mb-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            {t('hero.title')}
          </h1>

          <p className="mb-8 text-lg leading-relaxed text-white/80 sm:text-xl">
            {t('hero.subtitle')}
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/cabins" className="btn-primary bg-white text-forest-700 hover:bg-forest-50 text-base px-8 py-3.5 shadow-lg">
              {t('hero.exploreCabins')}
            </Link>
            <Link href="#pricing" className="btn-secondary border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm text-base px-8 py-3.5">
              {t('hero.viewPricing')}
            </Link>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0" aria-hidden="true">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60 C360 0 1080 0 1440 60 L1440 60 L0 60 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Category chips */}
      <section className="border-b bg-white px-4 py-5" aria-label="Categorii">
        <div className="mx-auto flex max-w-6xl items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((c) => (
            <Link
              key={c.label}
              href="/cabins"
              className="flex shrink-0 flex-col items-center gap-1 rounded-xl px-4 py-2 text-xs font-medium text-gray-500 transition hover:bg-forest-50 hover:text-forest-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-500"
            >
              <span className="text-2xl" aria-hidden="true">{c.icon}</span>
              <span>{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Why us */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="mb-3 text-center section-title">
          {t('features.heading')}
        </h2>
        <p className="mb-12 text-center text-gray-500">
          {t('features.subtitle')}
        </p>

        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { icon: '🏔️', title: t('features.nature.title'), description: t('features.nature.description') },
            { icon: '🔥', title: t('features.comfort.title'), description: t('features.comfort.description') },
            { icon: '📅', title: t('features.booking.title'), description: t('features.booking.description') },
          ].map((f) => (
            <article
              key={f.title}
              className="rounded-2xl border border-gray-100 bg-white p-8 shadow-card transition hover:shadow-card-hover"
            >
              <span
                className="flex h-12 w-12 items-center justify-center rounded-full bg-forest-50 text-2xl"
                aria-hidden="true"
              >
                {f.icon}
              </span>
              <h3 className="mt-4 text-lg font-bold text-gray-900">{f.title}</h3>
              <p className="mt-2 leading-relaxed text-gray-500">{f.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-10 text-center text-2xl font-bold text-gray-900">
            {t('howItWorks.heading')}
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: '🔍', title: t('howItWorks.search.title'), description: t('howItWorks.search.description') },
              { icon: '📅', title: t('howItWorks.chooseDates.title'), description: t('howItWorks.chooseDates.description') },
              { icon: '✅', title: t('howItWorks.book.title'), description: t('howItWorks.book.description') },
              { icon: '🏕️', title: t('howItWorks.enjoy.title'), description: t('howItWorks.enjoy.description') },
            ].map((step, i) => (
              <div key={step.title} className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-forest-100 text-xl font-bold text-forest-700">
                  {i + 1}
                </div>
                <span className="mb-2 text-2xl" aria-hidden="true">{step.icon}</span>
                <h3 className="text-base font-semibold text-gray-900">{step.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-5xl scroll-mt-20 px-4 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            {t('pricing.heading')}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-gray-500">
            {t('pricing.subtitle')}
          </p>
        </div>
        <PricingTabs />
      </section>

      {/* Trust badges */}
      <section className="border-y bg-gray-50 px-4 py-10">
        <ul className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-8 text-sm text-gray-600">
          {[
            { icon: '🔒', text: tTrust('securePayments') },
            { icon: '✅', text: tTrust('cancelAnytime') },
            { icon: '🎁', text: tTrust('freeTrial') },
            { icon: '💬', text: tTrust('supportRo') },
          ].map((badge) => (
            <li key={badge.text} className="flex items-center gap-2 font-medium">
              <span aria-hidden="true">{badge.icon}</span>
              {badge.text}
            </li>
          ))}
        </ul>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-2xl px-4 py-16">
        <h2 className="mb-10 text-center text-2xl font-bold text-gray-900">
          {t('faq.heading')}
        </h2>
        <dl className="flex flex-col gap-4">
          {[
            { question: t('faq.q1.question'), answer: t('faq.q1.answer') },
            { question: t('faq.q2.question'), answer: t('faq.q2.answer') },
            { question: t('faq.q3.question'), answer: t('faq.q3.answer') },
            { question: t('faq.q4.question'), answer: t('faq.q4.answer') },
            { question: t('faq.q5.question'), answer: t('faq.q5.answer') },
          ].map((item) => (
            <div key={item.question} className="rounded-xl border p-6">
              <dt className="font-semibold text-gray-900">{item.question}</dt>
              <dd className="mt-2 text-sm text-gray-600">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* CTA Banner */}
      <section className="bg-forest-700 px-4 py-16 text-center text-white">
        <h2 className="mb-3 text-2xl font-bold sm:text-3xl">
          {t('cta.heading')}
        </h2>
        <p className="mb-8 text-forest-100">
          {t('cta.subtitle')}
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/register" className="btn-primary bg-white text-forest-700 hover:bg-forest-50 px-8 py-3.5">
            {t('cta.register')}
          </Link>
          <Link href="/cabins" className="btn-secondary border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm px-8 py-3.5">
            {t('cta.exploreCabins')}
          </Link>
        </div>
      </section>
    </main>
  );
}

const categories = [
  { icon: '🏔️', label: 'La munte' },
  { icon: '🌲', label: 'Pădure' },
  { icon: '🏡', label: 'Cabane rustice' },
  { icon: '🔥', label: 'Șemineu' },
  { icon: '🌊', label: 'Lângă apă' },
  { icon: '⛷️', label: 'Schi' },
  { icon: '🌄', label: 'Panoramă' },
  { icon: '🐾', label: 'Pet-friendly' },
];
