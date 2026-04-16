import type { Metadata } from 'next';
import Link from 'next/link';
import { requireOwner } from '@/lib/auth/authorization';
import { SectionHeader } from '@/components/ui/SectionHeader';
import CabinForm from '@/components/forms/CabinForm';

export const metadata: Metadata = { title: 'Adaugă cabana' };

interface Props {
  searchParams: Promise<{ redirectTo?: string }>;
}

export default async function NewListingPage({ searchParams }: Props) {
  await requireOwner();
  const { redirectTo } = await searchParams;
  // Only allow relative paths to prevent open redirect
  const safeRedirect =
    redirectTo && redirectTo.startsWith('/') ? redirectTo : undefined;
  const backHref = safeRedirect ?? '/dashboard/owner/listings';

  return (
    <div>
      <SectionHeader
        title="Adaugă cabana"
        description="Completează detaliile noii tale cabane."
      />

      <nav aria-label="Navigare" className="mb-6 text-sm text-gray-500">
        <Link
          href={backHref}
          className="hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
        >
          ← Înapoi
        </Link>
      </nav>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <CabinForm redirectPath={safeRedirect} />
      </div>
    </div>
  );
}
