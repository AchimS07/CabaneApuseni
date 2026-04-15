import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { requireOwner } from '@/lib/auth/authorization';
import { getCabinById } from '@/modules/cabins/infrastructure/firestoreCabinRepository';
import { SectionHeader } from '@/components/ui/SectionHeader';
import CabinForm from '@/components/forms/CabinForm';

interface Props {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const cabin = await getCabinById(id);
  return { title: cabin ? `Editează: ${cabin.title}` : 'Editează cabana' };
}

export default async function EditListingPage({ params }: Props) {
  const session = await requireOwner();
  const { id } = await params;

  const cabinOrNull = await getCabinById(id);

  // 404 if cabin doesn't exist
  if (!cabinOrNull) notFound();

  const cabin = cabinOrNull as NonNullable<typeof cabinOrNull>;

  // Authorization: owner can only edit their own cabins; admins can edit any
  if (session.role !== 'admin' && cabin.ownerId !== session.uid) {
    notFound();
  }

  return (
    <div>
      <SectionHeader
        title="Editează cabana"
        description={cabin.title}
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
        <CabinForm cabin={cabin} />
      </div>
    </div>
  );
}
