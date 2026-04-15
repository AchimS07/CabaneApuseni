import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-5xl font-bold text-indigo-600">404</h1>
      <h2 className="text-2xl font-semibold">Pagina nu a fost găsită</h2>
      <p className="text-gray-600">
        Pagina pe care o căutați nu există sau a fost mutată.
      </p>
      <Link
        href="/"
        className="rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
      >
        Înapoi la pagina principală
      </Link>
    </main>
  );
}
