import type { ReactNode } from 'react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <Link href="/" className="mb-8 text-xl font-bold text-indigo-700">
        Cabane Apuseni
      </Link>
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-md">
        {children}
      </div>
    </div>
  );
}
