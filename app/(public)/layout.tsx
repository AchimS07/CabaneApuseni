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
      <footer className="border-t bg-gray-50 py-10 text-center text-sm text-gray-500">
        <p className="font-semibold text-forest-700">Cabane Apuseni</p>
        <p className="mt-1">© {new Date().getFullYear()} Cabane Apuseni. Toate drepturile rezervate.</p>
      </footer>
    </div>
  );
}
