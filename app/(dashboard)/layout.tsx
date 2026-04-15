import type { ReactNode } from 'react';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth/authorization';
import { LogoutButton } from '@/components/ui/LogoutButton';
import { getProfile } from '@/modules/users/application/userService';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await requireAuth();
  const profileResult = await getProfile(session.uid);
  const role = profileResult.ok ? profileResult.data.role : session.role;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-white px-4 py-3 shadow-sm">
        <nav
          className="mx-auto flex max-w-5xl items-center justify-between"
          aria-label="Navigare tablou de bord"
        >
          <Link
            href="/"
            className="font-bold text-brand hover:text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand rounded"
          >
            Cabane Apuseni
          </Link>
          <ul className="flex flex-wrap items-center gap-1 text-sm font-medium">
            <li>
              <Link
                href="/cabins"
                className="rounded-md px-3 py-2 text-gray-600 hover:bg-rose-50 hover:text-brand focus:outline-none focus:ring-2 focus:ring-brand"
              >
                Cabane
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/bookings"
                className="rounded-md px-3 py-2 text-gray-700 hover:bg-rose-50 hover:text-brand focus:outline-none focus:ring-2 focus:ring-brand"
              >
                Rezervările mele
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard"
                className="rounded-md px-3 py-2 text-gray-700 hover:bg-rose-50 hover:text-brand focus:outline-none focus:ring-2 focus:ring-brand"
              >
                Favorite
              </Link>
            </li>
            {role === 'owner' && (
              <>
                <li>
                  <Link
                    href="/dashboard/owner"
                    className="rounded-md px-3 py-2 text-gray-700 hover:bg-rose-50 hover:text-brand focus:outline-none focus:ring-2 focus:ring-brand"
                  >
                    Owner
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/owner/listings"
                    className="rounded-md px-3 py-2 text-gray-700 hover:bg-rose-50 hover:text-brand focus:outline-none focus:ring-2 focus:ring-brand"
                  >
                    Cabane mele
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/owner/bookings"
                    className="rounded-md px-3 py-2 text-gray-700 hover:bg-rose-50 hover:text-brand focus:outline-none focus:ring-2 focus:ring-brand"
                  >
                    Rezervări
                  </Link>
                </li>
              </>
            )}
            <li>
              <LogoutButton />
            </li>
          </ul>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">{children}</main>
      <footer className="border-t py-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Cabane Apuseni
      </footer>
    </div>
  );
}
