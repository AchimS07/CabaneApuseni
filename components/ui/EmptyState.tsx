import * as React from 'react';
import Link from 'next/link';

interface EmptyStateProps {
  /** Large emoji or icon to display */
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
}

/**
 * Centred empty-state placeholder used when a list has no items.
 */
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-16 text-center">
      {icon && (
        <span className="mb-4 text-5xl" aria-hidden="true">
          {icon}
        </span>
      )}
      <h2 className="text-base font-semibold text-gray-800">{title}</h2>
      {description && (
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      )}
      {action && (
        <Link
          href={action.href}
          className="mt-4 inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
