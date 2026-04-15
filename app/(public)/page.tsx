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
      <section className="relative flex min-h-[70vh] flex-col items-center justify-center bg-gradient-to-b from-indigo-900 to-indigo-700 px-4 text-center text-white">
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
          Cabane în Munții Apuseni
        </h1>
        <p className="mb-8 max-w-xl text-lg text-indigo-100">
          Refugii autentice de munte, perfecte pentru relaxare și aventură.
        </p>
        <Link
          href="/cabins"
          className="rounded-full bg-white px-8 py-3 text-base font-semibold text-indigo-700 shadow hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-700"
        >
          Explorează cabane
        </Link>
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
