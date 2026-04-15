import type { Metadata } from 'next';
import Link from 'next/link';
import { requireOwner } from '@/lib/auth/authorization';
import { SectionHeader } from '@/components/ui/SectionHeader';
import CabinForm from '@/components/forms/CabinForm';

export const metadata: Metadata = { title: 'Adaugă cabana' };

export default async function NewListingPage() {
  await requireOwner();

  return (
    <div>
      <SectionHeader
        title="Adaugă cabana"
        description="Completează detaliile noii tale cabane."
      />

      <nav aria-label="Navigare" className="mb-6 text-sm text-gray-500">
        <Link
          href="/dashboard/owner/listings"
          className="hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
        >
          ← Înapoi la cabane mele
        </Link>
      </nav>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <CabinForm />
      </div>
    </div>
  );
}
