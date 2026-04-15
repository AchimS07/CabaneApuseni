'use client';

import { useState } from 'react';
import Link from 'next/link';
import { logout } from '@/modules/auth/application/authService';
import { useRouter } from 'next/navigation';

interface PublicHeaderProps {
  isAuthenticated: boolean;
  isAdmin: boolean;
}

/**
 * Site-wide public header — Airbnb-inspired design.
 * White background, forest-green brand color, pill-shaped CTA.
 */
export function PublicHeader({ isAuthenticated, isAdmin }: PublicHeaderProps) {
  const router = useRouter();
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
        aria-label="Navigare principală"
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
              Cabane
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
                    Admin
                  </Link>
                </li>
              )}
              {!isAdmin && (
                <li>
                  <Link
                    href="/dashboard/bookings"
                    className="rounded-full px-4 py-2 text-gray-700 transition hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-500"
                  >
                    Rezervările mele
                  </Link>
                </li>
              )}
              <li>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="rounded-full px-4 py-2 text-red-600 transition hover:bg-red-50 hover:text-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-50"
                >
                  {loggingOut ? 'Se deconectează…' : 'Deconectare'}
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
                  Autentificare
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="btn-primary py-2 px-5 text-sm"
                >
                  Înregistrare
                </Link>
              </li>
            </>
          )}
        </ul>

        {/* Mobile hamburger */}
        <button
          className="rounded-full p-2 text-gray-600 transition hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 md:hidden"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? 'Închide meniu' : 'Deschide meniu'}
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
                Cabane
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
                      Admin
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
                      Rezervările mele
                    </Link>
                  </li>
                )}
                <li>
                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="block w-full rounded-xl px-3 py-2.5 text-left text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    {loggingOut ? 'Se deconectează…' : 'Deconectare'}
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
                    Autentificare
                  </Link>
                </li>
                <li className="pt-1">
                  <Link
                    href="/register"
                    onClick={close}
                    className="btn-primary block w-full text-center py-2.5"
                  >
                    Înregistrare
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </header>
  );
}
