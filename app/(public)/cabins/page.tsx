import { getPublishedCabins } from '@/modules/cabins/application/cabinService';
import { CabinsView } from '@/app/components/CabinsView';
import { Suspense } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cabane disponibile',
  description: 'Explorează cabanele disponibile din Munții Apuseni.',
};

export const revalidate = 300; // ISR: 5 minutes

/**
 * Server component: fetches all published cabins (with ISR),
 * then hands off to a client CabinsView for filtering + category UI.
 */
export default async function CabinsPage() {
  const result = await getPublishedCabins();
  const cabins = result.ok ? result.data : [];

  return (
    <Suspense>
      <CabinsView initialCabins={cabins} />
    </Suspense>
  );
}
