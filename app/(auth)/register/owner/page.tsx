import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import RegisterForm from '@/components/forms/RegisterForm';

export const metadata: Metadata = { title: 'Înregistrare proprietar' };

interface Props {
  searchParams: Promise<{ redirect?: string; plan?: string }>;
}

export default async function OwnerRegisterPage({ searchParams }: Props) {
  const { redirect: redirectParam, plan } = await searchParams;

  const validatedPlan =
    plan === 'basic' || plan === 'pro' ? (plan as 'basic' | 'pro') : null;

  if (!validatedPlan) {
    redirect('/pricing');
  }

  const redirectTo =
    redirectParam && redirectParam.startsWith('/') ? redirectParam : '/dashboard/owner';

  return (
    <>
      <h1 className="mb-2 text-center text-2xl font-bold">Cont proprietar</h1>
      <p className="mb-6 text-center text-sm text-gray-500">
        {'Plan selectat: '}
        <span className="font-semibold text-indigo-600">
          {validatedPlan === 'basic' ? 'Basic — 50 RON/lună' : 'Pro — 150 RON/lună'}
        </span>
      </p>
      <RegisterForm
        redirectTo={redirectTo}
        role="owner"
        plan={validatedPlan}
        submitLabel="Creează cont și continuă la plată"
      />
      <p className="mt-4 text-center text-sm text-gray-500">
        Vrei cont de client?{' '}
        <Link href="/register" className="font-medium text-forest-600 hover:underline">
          Înregistrare standard
        </Link>
      </p>
      <p className="mt-4 text-center text-sm text-gray-500">
        Ai deja cont?{' '}
        <Link href="/login" className="font-medium text-forest-600 hover:underline">
          Autentifică-te
        </Link>
      </p>
    </>
  );
}
