import { redirect } from 'next/navigation';

/**
 * Legacy messages page.
 * Redirects to the canonical dashboard.
 */
export default function MessagesPage() {
  redirect('/dashboard');
}
