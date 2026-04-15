'use client';

import { useState } from 'react';
import Link from 'next/link';
import { logout } from '@/modules/auth/application/authService';
import { useRouter } from 'next/navigation';

interface PublicHeaderProps {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isOwner?: boolean;
}

/**
 * Site-wide public header.
 * Receives auth state from the server layout (no client Firebase call needed).
 * Handles mobile hamburger toggle locally.
 */
export function PublicHeader({ isAuthenticated, isAdmin, isOwner = false }: PublicHeaderProps) {
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
    <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur-sm">
      <nav
        className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3"
        aria-label="Navigare principală"
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold text-indigo-700 hover:text-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded"
          onClick={close}
        >
          <span aria-hidden="true">🏔️</span>
          <span>Cabane Apuseni</span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-1 text-sm font-medium md:flex">
          <li>
            <Link
              href="/cabins"
              className="rounded-md px-3 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                    className="rounded-md px-3 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    Admin
                  </Link>
                </li>
              )}
              {isOwner && !isAdmin && (
                <li>
                  <Link
                    href="/dashboard/owner"
                    className="rounded-md px-3 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    Dashboard proprietar
                  </Link>
                </li>
              )}
              {!isAdmin && (
                <li>
                  <Link
                    href="/dashboard/bookings"
                    className="rounded-md px-3 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    Rezervările mele
                  </Link>
                </li>
              )}
              <li>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="rounded-md px-3 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
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
                  className="rounded-md px-3 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Autentificare
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="rounded-md bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Înregistrare
                </Link>
              </li>
            </>
          )}
        </ul>

        {/* Mobile hamburger */}
        <button
          className="rounded-md p-2 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 md:hidden"
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
          className="border-t bg-white px-4 py-3 md:hidden"
        >
          <ul className="flex flex-col gap-1 text-sm font-medium">
            <li>
              <Link
                href="/cabins"
                onClick={close}
                className="block rounded-md px-3 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
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
                      className="block rounded-md px-3 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
                    >
                      Admin
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
                      Dashboard proprietar
                    </Link>
                  </li>
                )}
                {!isAdmin && (
                  <li>
                    <Link
                      href="/dashboard/bookings"
                      onClick={close}
                      className="block rounded-md px-3 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
                    >
                      Rezervările mele
                    </Link>
                  </li>
                )}
                <li>
                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="block w-full rounded-md px-3 py-2 text-left text-red-600 hover:bg-red-50 disabled:opacity-50"
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
                    className="block rounded-md px-3 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
                  >
                    Autentificare
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    onClick={close}
                    className="block rounded-md bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-700"
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
