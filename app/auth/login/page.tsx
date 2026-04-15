import { redirect } from 'next/navigation';

/**
 * Legacy login page — redirects to canonical /login route.
 * The canonical implementation lives in app/(auth)/login.
 */
export default function LegacyLoginPage() {
  redirect('/login');
}
// ’
