import Link from 'next/link';
import type { Metadata } from 'next';
import { PricingTabs } from '@/app/components/PricingTabs';

export const metadata: Metadata = {
  title: 'Cabane Apuseni – Cazare la Munte',
  description: 'Descoperă cele mai frumoase cabane din Munții Apuseni. Rezervă acum.',
};

export default function HomePage() {
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
            Descoperă cabane<br className="hidden sm:block" /> de poveste
          </h1>

          <p className="mb-8 text-lg leading-relaxed text-white/80 sm:text-xl">
            Refugii autentice de munte — perfecte pentru relaxare, aventură și amintiri de neuitat.
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/cabins" className="btn-primary bg-white text-forest-700 hover:bg-forest-50 text-base px-8 py-3.5 shadow-lg">
              Explorează cabane
            </Link>
            <Link href="#pricing" className="btn-secondary border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm text-base px-8 py-3.5">
              Vezi prețuri
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
          De ce să alegi Cabane Apuseni?
        </h2>
        <p className="mb-12 text-center text-gray-500">
          Tot ce ai nevoie pentru un sejur perfect la munte.
        </p>

        <div className="grid gap-6 sm:grid-cols-3">
          {features.map((f) => (
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
            Cum funcționează?
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((step, i) => (
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

      {/* CTA Banner */}
      <section className="bg-forest-700 px-4 py-16 text-center text-white">
        <h2 className="mb-3 text-2xl font-bold sm:text-3xl">
          Gata pentru aventura ta?
        </h2>
        <p className="mb-8 text-forest-100">
          Cabanele noastre te așteaptă. Rezervă astăzi și bucură-te de natura Apusenilor.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/register" className="btn-primary bg-white text-forest-700 hover:bg-forest-50 px-8 py-3.5">
            Înregistrare gratuită
          </Link>
          <Link href="/cabins" className="btn-secondary border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm px-8 py-3.5">
            Văd toate cabanele
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

const features = [
  {
    icon: '🏔️',
    title: 'Natură autentică',
    description: 'Peisaje montane spectaculoase direct la ușa cabinei tale, în inima Munților Apuseni.',
  },
  {
    icon: '🔥',
    title: 'Confort modern',
    description: 'Căldură, internet rapid și dotări complete pentru un sejur fără griji.',
  },
  {
    icon: '📅',
    title: 'Rezervare ușoară',
    description: 'Disponibilitate în timp real și confirmare imediată — în câteva secunde.',
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
