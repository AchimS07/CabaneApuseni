import type { Metadata } from 'next';
import Link from 'next/link';
import { requireOwner } from '@/lib/auth/authorization';
import { getOwnerCabins } from '@/modules/cabins/application/cabinService';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { TogglePublishButton } from '@/components/ui/TogglePublishButton';
import { Button } from '@/components/ui/Button';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('ownerListings');
  return { title: t('metaTitle') };
}

export const dynamic = 'force-dynamic';

export default async function OwnerListingsPage() {
  const session = await requireOwner();
  const result = await getOwnerCabins(session.uid);
  const cabins = result.ok ? result.data : [];
  const t = await getTranslations('ownerListings');

  const description = cabins.length === 1
    ? t('descriptionSingular')
    : t('descriptionPlural', { count: cabins.length });

  return (
    <div>
      <SectionHeader
        title={t('title')}
        description={description}
        action={
          <Link href="/dashboard/owner/listings/new">
            <Button size="sm">{t('addCabin')}</Button>
          </Link>
        }
      />

      {!result.ok && (
        <div
          role="alert"
          className="mb-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {t('loadError')}
        </div>
      )}

      {result.ok && cabins.length === 0 && (
        <EmptyState
          icon="🏠"
          title={t('emptyTitle')}
          description={t('emptyDesc')}
          action={{ label: t('addCabin'), href: '/dashboard/owner/listings/new' }}
        />
      )}

      {result.ok && cabins.length > 0 && (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm" aria-label={t('title')}>
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th scope="col" className="px-4 py-3">{t('colTitle')}</th>
                <th scope="col" className="px-4 py-3">{t('colLocation')}</th>
                <th scope="col" className="px-4 py-3">{t('colPrice')}</th>
                <th scope="col" className="px-4 py-3">{t('colMaxGuests')}</th>
                <th scope="col" className="px-4 py-3">{t('colStatus')}</th>
                <th scope="col" className="px-4 py-3">{t('colUpdated')}</th>
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
                  <td className="px-4 py-3 text-gray-700">{cabin.pricePerNight} RON</td>
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
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(cabin.updatedAt).toLocaleDateString('ro-RO')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/dashboard/owner/listings/${cabin.id}/edit`}
                        className="rounded-md border border-indigo-200 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {t('edit')}
                      </Link>
                      <TogglePublishButton
                        cabinId={cabin.id}
                        published={cabin.published}
                      />
                      <Link
                        href={`/cabins/${cabin.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-400 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
                      >
                        {t('preview')}
                      </Link>
                    </div>
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
