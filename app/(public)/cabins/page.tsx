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
    <main className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold text-gray-900">Cabane disponibile</h1>
      <p className="mb-8 text-gray-500">
        {cabins.length > 0
          ? `${cabins.length} ${cabins.length === 1 ? 'cabană disponibilă' : 'cabane disponibile'}`
          : 'Căutăm cabane pentru tine…'}
      </p>

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
