import * as React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  /** Constrain width and add standard padding (default true) */
  constrain?: boolean;
}

/**
 * Consistent page wrapper used across all canonical routes.
 * Provides max-width, horizontal padding, and vertical rhythm.
 */
export function PageContainer({
  children,
  className = '',
  constrain = true,
}: PageContainerProps) {
  return (
    <div
      className={[
        constrain ? 'mx-auto w-full max-w-5xl px-4 py-10' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}
