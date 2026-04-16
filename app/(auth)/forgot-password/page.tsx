import type { Metadata } from 'next';
import Link from 'next/link';
import ForgotPasswordForm from '@/components/forms/ForgotPasswordForm';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('forgotPassword');
  return { title: t('metaTitle') };
}

export default async function ForgotPasswordPage() {
  const t = await getTranslations('forgotPassword');
  return (
    <>
      <h1 className="mb-2 text-center text-2xl font-bold">{t('heading')}</h1>
      <p className="mb-6 text-center text-sm text-gray-500">
        {t('description')}
      </p>
      <ForgotPasswordForm />
      <p className="mt-4 text-center text-sm text-gray-500">
        {t('rememberPassword')}{' '}
        <Link href="/login" className="font-medium text-indigo-600 hover:underline">
          {t('signIn')}
        </Link>
      </p>
    </>
  );
}
