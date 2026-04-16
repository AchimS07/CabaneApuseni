import { getPublishedCabins } from '@/modules/cabins/application/cabinService';
import { EmptyState } from '@/components/ui/EmptyState';
import { CabinsViewSwitcher } from '@/app/components/CabinsViewSwitcher';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cabane disponibile',
  description: 'Explorează cabanele disponibile din Munții Apuseni.',
};

export const revalidate = 300; // ISR: 5 minutes

export default async function CabinsPage() {
  const result = await getPublishedCabins();
  const cabins = result.ok ? result.data : [];

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          Cabane disponibile
        </h1>
        <p className="mt-1 text-gray-500">
          {cabins.length > 0
            ? `${cabins.length} ${cabins.length === 1 ? 'cabană disponibilă' : 'cabane disponibile'} în Munții Apuseni`
            : 'Căutăm cabane pentru tine…'}
        </p>
      </div>

      {!result.ok && (
        <div
          role="alert"
          className="mb-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          Ne pare rău, nu am putut încărca lista cabanelor. Te rugăm să revii mai târziu.
        </div>
      )}

      {cabins.length === 0 ? (
        <EmptyState
          icon="🏔️"
          title="Nu există cabane disponibile momentan"
          description="Revino mai târziu – noi cabane sunt adăugate în permanență."
        />
      ) : (
        <CabinsViewSwitcher cabins={cabins} />
      )}
    </main>
  );
}
