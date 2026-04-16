import type { ReactNode } from 'react';
import { verifySession } from '@/lib/auth/session';
import { getUserById } from '@/modules/users/infrastructure/firestoreUserRepository';
import { PublicHeader } from '@/components/ui/PublicHeader';
import { getTranslations } from 'next-intl/server';

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const session = await verifySession();
  const t = await getTranslations('common');

  let isOwner = false;
  if (session) {
    if (session.role === 'owner') {
      isOwner = true;
    } else if (session.role === 'user') {
      // Fallback: check Firestore profile in case custom claims aren't set yet.
      const profile = await getUserById(session.uid);
      isOwner = profile?.role === 'owner';
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader
        isAuthenticated={!!session}
        isAdmin={session?.role === 'admin'}
        isOwner={isOwner}
      />
      <div className="flex-1">{children}</div>
      <footer className="border-t bg-gray-50 py-10 text-center text-sm text-gray-500">
        <p className="font-semibold text-forest-700">{t('siteName')}</p>
        <p className="mt-1">© {new Date().getFullYear()} Cabane Apuseni. {t('allRightsReserved')}</p>
      </footer>
    </div>
  );
}
