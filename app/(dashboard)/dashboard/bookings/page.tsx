import { requireAuth } from '@/lib/auth/authorization';
import { getUserBookings } from '@/modules/bookings/application/bookingService';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Rezervările mele' };
export const dynamic = 'force-dynamic';

const STATUS_LABEL: Record<string, string> = {
  pending: 'În așteptare',
  confirmed: 'Confirmată',
  cancelled: 'Anulată',
  completed: 'Finalizată',
};

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-gray-100 text-gray-700',
};

export default async function BookingsPage() {
  const session = await requireAuth();
  const result = await getUserBookings(session);
  const bookings = result.ok ? result.data : [];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Rezervările mele</h1>

      {bookings.length === 0 ? (
        <div className="rounded-xl border p-10 text-center text-gray-500">
          <p>Nu ai nicio rezervare.</p>
          <a href="/cabins" className="mt-4 inline-block text-indigo-600 hover:underline">
            Explorează cabane
          </a>
        </div>
      ) : (
        <ul className="divide-y rounded-xl border">
          {bookings.map((b) => (
            <li key={b.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">{b.cabin.title}</p>
                <p className="text-sm text-gray-500">
                  {b.checkIn} → {b.checkOut} · {b.guestCount} persoane
                </p>
                <p className="text-sm font-medium text-indigo-700">{b.totalPrice} RON</p>
              </div>
              <span
                className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLOR[b.status] ?? ''}`}
              >
                {STATUS_LABEL[b.status] ?? b.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
