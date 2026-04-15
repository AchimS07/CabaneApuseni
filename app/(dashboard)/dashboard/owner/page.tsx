import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { requireAuth } from '@/lib/auth/authorization';
import { getProfile } from '@/modules/users/application/userService';

export const metadata: Metadata = { title: 'Dashboard proprietar' };
export const dynamic = 'force-dynamic';

export default async function OwnerDashboardPage() {
  const session = await requireAuth();
  const profileResult = await getProfile(session.uid);

  if (!profileResult.ok || profileResult.data.role !== 'owner') {
    redirect('/dashboard');
  }

  const name = profileResult.data.name || session.email || 'Proprietar';

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard proprietar</h1>
        <p className="mt-1 text-gray-600">Bine ai venit, {name}.</p>
      </header>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Cont activ de proprietar</h2>
        <p className="mt-2 text-sm text-gray-600">
          Contul tău este setat ca proprietar. În prezent poți folosi acest dashboard
          ca punct de acces dedicat pentru fluxurile de proprietar.
        </p>
      </div>
    </section>
  );
}
