import { redirect } from 'next/navigation';

/**
 * Legacy admin moderation page.
 * Redirects to the canonical admin dashboard.
 */
export default function ModerationPage() {
  redirect('/admin');
}
