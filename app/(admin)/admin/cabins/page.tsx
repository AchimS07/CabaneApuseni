import { requireAdmin } from '@/lib/auth/authorization';
import { getAllCabins } from '@/modules/cabins/application/cabinService';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('adminCabins');
  return { title: t('metaTitle') };
}

export const dynamic = 'force-dynamic';

export default async function AdminCabinsPage() {
  await requireAdmin();
  const result = await getAllCabins();
  const cabins = result.ok ? result.data : [];
  const t = await getTranslations('adminCabins');

  const description = cabins.length === 1
    ? t('descriptionSingular')
    : t('descriptionPlural', { count: cabins.length });

  return (
    <div>
      <SectionHeader
        title={t('title')}
        description={description}
        action={
          <Link
            href="/dashboard/owner/listings/new?redirectTo=/admin/cabins"
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {t('addCabin')}
          </Link>
        }
      />

      {cabins.length === 0 ? (
        <EmptyState
          icon="🏠"
          title={t('emptyTitle')}
          description={t('emptyDesc')}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm" aria-label={t('listLabel')}>
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th scope="col" className="px-4 py-3">{t('colTitle')}</th>
                <th scope="col" className="px-4 py-3">{t('colLocation')}</th>
                <th scope="col" className="px-4 py-3">{t('colPrice')}</th>
                <th scope="col" className="px-4 py-3">{t('colMaxGuests')}</th>
                <th scope="col" className="px-4 py-3">{t('colPublished')}</th>
                <th scope="col" className="px-4 py-3">
                  <span className="sr-only">{t('colActions')}</span>
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
                        <span aria-hidden="true">●</span> {t('statusPublished')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                        <span aria-hidden="true">○</span> {t('statusDraft')}
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
                      {t('viewCabin')}
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
