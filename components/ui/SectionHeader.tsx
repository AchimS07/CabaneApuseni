import * as React from 'react';

interface SectionHeaderProps {
  title: string;
  description?: string;
  /** Optional element (e.g. Button) rendered on the right side */
  action?: React.ReactNode;
  /** Override heading level – defaults to h1 */
  as?: 'h1' | 'h2' | 'h3';
}

/**
 * Consistent page/section heading with optional description and action slot.
 */
export function SectionHeader({
  title,
  description,
  action,
  as: Tag = 'h1',
}: SectionHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <Tag className="text-2xl font-bold text-gray-900">{title}</Tag>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>
      {action && <div className="mt-2 shrink-0 sm:mt-0">{action}</div>}
    </div>
  );
}
