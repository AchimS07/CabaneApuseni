import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireOwner } from '@/lib/auth/authorization';
import { getProfile } from '@/modules/users/application/userService';
import { getOwnerCabins } from '@/modules/cabins/application/cabinService';
import { LISTING_LIMITS } from '@/lib/subscription/plans';
import { SectionHeader } from '@/components/ui/SectionHeader';
import CabinForm from '@/components/forms/CabinForm';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('ownerNewListing');
  return { title: t('metaTitle') };
}

interface Props {
  searchParams: Promise<{ redirectTo?: string }>;
}

export default async function NewListingPage({ searchParams }: Props) {
  const session = await requireOwner();
  const { redirectTo } = await searchParams;
  const t = await getTranslations('ownerNewListing');
  // Only allow relative paths to prevent open redirect
  const safeRedirect =
    redirectTo && redirectTo.startsWith('/') ? redirectTo : undefined;
  const backHref = safeRedirect ?? '/dashboard/owner/listings';

  const [profileResult, cabinsResult] = await Promise.all([
    getProfile(session.uid),
    getOwnerCabins(session.uid),
  ]);

  const profile = profileResult.ok ? profileResult.data : null;

  if (!profile || profile.subscriptionStatus !== 'active') {
    redirect('/dashboard/owner/listings?error=subscription');
  }

  const tier = profile.subscriptionTier;
  if (!tier) {
    redirect('/dashboard/owner/listings?error=subscription');
  }

  const cabins = cabinsResult.ok ? cabinsResult.data : [];
  if (cabins.length >= LISTING_LIMITS[tier]) {
    redirect('/dashboard/owner/listings?error=limit');
  }

  return (
    <div>
      <SectionHeader
        title={t('title')}
        description={t('description')}
      />

      <nav aria-label="Navigare" className="mb-6 text-sm text-gray-500">
        <Link
          href={backHref}
          className="hover:text-pine-600 focus:outline-none focus:ring-2 focus:ring-pine-500 rounded"
        >
          {t('back')}
        </Link>
      </nav>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <CabinForm redirectPath={safeRedirect} />
      </div>
    </div>
  );
}
