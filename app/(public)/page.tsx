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

/**
 * Homepage — redirects to the cabins listing page.
 * All discovery content lives at /cabins for clean URLs and ISR caching.
 */
export default async function HomePage() {
  const t = await getTranslations('home');

  const features = [
    {
      icon: '🏔️',
      title: t('features.nature.title'),
      description: t('features.nature.description'),
    },
    {
      icon: '🔥',
      title: t('features.comfort.title'),
      description: t('features.comfort.description'),
    },
    {
      icon: '📅',
      title: t('features.booking.title'),
      description: t('features.booking.description'),
    },
  ];

  const howItWorks = [
    {
      icon: '🔍',
      title: t('howItWorks.search.title'),
      description: t('howItWorks.search.description'),
    },
    {
      icon: '📅',
      title: t('howItWorks.chooseDates.title'),
      description: t('howItWorks.chooseDates.description'),
    },
    {
      icon: '✅',
      title: t('howItWorks.book.title'),
      description: t('howItWorks.book.description'),
    },
    {
      icon: '🏕️',
      title: t('howItWorks.enjoy.title'),
      description: t('howItWorks.enjoy.description'),
    },
  ];

  const trustBadges = [
    { icon: '🔒', text: t('trust.securePayments') },
    { icon: '✅', text: t('trust.cancelAnytime') },
    { icon: '🎁', text: t('trust.freeTrial') },
    { icon: '💬', text: t('trust.supportRo') },
  ];

  const faqItems = [
    { question: t('faq.q1.question'), answer: t('faq.q1.answer') },
    { question: t('faq.q2.question'), answer: t('faq.q2.answer') },
    { question: t('faq.q3.question'), answer: t('faq.q3.answer') },
    { question: t('faq.q4.question'), answer: t('faq.q4.answer') },
    { question: t('faq.q5.question'), answer: t('faq.q5.answer') },
  ];

  return (
    <main>
      {/* Hero */}
      <section className="relative flex min-h-[70vh] flex-col items-center justify-center bg-gradient-to-b from-indigo-900 to-indigo-700 px-4 text-center text-white">
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
          {t('hero.title')}
        </h1>
        <p className="mb-8 max-w-xl text-lg text-indigo-100">
          {t('hero.subtitle')}
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/cabins"
            className="rounded-full bg-white px-8 py-3 text-base font-semibold text-indigo-700 shadow hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-700"
          >
            {t('hero.exploreCabins')}
          </Link>
          <Link
            href="#pricing"
            className="rounded-full border border-indigo-400 px-8 py-3 text-base font-semibold text-white hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-700"
          >
            {t('hero.viewPricing')}
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="mb-10 text-center text-2xl font-bold">{t('features.heading')}</h2>
        <div className="grid gap-8 sm:grid-cols-3">
          {features.map((f) => (
            <article key={f.title} className="rounded-xl border p-6 shadow-sm">
              <span className="text-3xl" aria-hidden="true">{f.icon}</span>
              <h3 className="mt-3 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{f.description}</p>
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
            {howItWorks.map((step, i) => (
              <div key={step.title} className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-700">
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
          {trustBadges.map((badge) => (
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
          {faqItems.map((item) => (
            <div key={item.question} className="rounded-xl border p-6">
              <dt className="font-semibold text-gray-900">{item.question}</dt>
              <dd className="mt-2 text-sm text-gray-600">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* CTA */}
      <section className="bg-indigo-600 px-4 py-16 text-center text-white">
        <h2 className="text-2xl font-bold sm:text-3xl">{t('cta.heading')}</h2>
        <p className="mx-auto mt-3 max-w-md text-indigo-200">
          {t('cta.subtitle')}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/register"
            className="rounded-xl bg-white px-8 py-3 text-sm font-semibold text-indigo-700 shadow hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
          >
            {t('cta.register')}
          </Link>
          <Link
            href="/cabins"
            className="rounded-xl border border-indigo-400 px-8 py-3 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
          >
            {t('cta.exploreCabins')}
          </Link>
        </div>
      </section>
    </main>
  );
}
