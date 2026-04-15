import type { Metadata } from 'next';
import RegisterForm from '@/components/forms/RegisterForm';

export const metadata: Metadata = { title: 'Înregistrare' };

interface Props {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function RegisterPage({ searchParams }: Props) {
  const { redirect } = await searchParams;
  const redirectTo =
    redirect && redirect.startsWith('/') ? redirect : '/dashboard';

  return (
    <>
      <h1 className="mb-6 text-center text-2xl font-bold">Cont nou</h1>
      <RegisterForm redirectTo={redirectTo} />
      <p className="mt-4 text-center text-sm text-gray-600">
        Ai o cabană?{' '}
        <a href="/register/owner" className="font-medium text-forest-600 hover:underline">
          Înregistrează-te ca proprietar
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
