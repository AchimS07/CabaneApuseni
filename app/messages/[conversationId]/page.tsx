import { redirect } from 'next/navigation';

/**
 * Legacy conversation page.
 * Redirects to the canonical dashboard.
 */
export default function ConversationPage() {
  redirect('/dashboard');
}
