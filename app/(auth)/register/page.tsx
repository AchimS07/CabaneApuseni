import type { Metadata } from 'next';
import Link from 'next/link';
import RegisterForm from '@/components/forms/RegisterForm';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth');
  return { title: t('registerTitle') };
}

interface Props {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function RegisterPage({ searchParams }: Props) {
  const { redirect } = await searchParams;
  const t = await getTranslations('auth');
  const redirectTo =
    redirect && redirect.startsWith('/') ? redirect : '/dashboard';

  return (
    <>
      <h1 className="mb-6 text-center text-2xl font-bold">{t('registerTitle')}</h1>
      <RegisterForm redirectTo={redirectTo} />
      <p className="mt-4 text-center text-sm text-gray-600">
        {t('haveACabin')}{' '}
        <Link href="/register/owner" className="font-medium text-forest-600 hover:underline">
          {t('registerAsOwner')}
        </Link>
      </p>
      <p className="mt-4 text-center text-sm text-gray-500">
        {t('haveAccount')}{' '}
        <Link href="/login" className="font-medium text-forest-600 hover:underline">
          {t('signInLink')}
        </Link>
      </p>
    </>
  );
}
