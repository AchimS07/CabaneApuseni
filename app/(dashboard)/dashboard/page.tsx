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
      <h1 className="mb-2 text-2xl font-bold">Bine ai revenit, {name}!</h1>
      <p className="mb-8 text-gray-500">Gestionează rezervările și contul tău.</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/bookings"
          className="rounded-xl border p-6 shadow-sm hover:shadow-md transition"
        >
          <h2 className="text-lg font-semibold">📅 Rezervările mele</h2>
          <p className="mt-2 text-sm text-gray-500">Vezi și gestionează rezervările tale active.</p>
        </Link>
        <Link
          href="/cabins"
          className="rounded-xl border p-6 shadow-sm hover:shadow-md transition"
        >
          <h2 className="text-lg font-semibold">🏔️ Caută cabane</h2>
          <p className="mt-2 text-sm text-gray-500">Explorează cabane disponibile și rezervă.</p>
        </Link>
      </div>
    </div>
  );
}
