import * as React from 'react';
import Link from 'next/link';

interface EmptyStateProps {
  /** Large emoji or icon to display */
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    /** Navigate to this href */
    href?: string;
    /** Or call this function */
    onClick?: () => void;
  };
}

/**
 * Centred empty-state placeholder used when a list has no items.
 */
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-16 text-center">
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
        action.href ? (
          <Link
            href={action.href}
            className="mt-4 inline-block rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            {action.label}
          </Link>
        ) : (
          <button
            type="button"
            onClick={action.onClick}
            className="mt-4 inline-block rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  );
}
