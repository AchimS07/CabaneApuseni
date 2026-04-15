import type { Metadata } from 'next';
import RegisterForm from '@/components/forms/RegisterForm';

export const metadata: Metadata = { title: 'Înregistrare' };

export default function RegisterPage() {
  return (
    <>
      <h1 className="mb-6 text-center text-2xl font-bold">Cont nou</h1>
      <RegisterForm />
      <p className="mt-4 text-center text-sm text-gray-500">
        Ai deja cont?{' '}
        <a href="/login" className="font-medium text-indigo-600 hover:underline">
          Autentifică-te
        </a>
      </p>
    </>
  );
}
