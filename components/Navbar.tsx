'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { signOut } from '@/lib/auth';

export default function Navbar() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch { /* ignore */ }
  };

  return (
    <nav
      className="bg-forest-900 text-white sticky top-0 z-50 shadow-lg"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl hover:text-forest-200 transition-colors"
          >
            <span aria-hidden="true">🏔️</span>
            <span>Cabane Apuseni</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-forest-100 hover:text-white text-sm transition-colors">
              Browse
            </Link>
            {profile?.role === 'owner' && (
              <Link href="/owner/listings" className="text-forest-100 hover:text-white text-sm transition-colors">
                My Listings
              </Link>
            )}
            {profile && (
              <Link href="/messages" className="text-forest-100 hover:text-white text-sm transition-colors">
                Messages
              </Link>
            )}
            {profile?.role === 'admin' && (
              <Link href="/admin/moderation" className="text-forest-100 hover:text-white text-sm transition-colors">
                Moderation
              </Link>
            )}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {!loading && !user && (
              <>
                <Link href="/auth/login" className="text-forest-100 hover:text-white text-sm transition-colors">
                  Sign In
                </Link>
                <Link href="/auth/register" className="bg-earth-600 hover:bg-earth-700 text-white text-sm px-3 py-1.5 rounded-lg transition-colors">
                  Register
                </Link>
              </>
            )}
            {!loading && user && (
              <div className="flex items-center gap-3">
                <span className="text-forest-200 text-sm truncate max-w-[8rem]">
                  {profile?.displayName ?? user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="bg-forest-700 hover:bg-forest-600 text-white text-sm px-3 py-1.5 rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-forest-700 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label="Toggle navigation menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div id="mobile-menu" className="md:hidden py-4 border-t border-forest-700 flex flex-col gap-3">
            <Link href="/"                className="text-forest-100 hover:text-white text-sm py-1" onClick={() => setMenuOpen(false)}>Browse</Link>
            {profile?.role === 'owner' && (
              <Link href="/owner/listings" className="text-forest-100 hover:text-white text-sm py-1" onClick={() => setMenuOpen(false)}>My Listings</Link>
            )}
            {profile && (
              <Link href="/messages"       className="text-forest-100 hover:text-white text-sm py-1" onClick={() => setMenuOpen(false)}>Messages</Link>
            )}
            {profile?.role === 'admin' && (
              <Link href="/admin/moderation" className="text-forest-100 hover:text-white text-sm py-1" onClick={() => setMenuOpen(false)}>Moderation</Link>
            )}
            {!loading && !user && (
              <>
                <Link href="/auth/login"    className="text-forest-100 hover:text-white text-sm py-1" onClick={() => setMenuOpen(false)}>Sign In</Link>
                <Link href="/auth/register" className="text-forest-100 hover:text-white text-sm py-1" onClick={() => setMenuOpen(false)}>Register</Link>
              </>
            )}
            {!loading && user && (
              <button
                onClick={() => { handleSignOut(); setMenuOpen(false); }}
                className="text-forest-100 hover:text-white text-sm py-1 text-left"
              >
                Sign Out
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
