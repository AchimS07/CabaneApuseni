import type { Metadata } from 'next';
import { requireAuth } from '@/lib/auth/authorization';
import { getProfile } from '@/modules/users/application/userService';
import { updateProfileAction } from '@/modules/users/actions';
import { SectionHeader } from '@/components/ui/SectionHeader';
import ProfileForm from '@/components/forms/ProfileForm';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('profile');
  return { title: t('metaTitle') };
}

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const session = await requireAuth();
  const profileResult = await getProfile(session.uid);
  const profile = profileResult.ok ? profileResult.data : null;
  const t = await getTranslations('profile');

  return (
    <div>
      <SectionHeader
        title={t('title')}
        description={t('description')}
      />

      <div className="mt-6 rounded-xl border bg-white p-6 shadow-sm">
        <ProfileForm
          initialName={profile?.name ?? ''}
          initialPhone={profile?.phone ?? ''}
          email={profile?.email ?? session.email ?? ''}
          role={profile?.role ?? session.role}
          onUpdateProfile={updateProfileAction}
        />
      </div>
    </div>
  );
}
