import type { Metadata } from 'next';
import Link from 'next/link';
import ForgotPasswordForm from '@/components/forms/ForgotPasswordForm';

export const metadata: Metadata = { title: 'Resetare parolă' };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="mb-2 text-center text-2xl font-bold">Resetare parolă</h1>
      <p className="mb-6 text-center text-sm text-gray-500">
        Introdu adresa ta de email și îți vom trimite un link de resetare.
      </p>
      <ForgotPasswordForm />
      <p className="mt-4 text-center text-sm text-gray-500">
        Îți amintești parola?{' '}
        <Link href="/login" className="font-medium text-pine-600 hover:underline">
          Autentifică-te
        </Link>
      </p>
    </>
  );
}
