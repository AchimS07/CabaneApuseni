import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import RegisterForm from '@/components/forms/RegisterForm';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth');
  return { title: t('ownerRegisterTitle') };
}

interface Props {
  searchParams: Promise<{ redirect?: string; plan?: string }>;
}

export default async function OwnerRegisterPage({ searchParams }: Props) {
  const { redirect: redirectParam, plan } = await searchParams;
  const t = await getTranslations('auth');

  const validatedPlan =
    plan === 'basic' || plan === 'pro' ? (plan as 'basic' | 'pro') : null;

  if (!validatedPlan) {
    redirect('/pricing');
  }

  const redirectTo =
    redirectParam && redirectParam.startsWith('/') ? redirectParam : '/dashboard/owner';

  return (
    <>
      <h1 className="mb-2 text-center text-2xl font-bold">{t('ownerRegisterTitle')}</h1>
      <p className="mb-6 text-center text-sm text-gray-500">
        {t('selectedPlan')}{': '}
        <span className="font-semibold text-pine-600">
          {validatedPlan === 'basic' ? t('planBasic') : t('planPro')}
        </span>
      </p>
      <RegisterForm
        redirectTo={redirectTo}
        role="owner"
        plan={validatedPlan}
        submitLabel={t('createOwnerAccountAndPay')}
      />
      <p className="mt-4 text-center text-sm text-gray-500">
        {t('wantClientAccount')}{' '}
        <Link href="/register" className="font-medium text-pine-600 hover:underline">
          {t('standardRegister')}
        </Link>
      </p>
      <p className="mt-4 text-center text-sm text-gray-500">
        {t('haveAccount')}{' '}
        <Link href="/login" className="font-medium text-pine-600 hover:underline">
          {t('signInLink')}
        </Link>
      </p>
    </>
  );
}
