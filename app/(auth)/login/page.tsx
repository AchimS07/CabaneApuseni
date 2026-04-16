import type { Metadata } from 'next';
import Link from 'next/link';
import LoginForm from '@/components/forms/LoginForm';

export const metadata: Metadata = { title: 'Autentificare' };

interface Props {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const { redirect } = await searchParams;
  // Sanitize – only allow relative internal paths
  const redirectTo =
    redirect && redirect.startsWith('/') ? redirect : '/dashboard';

  return (
    <>
      <h1 className="mb-6 text-center text-2xl font-bold">Autentificare</h1>
      <LoginForm redirectTo={redirectTo} />
      <p className="mt-4 text-center text-sm text-gray-500">
        Nu ai cont?{' '}
        <Link href="/register" className="font-medium text-forest-600 hover:underline">
          Înregistrează-te
        </Link>
      </p>
    </>
  );
}
