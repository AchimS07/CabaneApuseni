import type { ReactNode } from 'react';
import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/authorization';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r bg-gray-50 px-4 py-6">
        <Link href="/admin" className="mb-6 block text-lg font-bold text-indigo-700">
          Admin
        </Link>
        <nav>
          <ul className="space-y-1 text-sm font-medium">
            <li>
              <Link
                href="/admin"
                className="block rounded-md px-3 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
              >
                Tablou de bord
              </Link>
            </li>
            <li>
              <Link
                href="/admin/cabins"
                className="block rounded-md px-3 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
              >
                Cabane
              </Link>
            </li>
            <li>
              <Link
                href="/"
                className="block rounded-md px-3 py-2 text-gray-500 hover:bg-gray-100"
              >
                ← Site public
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 px-8 py-8">{children}</main>
    </div>
  );
}
