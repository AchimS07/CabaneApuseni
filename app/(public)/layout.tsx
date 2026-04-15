import Link from 'next/link';
import type { ReactNode } from 'react';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-lg font-bold text-indigo-700">
            Cabane Apuseni
          </Link>
          <ul className="flex items-center gap-4 text-sm font-medium">
            <li>
              <Link href="/cabins" className="text-gray-700 hover:text-indigo-700">
                Cabane
              </Link>
            </li>
            <li>
              <Link
                href="/login"
                className="rounded-md bg-indigo-600 px-3 py-1.5 text-white hover:bg-indigo-700"
              >
                Contul meu
              </Link>
            </li>
          </ul>
        </nav>
      </header>
      {children}
      <footer className="mt-16 border-t py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Cabane Apuseni. Toate drepturile rezervate.
      </footer>
    </>
  );
}
