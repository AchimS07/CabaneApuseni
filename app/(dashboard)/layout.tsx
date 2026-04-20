import type { ReactNode } from 'react';
import { requireAuth } from '@/lib/auth/authorization';
import { getProfile } from '@/modules/users/application/userService';
import { PublicHeader } from '@/components/ui/PublicHeader';
import { DashboardNav } from '@/components/ui/DashboardNav';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await requireAuth();
  const profileResult = await getProfile(session.uid);
  const role = profileResult.ok ? profileResult.data.role : session.role;

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader
        isAuthenticated
        isAdmin={role === 'admin'}
        isOwner={role === 'owner'}
        variant="minimal"
      />
      <div className="border-b bg-white px-4">
        <nav className="mx-auto max-w-5xl" aria-label="Dashboard navigation">
          <DashboardNav role={role} />
        </nav>
      </div>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">{children}</main>
      <footer className="border-t py-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Cabane Apuseni
      </footer>
    </div>
  );
}
