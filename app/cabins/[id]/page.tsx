import { redirect } from 'next/navigation';

/**
 * Legacy cabin detail route (by Firestore auto-ID).
 * Redirects to the cabin listing. The canonical route is /cabins/[slug].
 */
export default function LegacyCabinDetailPage() {
  redirect('/cabins');
}
