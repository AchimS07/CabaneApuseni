import type { Metadata } from 'next';
import Link from 'next/link';
import { requireOwner } from '@/lib/auth/authorization';
import { getOwnerCabins } from '@/modules/cabins/application/cabinService';
import { getProfile } from '@/modules/users/application/userService';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { TogglePublishButton } from '@/components/ui/TogglePublishButton';
import { Button } from '@/components/ui/Button';
import { LISTING_LIMITS } from '@/lib/subscription/plans';

export const metadata: Metadata = { title: 'Cabane mele' };
export const dynamic = 'force-dynamic';

export default async function OwnerListingsPage() {
  const session = await requireOwner();

  const [result, profileResult] = await Promise.all([
    getOwnerCabins(session.uid),
    getProfile(session.uid),
  ]);

  const cabins = result.ok ? result.data : [];
  const profile = profileResult.ok ? profileResult.data : null;

  const isSubscriptionActive = profile?.subscriptionStatus === 'active';
  const tier = profile?.subscriptionTier ?? null;
  const listingLimit = tier ? LISTING_LIMITS[tier] : 0;
  const atLimit = tier ? cabins.length >= listingLimit : true;
  const canAddListing = isSubscriptionActive && !atLimit;

  return (
    <div>
      <SectionHeader
        title="Cabane mele"
        description={
          tier
            ? cabins.length + ' / ' + listingLimit + ' cabane (plan ' + (tier === 'basic' ? 'Basic' : 'Pro') + ')'
            : cabins.length + (cabins.length === 1 ? ' cabană înregistrată' : ' cabane înregistrate')
        }
        action={
          canAddListing ? (
            <Link href="/dashboard/owner/listings/new">
              <Button size="sm">+ Adaugă cabana</Button>
            </Link>
          ) : (
            <Button
              size="sm"
              disabled
              title={
                !isSubscriptionActive
                  ? 'Abonamentul nu este activ'
                  : 'Ai atins limita planului tău'
              }
            >
              + Adaugă cabana
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
            Abonamentul tău nu este activ. {''}
            <Link href="/pricing" className="font-medium underline hover:text-yellow-900">
              Alege un plan
            </Link>{' '}
            pentru a putea publica cabane.
          </span>
        </div>
      )}

      {isSubscriptionActive && atLimit && (
        <div
          role="alert"
          className="mb-6 flex items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-800"
        >
          <span aria-hidden="true">ℹ️</span>
          <span>
            {'Ai atins limita de ' + listingLimit + (listingLimit === 1 ? ' cabană' : ' cabane') + ' pentru planul tău. '}
            {tier === 'basic' && (
              <Link href="/pricing" className="font-medium underline hover:text-indigo-900">
                Upgradează la Pro
              </Link>
            )}
            {tier === 'basic' && ' pentru 5 cabane active.'}
          </span>
        </div>
      )}

      {!result.ok && (
        <div
          role="alert"
          className="mb-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          Nu s-au putut încărca listingurile. Încearcă din nou.
        </div>
      )}

      {result.ok && cabins.length === 0 && (
        <EmptyState
          icon="🏠"
          title="Nu ai nicio cabană"
          description="Adaugă prima ta cabană pentru a începe să primești rezervări."
          action={
            isSubscriptionActive
              ? { label: '+ Adaugă cabana', href: '/dashboard/owner/listings/new' }
              : undefined
          }
        />
      )}

      {result.ok && cabins.length > 0 && (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm" aria-label="Cabane mele">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th scope="col" className="px-4 py-3">Titlu</th>
                <th scope="col" className="px-4 py-3">Locație</th>
                <th scope="col" className="px-4 py-3">Preț / noapte</th>
                <th scope="col" className="px-4 py-3">Oaspeți max.</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3">Actualizat</th>
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
                  <td className="px-4 py-3 text-gray-700">{cabin.pricePerNight} RON</td>
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
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(cabin.updatedAt).toLocaleDateString('ro-RO')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={'/dashboard/owner/listings/' + cabin.id + '/edit'}
                        className="rounded-md border border-indigo-200 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        Editează
                      </Link>
                      <TogglePublishButton
                        cabinId={cabin.id}
                        published={cabin.published}
                      />
                      <Link
                        href={'/cabins/' + cabin.slug}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-400 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
                      >
                        Previzualizare ↗
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
