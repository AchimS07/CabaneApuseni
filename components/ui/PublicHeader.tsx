'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { logout } from '@/modules/auth/application/authService';
import {
  SearchIcon,
  MenuIcon,
  XIcon,
  UserIcon,
  MapPinIcon,
  CalendarIcon,
  UsersIcon,
  ChevronDownIcon,
} from './Icons';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

interface PublicHeaderProps {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isOwner?: boolean;
  variant?: 'full' | 'minimal';
}

type ActiveField = 'location' | 'checkin' | 'checkout' | 'guests' | null;

/**
 * AirBnb-inspired public header.
 * – Logo left
 * – Pill search bar center (Location · Check-in · Check-out · Guests)
 * – User menu right (hamburger + avatar)
 * – Sticky with shadow on scroll
 * – Fully accessible keyboard navigation
 */
export function PublicHeader({ isAuthenticated, isAdmin, isOwner = false, variant = 'full' }: PublicHeaderProps) {
  const router = useRouter();
  const t = useTranslations('nav');
  const th = useTranslations('publicHeader');
  const pathname = usePathname();

  // Scroll shadow
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Mobile drawer
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  // Close mobile menu on route change
  useEffect(() => { closeMobile(); }, [pathname, closeMobile]);

  // Logout
  const [loggingOut, setLoggingOut] = useState(false);
  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
      router.push('/');
      router.refresh();
    } finally {
      setLoggingOut(false);
      closeMobile();
      setProfileOpen(false);
    }
  }

  // Profile dropdown
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!profileOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [profileOpen]);

  // Search bar fields
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [activeField, setActiveField] = useState<ActiveField>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);

  // Close search dropdowns when clicking outside
  useEffect(() => {
    if (!activeField) return;
    function onClickOutside(e: MouseEvent) {
      if (searchBarRef.current && !searchBarRef.current.contains(e.target as Node)) {
        setActiveField(null);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [activeField]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setActiveField(null);
    const params = new URLSearchParams();
    if (location.trim()) params.set('location', location.trim());
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (guests > 1) params.set('guests', String(guests));
    router.push(`/cabins${params.toString() ? `?${params}` : ''}`);
  }

  const tomorrow = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })();

  const minCheckOut = checkIn
    ? (() => {
        const d = new Date(checkIn);
        d.setDate(d.getDate() + 1);
        return d.toISOString().split('T')[0];
      })()
    : tomorrow;

  const searchHasValue = location || checkIn || checkOut || guests > 1;

  return (
    <header
      className={[
        'sticky top-0 z-50 bg-white transition-shadow duration-200',
        scrolled ? 'shadow-nav' : 'border-b border-gray-100',
      ].join(' ')}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">

        {/* ── Logo ── */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-pine-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500 rounded-sm"
          aria-label={th('logoAriaLabel')}
        >
          <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path d="M16 3L2 28h28L16 3z" fill="#e34e1c" />
            <path d="M16 10l-7 14h14L16 10z" fill="white" opacity="0.6" />
          </svg>
          <span className="hidden text-lg font-bold tracking-tight text-pine-700 sm:block">
            Cabane Apuseni
          </span>
        </Link>

        {/* ── Search bar (desktop) ── */}
        {variant === 'full' && (
        <div
          ref={searchBarRef}
          className="hidden flex-1 md:flex md:justify-center"
        >
          <form
            onSubmit={handleSearch}
            role="search"
            aria-label={th('searchAriaLabel')}
          >
            <div
              className={[
                'flex items-stretch overflow-hidden rounded-full border transition-shadow duration-200',
                activeField
                  ? 'border-gray-300 shadow-lg'
                  : 'border-gray-300 shadow-sm hover:shadow-md',
              ].join(' ')}
            >
              {/* Location */}
              <button
                type="button"
                onClick={() => setActiveField(activeField === 'location' ? null : 'location')}
                className={[
                  'relative flex flex-col items-start justify-center px-5 py-2.5 transition',
                  activeField === 'location'
                    ? 'bg-white rounded-full shadow-md z-10'
                    : 'bg-white hover:bg-gray-50',
                ].join(' ')}
                aria-expanded={activeField === 'location'}
                aria-haspopup="listbox"
              >
                <span className="text-xs font-semibold text-gray-900">{th('locationLabel')}</span>
                <span className={`text-sm ${location ? 'text-gray-900' : 'text-gray-400'}`}>
                  {location || th('locationPlaceholder')}
                </span>
              </button>

              <div className="my-3 w-px bg-gray-200" aria-hidden="true" />

              {/* Check-in */}
              <button
                type="button"
                onClick={() => setActiveField(activeField === 'checkin' ? null : 'checkin')}
                className={[
                  'relative flex flex-col items-start justify-center px-5 py-2.5 transition',
                  activeField === 'checkin'
                    ? 'bg-white rounded-full shadow-md z-10'
                    : 'bg-white hover:bg-gray-50',
                ].join(' ')}
                aria-expanded={activeField === 'checkin'}
              >
                <span className="text-xs font-semibold text-gray-900">{th('checkInLabel')}</span>
                <span className={`text-sm ${checkIn ? 'text-gray-900' : 'text-gray-400'}`}>
                  {checkIn ? new Date(checkIn).toLocaleDateString(undefined, { day: '2-digit', month: 'short' }) : th('addDates')}
                </span>
              </button>

              <div className="my-3 w-px bg-gray-200" aria-hidden="true" />

              {/* Check-out */}
              <button
                type="button"
                onClick={() => setActiveField(activeField === 'checkout' ? null : 'checkout')}
                className={[
                  'relative flex flex-col items-start justify-center px-5 py-2.5 transition',
                  activeField === 'checkout'
                    ? 'bg-white rounded-full shadow-md z-10'
                    : 'bg-white hover:bg-gray-50',
                ].join(' ')}
                aria-expanded={activeField === 'checkout'}
              >
                <span className="text-xs font-semibold text-gray-900">{th('checkOutLabel')}</span>
                <span className={`text-sm ${checkOut ? 'text-gray-900' : 'text-gray-400'}`}>
                  {checkOut ? new Date(checkOut).toLocaleDateString(undefined, { day: '2-digit', month: 'short' }) : th('addDates')}
                </span>
              </button>

              <div className="my-3 w-px bg-gray-200" aria-hidden="true" />

              {/* Guests */}
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setActiveField(activeField === 'guests' ? null : 'guests')}
                  className={[
                    'flex flex-col items-start justify-center px-5 py-2.5 transition',
                    activeField === 'guests'
                      ? 'bg-white rounded-full shadow-md z-10'
                      : 'bg-white hover:bg-gray-50',
                  ].join(' ')}
                  aria-expanded={activeField === 'guests'}
                  aria-haspopup="dialog"
                >
                  <span className="text-xs font-semibold text-gray-900">{th('guestsLabel')}</span>
                  <span className={`text-sm ${guests > 1 ? 'text-gray-900' : 'text-gray-400'}`}>
                    {guests > 1 ? th('guestsCount', { count: guests }) : th('addGuests')}
                  </span>
                </button>

                {/* Search button */}
                <button
                  type="submit"
                  className={[
                    'mr-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition',
                    searchHasValue
                      ? 'bg-ember-500 text-white hover:bg-ember-600'
                      : 'bg-ember-500 text-white hover:bg-ember-600',
                  ].join(' ')}
                  aria-label={th('searchButton')}
                >
                  <SearchIcon size={16} />
                </button>
              </div>
            </div>

            {/* ── Dropdowns ── */}

            {/* Location popover */}
            {activeField === 'location' && (
              <div className="absolute top-[calc(100%+8px)] left-0 w-80 rounded-3xl border border-gray-200 bg-white p-4 shadow-xl">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {th('searchByDestination')}
                </p>
                <div className="relative">
                  <MapPinIcon
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    aria-hidden="true"
                  />
                  <input
                    autoFocus
                    type="text"
                    placeholder={th('locationInputPlaceholder')}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 py-2.5 pl-9 pr-4 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), setActiveField('checkin'))}
                  />
                </div>
                {location && (
                  <button
                    type="button"
                    className="mt-2 text-xs text-ember-600 underline"
                    onClick={() => setLocation('')}
                  >
                    {th('clear')}
                  </button>
                )}
              </div>
            )}

            {/* Check-in popover */}
            {activeField === 'checkin' && (
              <div className="absolute top-[calc(100%+8px)] left-1/4 w-72 rounded-3xl border border-gray-200 bg-white p-4 shadow-xl">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {th('checkInPopoverLabel')}
                </p>
                <div className="relative">
                  <CalendarIcon
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    aria-hidden="true"
                  />
                  <input
                    autoFocus
                    type="date"
                    value={checkIn}
                    min={tomorrow}
                    onChange={(e) => {
                      setCheckIn(e.target.value);
                      if (checkOut && e.target.value >= checkOut) setCheckOut('');
                      setActiveField('checkout');
                    }}
                    className="w-full rounded-xl border border-gray-300 py-2.5 pl-9 pr-4 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
              </div>
            )}

            {/* Check-out popover */}
            {activeField === 'checkout' && (
              <div className="absolute top-[calc(100%+8px)] left-1/3 w-72 rounded-3xl border border-gray-200 bg-white p-4 shadow-xl">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {th('checkOutPopoverLabel')}
                </p>
                <div className="relative">
                  <CalendarIcon
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    aria-hidden="true"
                  />
                  <input
                    autoFocus
                    type="date"
                    value={checkOut}
                    min={minCheckOut}
                    onChange={(e) => {
                      setCheckOut(e.target.value);
                      setActiveField('guests');
                    }}
                    className="w-full rounded-xl border border-gray-300 py-2.5 pl-9 pr-4 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
              </div>
            )}

            {/* Guests popover */}
            {activeField === 'guests' && (
              <div className="absolute top-[calc(100%+8px)] right-0 w-72 rounded-3xl border border-gray-200 bg-white p-5 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{th('guestsPopoverLabel')}</p>
                    <p className="text-xs text-gray-500">{th('guestsPopoverQuestion')}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setGuests((g) => Math.max(1, g - 1))}
                      disabled={guests <= 1}
                      aria-label={th('decreaseGuests')}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition hover:border-gray-900 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <span aria-hidden="true" className="text-lg leading-none">−</span>
                    </button>
                    <span
                      className="w-4 text-center text-sm font-medium"
                      aria-live="polite"
                      aria-atomic="true"
                    >
                      {guests}
                    </span>
                    <button
                      type="button"
                      onClick={() => setGuests((g) => Math.min(20, g + 1))}
                      aria-label={th('increaseGuests')}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition hover:border-gray-900"
                    >
                      <span aria-hidden="true" className="text-lg leading-none">+</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
        )}

        {/* ── Right: profile / nav ── */}
        <div className="flex shrink-0 items-center gap-2">
          {/* "Become a host" / "Owner dashboard" – desktop only, full variant */}
          {variant === 'full' && !isAdmin && (
            <Link
              href={isOwner ? '/dashboard/owner' : '/pricing'}
              className="hidden rounded-full px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500 lg:block"
            >
              {isOwner ? th('ownerDashboard') : th('becomeHost')}
            </Link>
          )}

          {/* Language switcher */}
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>

          {/* Profile pill */}
          <div ref={profileRef} className="relative hidden md:block">
            <button
              type="button"
              onClick={() => setProfileOpen((o) => !o)}
              aria-expanded={profileOpen}
              aria-haspopup="menu"
              aria-label={th('userMenu')}
              className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-3 py-2 shadow-sm transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500"
            >
              <MenuIcon size={16} className="text-gray-700" aria-hidden="true" />
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-600 text-white">
                <UserIcon size={16} aria-hidden="true" />
              </div>
            </button>

            {profileOpen && (
              <div
                role="menu"
                className="absolute right-0 top-[calc(100%+8px)] w-56 overflow-hidden rounded-2xl border border-gray-200 bg-white py-1 shadow-xl"
              >
                {isAuthenticated ? (
                  <>
                    {!isAdmin && !isOwner && (
                      <>
                        <Link
                          href="/dashboard/bookings"
                          role="menuitem"
                          onClick={() => setProfileOpen(false)}
                          className="block px-5 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
                        >
                          {th('myBookings')}
                        </Link>
                        <Link
                          href="/dashboard?view=favorites"
                          role="menuitem"
                          onClick={() => setProfileOpen(false)}
                          className="block px-5 py-3 text-sm text-gray-700 transition hover:bg-gray-50"
                        >
                          {th('favorites')}
                        </Link>
                      </>
                    )}
                    {isAdmin && (
                      <Link
                        href="/admin"
                        role="menuitem"
                        onClick={() => setProfileOpen(false)}
                        className="block px-5 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
                      >
                        {th('admin')}
                      </Link>
                    )}
                    {isOwner && !isAdmin && (
                      <Link
                        href="/dashboard/owner"
                        role="menuitem"
                        onClick={() => setProfileOpen(false)}
                        className="block px-5 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
                      >
                        {t('ownerDashboard')}
                      </Link>
                    )}
                    {!isAdmin && !isOwner && (
                      <Link
                        href="/dashboard/bookings"
                        role="menuitem"
                        onClick={() => setProfileOpen(false)}
                        className="block px-5 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
                      >
                        {t('myBookings')}
                      </Link>
                    )}
                    <Link
                      href="/dashboard/profile"
                      role="menuitem"
                      onClick={() => setProfileOpen(false)}
                      className="block px-5 py-3 text-sm text-gray-700 transition hover:bg-gray-50"
                    >
                      {t('myAccount')}
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="block w-full px-5 py-3 text-left text-sm text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                    >
                      {loggingOut ? th('loggingOut') : th('logout')}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      role="menuitem"
                      onClick={() => setProfileOpen(false)}
                      className="block px-5 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
                    >
                      {th('login')}
                    </Link>
                    <Link
                      href="/register"
                      role="menuitem"
                      onClick={() => setProfileOpen(false)}
                      className="block px-5 py-3 text-sm text-gray-700 transition hover:bg-gray-50"
                    >
                      {th('register')}
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile: hamburger only */}
          <button
            type="button"
            className="flex items-center gap-2 rounded-full border border-gray-300 bg-white p-2.5 shadow-sm transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500 md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? t('closeMenu') : t('openMenu')}
          >
            {mobileOpen ? (
              <XIcon size={18} className="text-gray-700" aria-hidden="true" />
            ) : (
              <MenuIcon size={18} className="text-gray-700" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile search bar ── */}
      {variant === 'full' && (
      <div className="border-t border-gray-100 px-4 pb-3 pt-2 md:hidden">
        <button
          type="button"
          onClick={() => router.push('/cabins')}
          className="flex w-full items-center gap-3 rounded-full border border-gray-200 bg-white px-4 py-3 shadow-sm transition hover:shadow-md"
          aria-label={th('mobileSearchAriaLabel')}
        >
          <SearchIcon size={16} className="shrink-0 text-gray-400" aria-hidden="true" />
          <span className="text-sm text-gray-500">{th('mobileSearchPlaceholder')}</span>
        </button>
      </div>
      )}

      {/* ── Mobile nav drawer ── */}
      {mobileOpen && (
        <nav
          id="mobile-nav"
          className="border-t border-gray-200 bg-white px-4 pb-6 pt-4 md:hidden"
          aria-label={th('mobileNavAriaLabel')}
        >
          <ul className="flex flex-col gap-1 text-sm font-medium">
            <li>
              <Link
                href="/cabins"
                onClick={closeMobile}
                className="block rounded-xl px-4 py-3 text-gray-700 transition hover:bg-gray-50"
              >
{th('cabins')}
              </Link>
            </li>
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <li>
                    <Link
                      href="/admin"
                      onClick={closeMobile}
                      className="block rounded-xl px-4 py-3 text-gray-700 transition hover:bg-gray-50"
                    >
{th('admin')}
                    </Link>
                  </li>
                )}
                {isOwner && !isAdmin && (
                  <li>
                    <Link
                      href="/dashboard/owner"
                      onClick={closeMobile}
                      className="block rounded-xl px-4 py-3 text-gray-700 transition hover:bg-gray-50"
                    >
{th('ownerDashboard')}
                    </Link>
                  </li>
                )}
                {!isAdmin && !isOwner && (
                  <>
                    <li>
                      <Link
                        href="/dashboard/bookings"
                        onClick={closeMobile}
                        className="block rounded-xl px-4 py-3 text-gray-700 transition hover:bg-gray-50"
                      >
{th('myBookings')}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/dashboard?view=favorites"
                        onClick={closeMobile}
                        className="block rounded-xl px-4 py-3 text-gray-700 transition hover:bg-gray-50"
                      >
{th('favorites')}
                      </Link>
                    </li>
                  </>
                )}
                <li>
                  <Link
                    href="/dashboard/profile"
                    onClick={closeMobile}
                    className="block rounded-xl px-4 py-3 text-gray-700 transition hover:bg-gray-50"
                  >
                    {t('myAccount')}
                  </Link>
                </li>
                <li>
                  <hr className="my-2 border-gray-100" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="block w-full rounded-xl px-4 py-3 text-left text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                  >
{loggingOut ? th('loggingOut') : th('logout')}
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    href="/login"
                    onClick={closeMobile}
                    className="block rounded-xl px-4 py-3 text-gray-700 transition hover:bg-gray-50"
                  >
{th('login')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    onClick={closeMobile}
                    className="block rounded-xl bg-ember-500 px-4 py-3 text-center text-white transition hover:bg-ember-600"
                  >
{th('register')}
                  </Link>
                </li>
              </>
            )}
          </ul>
          <div className="mt-2 px-4 pb-2">
            <LanguageSwitcher />
          </div>
        </nav>
      )}
    </header>
  );
}
