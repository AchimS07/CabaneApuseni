import type { Metadata } from 'next';
import { requireAuth } from '@/lib/auth/authorization';
import { getProfile } from '@/modules/users/application/userService';
import { SectionHeader } from '@/components/ui/SectionHeader';
import ProfileForm from '@/components/forms/ProfileForm';

export const metadata: Metadata = { title: 'Profilul meu' };
export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const session = await requireAuth();
  const profileResult = await getProfile(session.uid);
  const profile = profileResult.ok ? profileResult.data : null;

  return (
    <div>
      <SectionHeader
        title="Profilul meu"
        description="Actualizează informațiile contului tău."
      />

      <div className="mt-6 rounded-xl border bg-white p-6 shadow-sm">
        <ProfileForm
          initialName={profile?.name ?? ''}
          initialPhone={profile?.phone ?? ''}
          email={profile?.email ?? session.email ?? ''}
          role={profile?.role ?? session.role}
        />
      </div>
    </div>
  );
}
