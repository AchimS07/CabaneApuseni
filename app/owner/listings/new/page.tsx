import { redirect } from 'next/navigation';

/**
 * Legacy new listing page.
 * Redirects to the canonical dashboard.
 */
export default function NewListingPage() {
  redirect('/dashboard');
}
