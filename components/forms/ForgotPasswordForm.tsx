'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { forgotPassword } from '@/modules/auth/application/authService';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    if (!email.includes('@')) {
      setError('Introdu o adresă de email validă.');
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch {
      // Don't reveal whether the email exists; show a generic success message.
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div
        role="status"
        className="rounded-lg border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-800"
      >
        <p className="font-semibold">Email trimis!</p>
        <p className="mt-1">
          Dacă adresa <strong>{email}</strong> este înregistrată, vei primi un link de
          resetare a parolei în câteva minute. Verifică și folderul de spam.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {error && (
        <div role="alert" className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <Input
        label="Email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <Button type="submit" loading={loading} className="mt-2 w-full">
        Trimite link de resetare
      </Button>
    </form>
  );
}
