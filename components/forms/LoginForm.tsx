'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { login } from '@/modules/auth/application/authService';
import { loginSchema } from '@/lib/validation/schemas';

interface LoginFormProps {
  redirectTo?: string;
}

export default function LoginForm({ redirectTo = '/dashboard' }: LoginFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGlobalError('');
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const raw = { email: formData.get('email'), password: formData.get('password') };

    const parsed = loginSchema.safeParse(raw);
    if (!parsed.success) {
      const errs = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        email: errs.email?.[0],
        password: errs.password?.[0],
      });
      return;
    }

    setLoading(true);
    try {
      await login(parsed.data.email, parsed.data.password);
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setGlobalError(
        err instanceof Error ? err.message : 'Autentificare eșuată. Verificați credențialele.',
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
        autoComplete="current-password"
        required
        error={fieldErrors.password}
      />

      <Button type="submit" loading={loading} className="mt-2 w-full">
        Autentificare
      </Button>
    </form>
  );
}
