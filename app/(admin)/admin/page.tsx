import { requireAdmin } from '@/lib/auth/authorization';
import { getAllCabins } from '@/modules/cabins/application/cabinService';
import { getAllBookings } from '@/modules/bookings/application/bookingService';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Admin – Tablou de bord' };
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  await requireAdmin();

  const [cabinsResult, bookingsResult] = await Promise.all([
    getAllCabins(),
    getAllBookings(),
  ]);

  const cabinCount = cabinsResult.ok ? cabinsResult.data.length : 0;
  const bookingCount = bookingsResult.ok ? bookingsResult.data.length : 0;
  const pendingCount = bookingsResult.ok
    ? bookingsResult.data.filter((b) => b.status === 'pending').length
    : 0;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Tablou de bord</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Cabane" value={cabinCount} />
        <StatCard label="Rezervări totale" value={bookingCount} />
        <StatCard label="În așteptare" value={pendingCount} highlight />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-6 shadow-sm ${highlight ? 'border-yellow-300 bg-yellow-50' : ''}`}
    >
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  );
}
