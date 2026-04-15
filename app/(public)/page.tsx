import Link from 'next/link';
import type { Metadata } from 'next';

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
            <Link href="/register" className="btn-secondary border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm text-base px-8 py-3.5">
              Creează cont gratuit
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

      {/* CTA Banner */}
      <section className="bg-forest-700 px-4 py-16 text-center text-white">
        <h2 className="mb-3 text-2xl font-bold sm:text-3xl">
          Gata pentru aventura ta?
        </h2>
        <p className="mb-8 text-forest-100">
          Cabanele noastre te așteaptă. Rezervă astăzi și bucură-te de natura Apusenilor.
        </p>
        <Link href="/cabins" className="btn-primary bg-white text-forest-700 hover:bg-forest-50 px-8 py-3.5">
          Văd toate cabanele
        </Link>
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
