import type { Metadata } from 'next';
import Link from 'next/link';
import { requireOwner } from '@/lib/auth/authorization';
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
  await requireOwner();
  const { redirectTo } = await searchParams;
  const t = await getTranslations('ownerNewListing');
  // Only allow relative paths to prevent open redirect
  const safeRedirect =
    redirectTo && redirectTo.startsWith('/') ? redirectTo : undefined;
  const backHref = safeRedirect ?? '/dashboard/owner/listings';

  return (
    <div>
      <SectionHeader
        title={t('title')}
        description={t('description')}
      />

      <nav aria-label="Navigare" className="mb-6 text-sm text-gray-500">
        <Link
          href={backHref}
          className="hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
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
