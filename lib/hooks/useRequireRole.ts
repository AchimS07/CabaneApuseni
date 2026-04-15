'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';
import type { UserRole } from '../auth';

export function useRequireRole(requiredRoles: UserRole | UserRole[]) {
  const { profile, loading } = useAuth();
  const router = useRouter();

  // Convert to a stable string to avoid infinite-loop from array identity changes
  const rolesKey = Array.isArray(requiredRoles)
    ? requiredRoles.join(',')
    : requiredRoles;

  useEffect(() => {
    if (loading) return;
    const roles = rolesKey.split(',') as UserRole[];
    if (!profile) {
      router.push('/auth/login');
      return;
    }
    if (!roles.includes(profile.role)) {
      router.push('/');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, loading, rolesKey]);

  return { profile, loading };
}
