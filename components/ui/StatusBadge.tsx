import * as React from 'react';
import type { BookingStatus } from '@/modules/bookings/domain/types';

const STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; className: string }
> = {
  pending: {
    label: 'În așteptare',
    className: 'bg-yellow-100 text-yellow-800',
  },
  confirmed: {
    label: 'Confirmată',
    className: 'bg-green-100 text-green-800',
  },
  cancelled: {
    label: 'Anulată',
    className: 'bg-red-100 text-red-800',
  },
  completed: {
    label: 'Finalizată',
    className: 'bg-gray-100 text-gray-700',
  },
};

interface StatusBadgeProps {
  status: BookingStatus;
}

/**
 * Pill badge that displays a booking status with consistent colors.
 */
export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: 'bg-gray-100 text-gray-600',
  };

  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
