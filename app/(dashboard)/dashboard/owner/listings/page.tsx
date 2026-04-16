import type { Metadata } from 'next';
import Link from 'next/link';
import { requireOwner } from '@/lib/auth/authorization';
import { getOwnerCabins } from '@/modules/cabins/application/cabinService';
import { getProfile } from '@/modules/users/application/userService';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { TogglePublishButton } from '@/components/ui/TogglePublishButton';
import { DeleteCabinButton } from '@/components/ui/DeleteCabinButton';
import { Button } from '@/components/ui/Button';
import { LISTING_LIMITS } from '@/lib/subscription/plans';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('ownerListings');
  return { title: t('metaTitle') };
}

export const dynamic = 'force-dynamic';

export default async function OwnerListingsPage() {
  const session = await requireOwner();

  const [result, profileResult] = await Promise.all([
    getOwnerCabins(session.uid),
    getProfile(session.uid),
  ]);

  const cabins = result.ok ? result.data : [];
  const t = await getTranslations('ownerListings');
  const profile = profileResult.ok ? profileResult.data : null;

  const isSubscriptionActive = profile?.subscriptionStatus === 'active';
  const tier = profile?.subscriptionTier ?? null;
  const listingLimit = tier ? LISTING_LIMITS[tier] : 0;
  const atLimit = tier ? cabins.length >= listingLimit : true;
  const canAddListing = isSubscriptionActive && !atLimit;

  const description = tier
    ? cabins.length + ' / ' + listingLimit + ' ' + (cabins.length === 1 ? t('descriptionSingular') : t('descriptionPlural', { count: cabins.length })) + ' (plan ' + (tier === 'basic' ? 'Basic' : 'Pro') + ')'
    : cabins.length === 1 ? t('descriptionSingular') : t('descriptionPlural', { count: cabins.length });

  return (
    <div>
      <SectionHeader
        title={t('title')}
        description={description}
        action={
          canAddListing ? (
            <Link href="/dashboard/owner/listings/new">
              <Button size="sm">{t('addCabin')}</Button>
            </Link>
          ) : (
            <Button
              size="sm"
              disabled
              title={
                !isSubscriptionActive
                  ? t('subscriptionRequired')
                  : t('limitReached')
              }
            >
              {t('addCabin')}
            </Button>
          )
        }
      />

      {!isSubscriptionActive && (
        <div
          role="alert"
          className="mb-6 flex items-center gap-3 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800"
        >
          <span aria-hidden="true">⚠️</span>
          <span>
            {t('noSubscription')}{' '}
            <Link href="/pricing" className="font-medium underline hover:text-yellow-900">
              {t('choosePlan')}
            </Link>{' '}
            {t('noSubscriptionSuffix')}
          </span>
        </div>
      )}

      {isSubscriptionActive && atLimit && (
        <div
          role="alert"
          className="mb-6 flex items-center gap-3 rounded-xl border border-pine-200 bg-pine-50 px-4 py-3 text-sm text-pine-800"
        >
          <span aria-hidden="true">ℹ️</span>
          <span>
            {t('atLimitPrefix')} {listingLimit} {listingLimit === 1 ? t('atLimitCabana') : t('atLimitCabane')} {t('atLimitSuffix')}{' '}
            {tier === 'basic' && (
              <Link href="/pricing" className="font-medium underline hover:text-pine-900">
                {t('upgradeLink')}
              </Link>
            )}
            {tier === 'basic' && ' ' + t('upgradeSuffix')}
          </span>
        </div>
      )}

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
          action={
            isSubscriptionActive
              ? { label: t('addCabin'), href: '/dashboard/owner/listings/new' }
              : undefined
          }
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
                        href={'/dashboard/owner/listings/' + cabin.id + '/edit'}
                        className="rounded-md border border-pine-200 px-3 py-1.5 text-xs font-medium text-pine-600 hover:bg-pine-50 focus:outline-none focus:ring-2 focus:ring-pine-500"
                      >
                        {t('edit')}
                      </Link>
                      <TogglePublishButton
                        cabinId={cabin.id}
                        published={cabin.published}
                      />
                      <Link
                        href={'/cabins/' + cabin.slug}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-400 hover:text-pine-600 focus:outline-none focus:ring-2 focus:ring-pine-500 rounded"
                      >
                        {t('preview')}
                      </Link>
                      <DeleteCabinButton
                        cabinId={cabin.id}
                        cabinTitle={cabin.title}
                      />
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
