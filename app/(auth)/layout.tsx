import type { ReactNode } from 'react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 text-xl font-extrabold text-pine-700 hover:text-pine-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-pine-500 rounded-md"
      >
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full bg-pine-600 text-white text-sm"
          aria-hidden="true"
        >
          🏔️
        </span>
        Cabane Apuseni
      </Link>
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-card">
        {children}
      </div>
    </div>
  );
}
