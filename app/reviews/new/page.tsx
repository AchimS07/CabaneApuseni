import { redirect } from 'next/navigation';

/**
 * Legacy new review page.
 * Redirects to the canonical dashboard.
 */
export default function NewReviewPage() {
  redirect('/dashboard');
}
