import type { Metadata } from 'next';
import Link from 'next/link';
import RegisterForm from '@/components/forms/RegisterForm';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth');
  return { title: t('ownerRegisterTitle') };
}

interface Props {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function OwnerRegisterPage({ searchParams }: Props) {
  const { redirect } = await searchParams;
  const t = await getTranslations('auth');
  const redirectTo =
    redirect && redirect.startsWith('/') ? redirect : '/dashboard/owner';

  return (
    <>
      <h1 className="mb-6 text-center text-2xl font-bold">{t('ownerRegisterTitle')}</h1>
      <RegisterForm
        redirectTo={redirectTo}
        role="owner"
        submitLabel={t('createOwnerAccount')}
      />
      <p className="mt-4 text-center text-sm text-gray-500">
        {t('wantClientAccount')}{' '}
        <Link href="/register" className="font-medium text-indigo-600 hover:underline">
          {t('standardRegister')}
        </Link>
      </p>
      <p className="mt-4 text-center text-sm text-gray-500">
        {t('haveAccount')}{' '}
        <Link href="/login" className="font-medium text-indigo-600 hover:underline">
          {t('signInLink')}
        </Link>
      </p>
    </>
  );
}
