'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { UserRole } from '@/modules/users/domain/types';
import { useTranslations } from 'next-intl';

type ProfileUpdateResult =
  | { ok: true }
  | { ok: false; error: string; details?: Record<string, string[]> };

interface ProfileFormProps {
  initialName: string;
  initialPhone: string;
  email: string;
  role: UserRole;
  onUpdateProfile: (input: { name: string; phone?: string }) => Promise<ProfileUpdateResult>;
}

export default function ProfileForm({ initialName, initialPhone, email, role, onUpdateProfile }: ProfileFormProps) {
  const t = useTranslations('profile');
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const roleLabel: Record<UserRole, string> = {
    user: t('roleUser'),
    owner: t('roleOwner'),
    admin: t('roleAdmin'),
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setSuccess(false);

    setLoading(true);
    try {
      const result = await onUpdateProfile({ name, phone: phone || undefined });
      if (!result.ok) {
        setError(result.error);
        if (result.details) {
          const flat: Record<string, string> = {};
          for (const [k, v] of Object.entries(result.details)) {
            if (v?.[0]) flat[k] = v[0];
          }
          setFieldErrors(flat);
        }
        return;
      }
      setSuccess(true);
    } catch {
      setError(t('genericError'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5 max-w-md">
      {error && (
        <div role="alert" className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div role="status" className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {t('successMessage')}
        </div>
      )}

      {/* Read-only email */}
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-700">{t('emailLabel')}</span>
        <p className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
          {email}
        </p>
        <p className="text-xs text-gray-400">{t('emailHint')}</p>
      </div>

      {/* Read-only role */}
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-700">{t('roleLabel')}</span>
        <p className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
          {roleLabel[role]}
        </p>
      </div>

      <Input
        label={t('fullNameLabel')}
        type="text"
        autoComplete="name"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={fieldErrors.name}
      />

      <Input
        label={t('phoneLabel')}
        type="tel"
        autoComplete="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        hint={t('phoneHint')}
        error={fieldErrors.phone}
      />

      <Button type="submit" loading={loading}>
        {t('saveButton')}
      </Button>
    </form>
  );
}
