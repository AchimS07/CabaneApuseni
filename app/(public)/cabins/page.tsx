import { getPublishedCabins } from '@/modules/cabins/application/cabinService';
import { EmptyState } from '@/components/ui/EmptyState';
import { CabinsViewSwitcher } from '@/app/components/CabinsViewSwitcher';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('cabinsList');
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export const revalidate = 300; // ISR: 5 minutes

export default async function CabinsPage() {
  const result = await getPublishedCabins();
  const cabins = result.ok ? result.data : [];
  const t = await getTranslations('cabinsList');

  const subtitle = cabins.length > 0
    ? (cabins.length === 1 ? t('countSingular') : t('countPlural', { count: cabins.length }))
    : t('searching');

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">{t('title')}</h1>
        <p className="mt-1 text-gray-500">{subtitle}</p>
      </div>

      {!result.ok && (
        <div
          role="alert"
          className="mb-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {t('loadError')}
        </div>
      )}

      {cabins.length === 0 ? (
        <EmptyState
          icon="🏔️"
          title={t('emptyTitle')}
          description={t('emptyDescription')}
        />
      ) : (
        <CabinsViewSwitcher cabins={cabins} />
      )}
    </main>
  );
}
