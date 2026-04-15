import type { Metadata } from 'next';
import RegisterForm from '@/components/forms/RegisterForm';

export const metadata: Metadata = { title: 'Înregistrare proprietar' };

interface Props {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function OwnerRegisterPage({ searchParams }: Props) {
  const { redirect } = await searchParams;
  const redirectTo =
    redirect && redirect.startsWith('/') ? redirect : '/dashboard/owner';

  return (
    <>
      <h1 className="mb-6 text-center text-2xl font-bold">Cont proprietar</h1>
      <RegisterForm
        redirectTo={redirectTo}
        role="owner"
        submitLabel="Creează cont de proprietar"
      />
      <p className="mt-4 text-center text-sm text-gray-500">
        Vrei cont de client?{' '}
        <a href="/register" className="font-medium text-forest-600 hover:underline">
          Înregistrare standard
        </a>
      </p>
      <p className="mt-4 text-center text-sm text-gray-500">
        Ai deja cont?{' '}
        <a href="/login" className="font-medium text-forest-600 hover:underline">
          Autentifică-te
        </a>
      </p>
    </>
  );
}
