import type { ReactNode } from 'react';
import { verifySession } from '@/lib/auth/session';
import { getUserById } from '@/modules/users/infrastructure/firestoreUserRepository';
import { PublicHeader } from '@/components/ui/PublicHeader';

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const session = await verifySession();

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
      <footer className="border-t py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Cabane Apuseni. Toate drepturile rezervate.
      </footer>
    </div>
  );
}
