import { requireAdmin } from '@/lib/auth/authorization';
import { getAllCabins } from '@/modules/cabins/application/cabinService';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Admin – Cabane' };
export const dynamic = 'force-dynamic';

export default async function AdminCabinsPage() {
  await requireAdmin();
  const result = await getAllCabins();
  const cabins = result.ok ? result.data : [];

  return (
    <div>
      <SectionHeader
        title="Cabane"
        description={`${cabins.length} ${cabins.length === 1 ? 'cabană înregistrată' : 'cabane înregistrate'}`}
        action={
          <Link
            href="/dashboard/owner/listings/new?redirectTo=/admin/cabins"
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            + Adaugă cabană
          </Link>
        }
      />

      {cabins.length === 0 ? (
        <EmptyState
          icon="🏠"
          title="Nu există cabane înregistrate"
          description="Adaugă prima cabană pentru a începe."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm" aria-label="Lista cabane">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th scope="col" className="px-4 py-3">Titlu</th>
                <th scope="col" className="px-4 py-3">Locație</th>
                <th scope="col" className="px-4 py-3">Preț / noapte</th>
                <th scope="col" className="px-4 py-3">Oaspeți max.</th>
                <th scope="col" className="px-4 py-3">Publicată</th>
                <th scope="col" className="px-4 py-3">
                  <span className="sr-only">Acțiuni</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {cabins.map((cabin) => (
                <tr key={cabin.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {cabin.title}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{cabin.location}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {cabin.pricePerNight} RON
                  </td>
                  <td className="px-4 py-3 text-gray-600">{cabin.maxGuests}</td>
                  <td className="px-4 py-3">
                    {cabin.published ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                        <span aria-hidden="true">●</span> Publicată
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                        <span aria-hidden="true">○</span> Draft
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/cabins/${cabin.slug}`}
                      className="text-indigo-600 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Vizualizare ↗
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
