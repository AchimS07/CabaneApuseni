'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface DashboardNavProps {
  role: string;
}

function NavLink({
  href,
  children,
  external,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

  return (
    <li>
      <Link
        href={href}
        aria-current={isActive ? 'page' : undefined}
        className={[
          'rounded-md px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-brand',
          isActive
            ? 'bg-rose-50 text-brand font-semibold'
            : 'text-gray-600 hover:bg-rose-50 hover:text-brand',
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

export function DashboardNav({ role }: DashboardNavProps) {
  const t = useTranslations('nav');

  return (
    <ul className="flex flex-wrap items-center gap-1">
      <NavLink href="/cabins" external>
        {t('cabins')}
      </NavLink>

      {role !== 'owner' && role !== 'admin' && (
        <NavLink href="/dashboard/bookings">{t('myBookings')}</NavLink>
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
