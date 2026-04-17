/**
 * app/(public)/pricing/page.tsx
 */
import Link from 'next/link';
import type { Metadata } from 'next';
import { PLANS } from '@/lib/subscription/plans';

export const metadata: Metadata = { title: 'Pre\u021buri \u2013 Cabane Apuseni' };

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
          Alege planul t\u0103u
        </h1>
        <p className="mt-3 text-lg text-gray-500">
          Listeaz\u0103-\u021bi cabana \u015fi prime\u015fte rezerv\u0103ri prin Cabane Apuseni.
        </p>
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        {PLANS.map((plan) => (
          <article
            key={plan.id}
            className={
              'relative flex flex-col rounded-2xl border p-8 shadow-sm' +
              (plan.recommended
                ? ' border-pine-500 bg-white ring-2 ring-pine-500'
                : ' border-gray-200 bg-white')
            }
            aria-label={'Plan ' + plan.name}
          >
            {plan.recommended && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-pine-600 px-4 py-1 text-xs font-semibold text-white">
                  Recomandat
                </span>
              </div>
            )}

            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
              <div className="mt-3 flex items-end gap-1">
                <span className="text-4xl font-extrabold text-gray-900">{plan.priceRon}</span>
                <span className="mb-1 text-lg font-medium text-gray-500">RON</span>
                <span className="mb-1 text-sm text-gray-400">/lun\u0103</span>
              </div>
            </div>

            <ul className="mb-8 flex-1 space-y-3" aria-label={'Func\u021bionalit\u0103\u021bi plan ' + plan.name}>
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <span
                    aria-hidden="true"
                    className={f.included ? 'text-green-500' : 'text-gray-300'}
                  >
                    {f.included ? '\u2713' : '\u2717'}
                  </span>
                  <span className={f.included ? 'text-gray-700' : 'text-gray-400'}>
                    {f.label}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href={'/register/owner?plan=' + plan.id}
              className={
                'block rounded-lg px-6 py-3 text-center text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2' +
                (plan.recommended
                  ? ' bg-ember-500 text-white hover:bg-ember-600 focus:ring-ember-500'
                  : ' bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-700')
              }
            >
              {'Începe cu ' + plan.name}
            </Link>
          </article>
        ))}
      </div>

      <p className="mt-10 text-center text-sm text-gray-500">
        Ai deja un cont?{' '}
        <Link href="/login" className="font-medium text-pine-600 hover:underline">
          Autentific\u0103-te
        </Link>{' '}
        \u015fi gestioneaz\u0103-\u021bi abonamentul din dashboard.
      </p>
    </main>
  );
}
