import type { ReactNode } from 'react';
import { PublicHeader } from '@/components/ui/PublicHeader';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <PublicHeader isAuthenticated={false} isAdmin={false} variant="minimal" />
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-card">
          {children}
        </div>
      </div>
    </div>
  );
}
