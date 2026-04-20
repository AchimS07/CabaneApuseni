'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Suspense } from 'react';

interface DashboardNavProps {
  role: string;
}

function NavLink({
  href,
  children,
  external,
  activeSearch,
  notActiveSearch,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
  /** Link is active only when pathname AND this search param match. */
  activeSearch?: string;
  /** Link is inactive when pathname AND this search param match. */
  notActiveSearch?: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  let isActive: boolean;
  if (activeSearch) {
    // Match by pathname + a specific search param value (e.g. view=favorites)
    const [basePath, query] = activeSearch.split('?');
    const [paramKey, paramValue] = (query ?? '').split('=');
    isActive = pathname === basePath && searchParams.get(paramKey) === paramValue;
  } else {
    isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
  }

  // Explicitly suppress active state when a disqualifying search param is present
  if (isActive && notActiveSearch) {
    const [basePath, query] = notActiveSearch.split('?');
    const [paramKey, paramValue] = (query ?? '').split('=');
    if (pathname === basePath && searchParams.get(paramKey) === paramValue) {
      isActive = false;
    }
  }

  return (
    <li>
      <Link
        href={href}
        aria-current={isActive ? 'page' : undefined}
        className={[
          'rounded-md px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-pine-500',
          isActive
            ? 'bg-pine-50 text-pine-700 font-semibold'
            : 'text-gray-600 hover:bg-pine-50 hover:text-pine-700',
        ].join(' ')}
      >
        {children}
        {external && (
          <span className="ml-1 text-xs opacity-60" aria-hidden="true">
            ↗
          </span>
        )}
      </Link>
    </li>
  );
}

function DashboardNavInner({ role }: DashboardNavProps) {
  const t = useTranslations('nav');

  return (
    <ul className="flex flex-wrap items-center gap-1">
      <NavLink href="/dashboard">{t('home')}</NavLink>

      {role !== 'owner' && role !== 'admin' && (
        <>
          <NavLink href="/cabins" external>
            {t('cabins')}
          </NavLink>

          <NavLink href="/dashboard/bookings">{t('myBookings')}</NavLink>

          <NavLink href="/dashboard/favorites">{t('favorites')}</NavLink>
        </>
      )}

      {role === 'owner' && (
        <>
          <NavLink href="/dashboard/owner/listings">{t('myListings')}</NavLink>
          <NavLink href="/dashboard/owner/bookings">{t('bookings')}</NavLink>
        </>
      )}

      <NavLink href="/dashboard/profile">{t('profile')}</NavLink>
    </ul>
  );
}

export function DashboardNav({ role }: DashboardNavProps) {
  return (
    <Suspense fallback={null}>
      <DashboardNavInner role={role} />
    </Suspense>
  );
}
