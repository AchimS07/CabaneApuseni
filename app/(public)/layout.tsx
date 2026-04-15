import type { ReactNode } from 'react';
import { verifySession } from '@/lib/auth/session';
import { PublicHeader } from '@/components/ui/PublicHeader';
import { Footer } from '@/components/ui/Footer';

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const session = await verifySession();

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader
        isAuthenticated={!!session}
        isAdmin={session?.role === 'admin'}
      />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
