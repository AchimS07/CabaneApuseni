'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useRequireRole } from '@/lib/hooks/useRequireRole';
import ConversationThread from '@/components/ConversationThread';

export default function ConversationPage() {
  const params = useParams<{ conversationId: string }>();
  useRequireRole(['owner', 'guest', 'admin']);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/messages" className="text-forest-700 hover:text-forest-900 text-sm block mb-4">
        ← Back to Messages
      </Link>
      <ConversationThread conversationId={params.conversationId} />
    </div>
  );
}
