'use client';

import * as React from 'react';
import type { BookingStatus } from '@/modules/bookings/domain/types';
import { useTranslations } from 'next-intl';

const STATUS_CLASSES: Record<BookingStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-gray-100 text-gray-700',
};

interface StatusBadgeProps {
  status: BookingStatus;
}

/**
 * Pill badge that displays a booking status with consistent colors.
 */
export function StatusBadge({ status }: StatusBadgeProps) {
  const t = useTranslations('statusBadge');
  const className = STATUS_CLASSES[status] ?? 'bg-gray-100 text-gray-600';

  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${className}`}
    >
      {t(status)}
    </span>
  );
}
