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
            className="flex items-center gap-2 font-extrabold text-forest-700 hover:text-forest-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 rounded-md"
          >
            <span
              className="flex h-7 w-7 items-center justify-center rounded-full bg-forest-600 text-white text-xs"
              aria-hidden="true"
            >
              🏔️
            </span>
            Cabane Apuseni
          </Link>
          <ul className="flex flex-wrap items-center gap-1 text-sm font-medium">
            <li>
              <Link
                href="/cabins"
                className="rounded-full px-4 py-2 text-gray-600 transition hover:bg-forest-50 hover:text-forest-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-500"
              >
                Cabane
              </Link>
            </li>
            {role !== 'owner' && (
              <li>
                <Link
                  href="/dashboard/bookings"
                  className="rounded-full px-4 py-2 text-gray-700 transition hover:bg-forest-50 hover:text-forest-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-500"
                >
                  Rezervările mele
                </Link>
              </li>
            )}
            {role === 'owner' && (
              <>
                <li>
                  <Link
                    href="/dashboard/owner"
                    className="rounded-full px-4 py-2 text-gray-700 transition hover:bg-forest-50 hover:text-forest-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-500"
                  >
                    Owner
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/owner/listings"
                    className="rounded-full px-4 py-2 text-gray-700 transition hover:bg-forest-50 hover:text-forest-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-500"
                  >
                    Cabane mele
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/owner/bookings"
                    className="rounded-full px-4 py-2 text-gray-700 transition hover:bg-forest-50 hover:text-forest-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-500"
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
