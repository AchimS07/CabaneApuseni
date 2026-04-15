'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRequireRole } from '@/lib/hooks/useRequireRole';
import { getUserConversations, type Conversation } from '@/lib/firestore';

export default function MessagesPage() {
  const { profile, loading: authLoading } = useRequireRole(['owner', 'guest', 'admin']);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (!profile) return;
    if (profile.role === 'admin') { setLoading(false); return; }
    getUserConversations(profile.uid, profile.role as 'guest' | 'owner')
      .then(setConversations)
      .catch(() => setError('Failed to load conversations.'))
      .finally(() => setLoading(false));
  }, [profile]);

  if (authLoading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-700" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Messages</h1>
      {error && <p className="error-msg mb-4" role="alert">{error}</p>}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="bg-stone-100 rounded-xl h-20 animate-pulse" />)}
        </div>
      ) : conversations.length === 0 ? (
        <div className="card p-10 text-center">
          <span className="text-5xl" aria-hidden="true">💬</span>
          <p className="text-stone-500 mt-4">No conversations yet.</p>
          {profile?.role === 'guest' && (
            <Link href="/" className="btn-primary mt-6 inline-flex">Browse Cabins</Link>
          )}
        </div>
      ) : (
        <ul className="space-y-3" aria-label="Conversations">
          {conversations.map((conv) => (
            <li key={conv.id}>
              <Link
                href={'/messages/' + conv.id}
                className="card p-4 flex items-center justify-between gap-4 hover:shadow-md transition-shadow block"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-stone-800 truncate">{conv.cabinTitle}</p>
                  <p className="text-stone-500 text-sm">
                    {profile?.role === 'guest' ? 'With cabin owner' : 'With guest'}
                  </p>
                </div>
                <span className={
                  conv.status === 'accepted' ? 'badge-accepted' :
                  conv.status === 'declined' ? 'badge-declined' : 'badge-open'
                }>
                  {conv.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
