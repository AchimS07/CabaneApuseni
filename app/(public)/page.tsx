import Link from 'next/link';
import type { Metadata } from 'next';
import { PricingTabs } from '@/app/components/PricingTabs';

export const metadata: Metadata = {
  title: 'Cabane Apuseni – Cazare la Munte',
  description:
    'Descoperă cele mai frumoase cabane din Munții Apuseni. Rezervă acum online, confirmare imediată.',
};

/**
 * Homepage — redirects to the cabins listing page.
 * All discovery content lives at /cabins for clean URLs and ISR caching.
 */
export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative flex min-h-[70vh] flex-col items-center justify-center bg-gradient-to-b from-indigo-900 to-indigo-700 px-4 text-center text-white">
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
          Cabane în Munții Apuseni
        </h1>
        <p className="mb-8 max-w-xl text-lg text-indigo-100">
          Refugii autentice de munte, perfecte pentru relaxare și aventură.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/cabins"
            className="rounded-full bg-white px-8 py-3 text-base font-semibold text-indigo-700 shadow hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-700"
          >
            Explorează cabane
          </Link>
          <Link
            href="#pricing"
            className="rounded-full border border-indigo-400 px-8 py-3 text-base font-semibold text-white hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-700"
          >
            Vezi prețuri
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="mb-10 text-center text-2xl font-bold">De ce să alegi Cabane Apuseni?</h2>
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
            Cum funcționează?
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
            Planuri transparente, fără surprize
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-gray-500">
            Indiferent dacă ești turist în căutarea aventurii sau proprietar care
            vrea să-și listeze cabana, avem planul potrivit pentru tine.
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
          Întrebări frecvente
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
        <h2 className="text-2xl font-bold sm:text-3xl">Gata să începi aventura?</h2>
        <p className="mx-auto mt-3 max-w-md text-indigo-200">
          Creează un cont gratuit în câteva secunde. Niciun card necesar.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/register"
            className="rounded-xl bg-white px-8 py-3 text-sm font-semibold text-indigo-700 shadow hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
          >
            Înregistrare gratuită
          </Link>
          <Link
            href="/cabins"
            className="rounded-xl border border-indigo-400 px-8 py-3 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
          >
            Explorează cabane
          </Link>
        </div>
      </section>
    </main>
  );
}

const features = [
  {
    icon: '🏔️',
    title: 'Natură autentică',
    description: 'Peisaje montane spectaculoase direct la ușa cabinei tale.',
  },
  {
    icon: '🔥',
    title: 'Confort modern',
    description: 'Căldură, internet și dotări complete pentru un sejur fără griji.',
  },
  {
    icon: '📅',
    title: 'Rezervare ușoară',
    description: 'Disponibilitate în timp real, confirmare imediată.',
  },
];

const howItWorks = [
  {
    icon: '🔍',
    title: 'Caută',
    description: 'Răsfoiește zeci de cabane cu filtre după locație, preț și dotări.',
  },
  {
    icon: '📅',
    title: 'Alege datele',
    description: 'Verifică disponibilitatea în timp real și selectează nopțile dorite.',
  },
  {
    icon: '✅',
    title: 'Rezervă',
    description: 'Confirmare imediată și plată securizată prin platformă.',
  },
  {
    icon: '🏕️',
    title: 'Bucură-te',
    description: 'Ajunge la cabană și trăiește experiența montană perfectă.',
  },
];

const trustBadges = [
  { icon: '🔒', text: 'Plăți securizate' },
  { icon: '✅', text: 'Anulare oricând' },
  { icon: '🎁', text: '14 zile gratuit' },
  { icon: '💬', text: 'Suport în română' },
];

const faqItems = [
  {
    question: 'Pot schimba planul oricând?',
    answer:
      'Da, poți face upgrade sau downgrade la orice plan oricând din contul tău. Modificările intră în vigoare la începutul ciclului de facturare următor.',
  },
  {
    question: 'Există un contract pe termen lung?',
    answer:
      'Nu. Toate planurile sunt lunare, fără angajament pe termen lung. Poți anula în orice moment.',
  },
  {
    question: 'Ce înseamnă comisionul pentru proprietari?',
    answer:
      'Comisionul se aplică pe fiecare rezervare confirmată prin platformă. Cu planuri superioare, procentul scade, crescând veniturile nete.',
  },
  {
    question: 'Cum funcționează perioada de probă?',
    answer:
      'Planul Gratuit este disponibil fără limită de timp. Planurile plătite pot fi testate 14 zile gratuit — nu este necesar cardul de credit.',
  },
  {
    question: 'Există reduceri pentru plata anuală?',
    answer:
      'Da! La plata anuală beneficiezi de 2 luni gratuite față de plata lunară. Contactează-ne pentru detalii.',
  },
];
