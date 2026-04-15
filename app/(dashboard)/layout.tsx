import type { ReactNode } from 'react';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth/authorization';
import { LogoutButton } from '@/components/ui/LogoutButton';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await requireAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-white px-4 py-3">
        <nav className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="font-bold text-indigo-700">
            Cabane Apuseni
          </Link>
          <ul className="flex gap-4 text-sm font-medium">
            <li>
              <Link href="/dashboard" className="text-gray-700 hover:text-indigo-700">
                Tablou de bord
              </Link>
            </li>
            <li>
              <Link href="/dashboard/bookings" className="text-gray-700 hover:text-indigo-700">
                Rezervările mele
              </Link>
            </li>
            <li>
              <LogoutButton />
            </li>
          </ul>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">{children}</main>
    </div>
  );
}
