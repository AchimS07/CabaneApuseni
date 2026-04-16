import type { ReactNode } from 'react';
import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/authorization';
import { LogoutButton } from '@/components/ui/LogoutButton';
import { getTranslations } from 'next-intl/server';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();
  const t = await getTranslations('adminCabins');
  const tNav = await getTranslations('nav');
  const tAdmin = await getTranslations('adminDashboard');

  return (
    <div className="flex min-h-screen flex-col">
      {/* ── Mobile top bar (hidden on lg) ── */}
      <header className="border-b bg-white px-4 py-3 shadow-sm lg:hidden">
        <nav
          className="flex items-center justify-between"
          aria-label={tNav('mainNav')}
        >
          <Link href="/admin" className="font-bold text-indigo-700">
            Admin
          </Link>
          <ul className="flex items-center gap-3 text-sm font-medium">
            <li>
              <Link
                href="/admin"
                className="text-gray-700 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
              >
                {tAdmin('title')}
              </Link>
            </li>
            <li>
              <Link
                href="/admin/cabins"
                className="text-gray-700 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
              >
                {t('title')}
              </Link>
            </li>
            <li>
              <LanguageSwitcher />
            </li>
            <li>
              <LogoutButton />
            </li>
          </ul>
        </nav>
      </header>

      {/* ── Desktop layout: sidebar + content ── */}
      <div className="flex flex-1">
        {/* Sidebar (hidden on mobile) */}
        <aside className="hidden w-56 shrink-0 border-r bg-gray-50 px-4 py-6 lg:block">
          <Link
            href="/admin"
            className="mb-6 block text-lg font-bold text-indigo-700 hover:text-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
          >
            Admin
          </Link>
          <nav aria-label={t('adminNav')}>
            <ul className="space-y-1 text-sm font-medium">
              <li>
                <Link
                  href="/admin"
                  className="block rounded-md px-3 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {tAdmin('title')}
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/cabins"
                  className="block rounded-md px-3 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {t('title')}
                </Link>
              </li>
              <li className="pt-2 border-t mt-2">
                <Link
                  href="/"
                  className="block rounded-md px-3 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  {tNav('publicSite')}
                </Link>
              </li>
              <li>
                <div className="px-3 py-2">
                  <LogoutButton />
                </div>
              </li>
              <li>
                <div className="px-3 py-2">
                  <LanguageSwitcher />
                </div>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-x-auto px-4 py-8 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
