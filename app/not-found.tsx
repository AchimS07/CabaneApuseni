import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export default async function NotFound() {
  const t = await getTranslations('errors');

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-5xl font-bold text-pine-600">404</h1>
      <h2 className="text-2xl font-semibold">{t('notFoundTitle')}</h2>
      <p className="text-gray-600">{t('notFoundDescription')}</p>
      <Link
        href="/"
        className="rounded-md bg-pine-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-pine-700"
      >
        {t('backHome')}
      </Link>
    </main>
  );
}
