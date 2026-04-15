import { redirect } from 'next/navigation';

/**
 * Legacy edit listing page.
 * Redirects to the canonical dashboard.
 */
export default function EditListingPage() {
  redirect('/dashboard');
}
