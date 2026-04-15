import { requireAuth } from '@/lib/auth/authorization';
import { getProfile } from '@/modules/users/application/userService';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Tablou de bord' };
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await requireAuth();
  const profileResult = await getProfile(session.uid);
  const name = profileResult.ok ? profileResult.data.name : session.email ?? 'Utilizator';

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">
        Bine ai revenit, {name}!
      </h1>
      <p className="mb-8 text-gray-500">Gestionează rezervările și contul tău.</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/bookings"
          className="group flex flex-col rounded-xl border bg-white p-6 shadow-sm transition hover:border-indigo-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <span
            className="mb-3 text-3xl"
            aria-hidden="true"
          >
            📅
          </span>
          <h2 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-700">
            Rezervările mele
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Vezi și gestionează rezervările tale active.
          </p>
          <span className="mt-4 text-sm font-medium text-indigo-600 group-hover:underline">
            Vezi rezervări →
          </span>
        </Link>

        <Link
          href="/cabins"
          className="group flex flex-col rounded-xl border bg-white p-6 shadow-sm transition hover:border-indigo-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <span
            className="mb-3 text-3xl"
            aria-hidden="true"
          >
            🏔️
          </span>
          <h2 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-700">
            Caută cabane
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Explorează cabane disponibile și rezervă.
          </p>
          <span className="mt-4 text-sm font-medium text-indigo-600 group-hover:underline">
            Explorează →
          </span>
        </Link>
      </div>
    </div>
  );
}
