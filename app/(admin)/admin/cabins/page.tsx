import { requireAdmin } from '@/lib/auth/authorization';
import { getAllCabins } from '@/modules/cabins/application/cabinService';
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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cabane</h1>
        {/* TODO: link to create cabin form */}
        <button
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          disabled
        >
          + Adaugă cabană
        </button>
      </div>

      {cabins.length === 0 ? (
        <p className="text-gray-500">Nu există cabane înregistrate.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Titlu</th>
                <th className="px-4 py-3 font-medium">Locație</th>
                <th className="px-4 py-3 font-medium">Preț / noapte</th>
                <th className="px-4 py-3 font-medium">Publicată</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {cabins.map((cabin) => (
                <tr key={cabin.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{cabin.title}</td>
                  <td className="px-4 py-3 text-gray-600">{cabin.location}</td>
                  <td className="px-4 py-3">{cabin.pricePerNight} RON</td>
                  <td className="px-4 py-3">
                    {cabin.published ? (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                        Da
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                        Nu
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/cabins/${cabin.slug}`}
                      className="text-indigo-600 hover:underline"
                      target="_blank"
                    >
                      Vizualizare
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
