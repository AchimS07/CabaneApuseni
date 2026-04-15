import type { Metadata } from 'next';
import LoginForm from '@/components/forms/LoginForm';

export const metadata: Metadata = { title: 'Autentificare' };

export default function LoginPage() {
  return (
    <>
      <h1 className="mb-6 text-center text-2xl font-bold">Autentificare</h1>
      <LoginForm />
      <p className="mt-4 text-center text-sm text-gray-500">
        Nu ai cont?{' '}
        <a href="/register" className="font-medium text-indigo-600 hover:underline">
          Înregistrează-te
        </a>
      </p>
    </>
  );
}
