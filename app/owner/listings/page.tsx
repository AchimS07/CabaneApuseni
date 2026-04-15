import { redirect } from 'next/navigation';

/**
 * Legacy owner listings page.
 * Redirects to the canonical dashboard.
 */
export default function OwnerListingsPage() {
  redirect('/dashboard');
}
