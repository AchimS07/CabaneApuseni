'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { register } from '@/modules/auth/application/authService';
import { registerSchema } from '@/lib/validation/schemas';

export default function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | undefined>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGlobalError('');
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const raw = {
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
    };

    const parsed = registerSchema.safeParse(raw);
    if (!parsed.success) {
      const errs = parsed.error.flatten().fieldErrors as Record<string, string[]>;
      setFieldErrors(
        Object.fromEntries(Object.entries(errs).map(([k, v]) => [k, v?.[0]])),
      );
      return;
    }

    setLoading(true);
    try {
      await register(parsed.data.email, parsed.data.password, parsed.data.name);
      router.push('/dashboard');
    } catch (err) {
      setGlobalError(
        err instanceof Error ? err.message : 'Înregistrare eșuată. Încercați din nou.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {globalError && (
        <div role="alert" className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">
          {globalError}
        </div>
      )}

      <Input
        label="Nume complet"
        name="name"
        type="text"
        autoComplete="name"
        required
        error={fieldErrors.name}
      />
      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        error={fieldErrors.email}
      />
      <Input
        label="Parolă"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        error={fieldErrors.password}
      />
      <Input
        label="Confirmă parola"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        required
        error={fieldErrors.confirmPassword}
      />

      <Button type="submit" loading={loading} className="w-full mt-2">
        Creează cont
      </Button>
    </form>
  );
}
