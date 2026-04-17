import type { ReactNode } from 'react';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth/authorization';
import { LogoutButton } from '@/components/ui/LogoutButton';
import { getProfile } from '@/modules/users/application/userService';
import { getTranslations } from 'next-intl/server';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { DashboardNav } from '@/components/ui/DashboardNav';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await requireAuth();
  const profileResult = await getProfile(session.uid);
  const role = profileResult.ok ? profileResult.data.role : session.role;
  const t = await getTranslations('nav');

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-white px-4 py-3 shadow-sm">
        <nav
          className="mx-auto flex max-w-5xl items-center justify-between"
          aria-label={t('mainNav')}
        >
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-bold text-pine-700 hover:text-pine-800 focus:outline-none focus:ring-2 focus:ring-pine-500 rounded"
          >
            <span
              className="flex h-7 w-7 items-center justify-center rounded-full bg-pine-600 text-white text-xs"
              aria-hidden="true"
            >
              🏔️
            </span>
            <span className="hidden sm:inline">Cabane Apuseni</span>
          </Link>
          <div className="flex flex-wrap items-center gap-1">
            <DashboardNav role={role} />
            <LogoutButton />
            <LanguageSwitcher />
          </div>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">{children}</main>
      <footer className="border-t py-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Cabane Apuseni
      </footer>
    </div>
  );
}
