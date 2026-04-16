'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDownIcon } from './Icons';
import { useTranslations } from 'next-intl';

function AccordionColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 md:border-none">
      {/* Mobile: accordion header */}
      <button
        type="button"
        className="flex w-full items-center justify-between py-4 text-left text-sm font-semibold text-gray-900 md:hidden"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        {title}
        <ChevronDownIcon
          size={16}
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {/* Desktop: always visible heading */}
      <p className="mb-4 hidden text-xs font-semibold uppercase tracking-widest text-gray-900 md:block">
        {title}
      </p>

      {/* Links */}
      <ul
        className={`flex flex-col gap-3 pb-4 md:block md:pb-0 ${open ? 'block' : 'hidden md:block'}`}
      >
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-sm text-gray-500 transition hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const t = useTranslations('footer');
  const year = new Date().getFullYear();

  const footerColumns = [
    {
      title: t('support'),
      links: [
        { label: t('helpCenter'), href: '/contact' },
        { label: t('accountSafety'), href: '/contact' },
        { label: t('reportProblem'), href: '/contact' },
      ],
    },
    {
      title: t('community'),
      links: [
        { label: t('blog'), href: '/' },
        { label: t('travelStories'), href: '/' },
        { label: t('partnerships'), href: '/contact' },
      ],
    },
    {
      title: t('hosting'),
      links: [
        { label: t('becomeHost'), href: '/register' },
        { label: t('hostResources'), href: '/' },
        { label: t('hostDashboard'), href: '/dashboard/owner' },
      ],
    },
    {
      title: t('company'),
      links: [
        { label: t('aboutUs'), href: '/' },
        { label: t('contact'), href: '/contact' },
        { label: t('terms'), href: '/' },
        { label: t('privacy'), href: '/' },
        { label: t('accessibility'), href: '/' },
      ],
    },
  ];

  return (
    <footer className="border-t border-gray-200 bg-gray-50" aria-label="Footer">
      {/* Main columns */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-0 md:grid-cols-4 md:gap-8">
          {footerColumns.map((col) => (
            <AccordionColumn key={col.title} title={col.title} links={col.links} />
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-200">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500">
            {t('copyright', { year })}
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <Link
              href="/"
              className="transition hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              {t('termsLink')}
            </Link>
            <span aria-hidden="true">·</span>
            <Link
              href="/"
              className="transition hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              {t('privacyLink')}
            </Link>
            <span aria-hidden="true">·</span>
            <Link
              href="/"
              className="transition hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              {t('sitemapLink')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
