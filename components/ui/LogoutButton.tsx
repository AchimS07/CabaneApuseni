'use client';

import { logout } from '@/modules/auth/application/authService';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

export function LogoutButton() {
  const router = useRouter();
  const t = useTranslations('nav');
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await logout();
      router.push('/');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="text-red-600 hover:underline disabled:opacity-50"
    >
      {loading ? t('loggingOut') : t('logout')}
    </button>
  );
}
