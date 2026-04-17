'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { register } from '@/modules/auth/application/authService';
import { registerSchema } from '@/lib/validation/schemas';
import type { UserRole } from '@/modules/users/domain/types';
import { useTranslations } from 'next-intl';

interface RegisterFormProps {
  redirectTo?: string;
  role?: Extract<UserRole, 'user' | 'owner'>;
  submitLabel?: string;
  plan?: 'basic' | 'pro';
}

export default function RegisterForm({
  redirectTo = '/dashboard',
  role = 'user',
  submitLabel,
  plan,
}: RegisterFormProps) {
  const router = useRouter();
  const t = useTranslations('auth');
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
      await register(parsed.data.email, parsed.data.password, parsed.data.name, role);

      if (plan) {
        const res = await fetch('/api/subscriptions/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan }),
        });
        const data = (await res.json()) as { url?: string; error?: string };
        if (!res.ok || !data.url) {
          // Account was created successfully; redirect to dashboard even if
          // payment setup is unavailable (e.g. Stripe not yet configured).
          router.push(redirectTo);
          router.refresh();
          return;
        }
        router.push(data.url);
      } else {
        router.push(redirectTo);
        router.refresh();
      }
    } catch (err) {
      setGlobalError(
        err instanceof Error ? err.message : t('registerFailed'),
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
        label={t('fullName')}
        name="name"
        type="text"
        autoComplete="name"
        required
        error={fieldErrors.name}
      />
      <Input
        label={t('email')}
        name="email"
        type="email"
        autoComplete="email"
        required
        error={fieldErrors.email}
      />
      <Input
        label={t('password')}
        name="password"
        type="password"
        autoComplete="new-password"
        required
        error={fieldErrors.password}
      />
      <Input
        label={t('confirmPassword')}
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        required
        error={fieldErrors.confirmPassword}
      />

      <Button type="submit" loading={loading} className="mt-2 w-full">
        {submitLabel ?? t('registerButton')}
      </Button>
    </form>
  );
}
