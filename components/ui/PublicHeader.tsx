'use client';

import { useState } from 'react';
import Link from 'next/link';
import { logout } from '@/modules/auth/application/authService';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

interface PublicHeaderProps {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isOwner?: boolean;
}

/**
 * Site-wide public header — Airbnb-inspired design.
 * White background, forest-green brand color, pill-shaped CTA.
 */
export function PublicHeader({ isAuthenticated, isAdmin, isOwner = false }: PublicHeaderProps) {
  const router = useRouter();
  const t = useTranslations('nav');
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const close = () => setMenuOpen(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
      router.push('/');
      router.refresh();
    } finally {
      setLoggingOut(false);
      close();
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur-sm">
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6"
        aria-label={t('mainNav')}
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-forest-700 hover:text-forest-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-2 rounded-md"
          onClick={close}
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full bg-forest-600 text-white text-sm"
            aria-hidden="true"
          >
            🏔️
          </span>
          <span>Cabane Apuseni</span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-1 text-sm font-medium md:flex">
          <li>
            <Link
              href="/cabins"
              className="rounded-full px-4 py-2 text-gray-700 transition hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-500"
            >
              {t('cabins')}
            </Link>
          </li>
          <li>
            <Link
              href="/#pricing"
              className="rounded-md px-3 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {t('pricing')}
            </Link>
          </li>

          {isAuthenticated ? (
            <>
              {isAdmin && (
                <li>
                  <Link
                    href="/admin"
                    className="rounded-full px-4 py-2 text-gray-700 transition hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-500"
                  >
                    {t('admin')}
                  </Link>
                </li>
              )}
              {isOwner && !isAdmin && (
                <li>
                  <Link
                    href="/dashboard/owner"
                    className="rounded-md px-3 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {t('ownerDashboard')}
                  </Link>
                </li>
              )}
              {!isAdmin && (
                <li>
                  <Link
                    href="/dashboard/bookings"
                    className="rounded-full px-4 py-2 text-gray-700 transition hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-500"
                  >
                    {t('myBookings')}
                  </Link>
                </li>
              )}
              <li>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="rounded-full px-4 py-2 text-red-600 transition hover:bg-red-50 hover:text-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-50"
                >
                  {loggingOut ? t('loggingOut') : t('logout')}
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link
                  href="/login"
                  className="rounded-full px-4 py-2 text-gray-700 transition hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-500"
                >
                  {t('signIn')}
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="btn-primary py-2 px-5 text-sm"
                >
                  {t('register')}
                </Link>
              </li>
            </>
          )}

          <li>
            <LanguageSwitcher />
          </li>
        </ul>

        {/* Mobile hamburger */}
        <button
          className="rounded-full p-2 text-gray-600 transition hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 md:hidden"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? t('closeMenu') : t('openMenu')}
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="border-t border-gray-100 bg-white px-4 py-3 md:hidden"
        >
          <ul className="flex flex-col gap-1 text-sm font-medium">
            <li>
              <Link
                href="/cabins"
                onClick={close}
                className="block rounded-xl px-3 py-2.5 text-gray-700 transition hover:bg-forest-50 hover:text-forest-700"
              >
                {t('cabins')}
              </Link>
            </li>
            <li>
              <Link
                href="/#pricing"
                onClick={close}
                className="block rounded-md px-3 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
              >
                {t('pricing')}
              </Link>
            </li>

            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <li>
                    <Link
                      href="/admin"
                      onClick={close}
                      className="block rounded-xl px-3 py-2.5 text-gray-700 transition hover:bg-forest-50 hover:text-forest-700"
                    >
                      {t('admin')}
                    </Link>
                  </li>
                )}
                {isOwner && !isAdmin && (
                  <li>
                    <Link
                      href="/dashboard/owner"
                      onClick={close}
                      className="block rounded-md px-3 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
                    >
                      {t('ownerDashboard')}
                    </Link>
                  </li>
                )}
                {!isAdmin && (
                  <li>
                    <Link
                      href="/dashboard/bookings"
                      onClick={close}
                      className="block rounded-xl px-3 py-2.5 text-gray-700 transition hover:bg-forest-50 hover:text-forest-700"
                    >
                      {t('myBookings')}
                    </Link>
                  </li>
                )}
                <li>
                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="block w-full rounded-xl px-3 py-2.5 text-left text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    {loggingOut ? t('loggingOut') : t('logout')}
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    href="/login"
                    onClick={close}
                    className="block rounded-xl px-3 py-2.5 text-gray-700 transition hover:bg-forest-50 hover:text-forest-700"
                  >
                    {t('signIn')}
                  </Link>
                </li>
                <li className="pt-1">
                  <Link
                    href="/register"
                    onClick={close}
                    className="btn-primary block w-full text-center py-2.5"
                  >
                    {t('register')}
                  </Link>
                </li>
              </>
            )}

            <li className="pt-2 border-t mt-1">
              <LanguageSwitcher />
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
