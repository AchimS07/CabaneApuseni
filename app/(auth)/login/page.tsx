import type { Metadata } from 'next';
import Link from 'next/link';
import LoginForm from '@/components/forms/LoginForm';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth');
  return { title: t('loginTitle') };
}

interface Props {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const { redirect } = await searchParams;
  const t = await getTranslations('auth');
  // Sanitize – only allow relative internal paths
  const redirectTo =
    redirect && redirect.startsWith('/') ? redirect : '/dashboard';

  return (
    <>
      <h1 className="mb-6 text-center text-2xl font-bold">{t('loginTitle')}</h1>
      <LoginForm redirectTo={redirectTo} />
      <p className="mt-4 text-center text-sm text-gray-500">
        <Link href="/forgot-password" className="font-medium text-pine-600 hover:underline">
          Ai uitat parola?
        </Link>
      </p>
      <p className="mt-2 text-center text-sm text-gray-500">
        {t('noAccount')}{' '}
        <Link href="/register" className="font-medium text-pine-600 hover:underline">
          {t('signUpLink')}
        </Link>
      </p>
    </>
  );
}
