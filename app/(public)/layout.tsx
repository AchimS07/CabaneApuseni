import type { ReactNode } from 'react';
import { verifySession } from '@/lib/auth/session';
import { PublicHeader } from '@/components/ui/PublicHeader';

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const session = await verifySession();

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader
        isAuthenticated={!!session}
        isAdmin={session?.role === 'admin'}
      />
      <div className="flex-1">{children}</div>
      <footer className="border-t py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Cabane Apuseni. Toate drepturile rezervate.
      </footer>
    </div>
  );
}
