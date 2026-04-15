'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getCabin, getOrCreateConversation, getCabinReviews,
  type Cabin, type Review,
} from '@/lib/firestore';
import { useAuth } from '@/lib/hooks/useAuth';
import { FACILITIES } from '@/lib/constants';
import PhotoGallery from '@/components/PhotoGallery';
import ReviewCard from '@/components/ReviewCard';
import ReportButton from '@/components/ReportButton';
import StarRating from '@/components/StarRating';

export default function CabinDetailPage() {
  const params  = useParams<{ id: string }>();
  const router  = useRouter();
  const { user, profile } = useAuth();
  const [cabin,          setCabin]         = useState<Cabin | null>(null);
  const [reviews,        setReviews]       = useState<Review[]>([]);
  const [loading,        setLoading]       = useState(true);
  const [error,          setError]         = useState('');
  const [contactLoading, setContactLoading] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    Promise.all([getCabin(params.id), getCabinReviews(params.id)])
      .then(([c, r]) => {
        if (!c) { setError('Cabin not found.'); return; }
        setCabin(c); setReviews(r);
      })
      .catch(() => setError('Failed to load cabin details.'))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleContact = async () => {
    if (!user || !profile || !cabin || profile.role !== 'guest') return;
    setContactLoading(true);
    try {
      const convId = await getOrCreateConversation(cabin.id, user.uid, cabin.ownerId, cabin.title);
      router.push('/messages/' + convId);
    } catch { setError('Failed to start conversation.'); }
    finally   { setContactLoading(false); }
  };

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-4 animate-pulse">
      <div className="bg-stone-100 rounded-xl aspect-video" />
      <div className="bg-stone-100 rounded h-8 w-2/3" />
      <div className="bg-stone-100 rounded h-4 w-1/3" />
    </div>
  );

  if (error || !cabin) return (
    <div className="max-w-5xl mx-auto px-4 py-16 text-center">
      <p className="text-red-600 mb-4">{error || 'Cabin not found.'}</p>
      <Link href="/" className="btn-primary">Back to listings</Link>
    </div>
  );

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/" className="text-forest-700 hover:text-forest-900 text-sm block mb-6">
        ← Back to listings
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left column ── */}
        <div className="lg:col-span-2 space-y-8">
          <PhotoGallery photos={cabin.photos} title={cabin.title} />

          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-stone-800">{cabin.title}</h1>
                <p className="text-stone-500 flex items-center gap-1 mt-1">
                  <span aria-hidden="true">📍</span>
                  {cabin.location}
                </p>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <StarRating value={Math.round(avgRating)} readonly size="sm" />
                    <span className="text-stone-500 text-sm">
                      {'(' + reviews.length + ' review' + (reviews.length !== 1 ? 's' : '') + ')'}
                    </span>
                  </div>
                )}
              </div>
              {user && <ReportButton contentType="listing" contentId={cabin.id} />}
            </div>
            <p className="text-stone-600 leading-relaxed mt-4 whitespace-pre-wrap">{cabin.description}</p>
          </div>

          {cabin.facilities.length > 0 && (
            <div>
              <h2 className="font-semibold text-stone-800 mb-3">Facilities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {cabin.facilities.map((fId) => {
                  const f = FACILITIES.find((x) => x.id === fId);
                  if (!f) return null;
                  return (
                    <div key={fId} className="flex items-center gap-2 p-2 bg-stone-50 rounded-lg text-sm text-stone-700">
                      <span aria-hidden="true">{f.icon}</span>
                      <span>{f.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <h2 className="font-semibold text-stone-800 mb-3">
              {'Reviews (' + reviews.length + ')'}
            </h2>
            {reviews.length === 0 ? (
              <p className="text-stone-400 text-sm">No reviews yet. Be the first!</p>
            ) : (
              <ul className="space-y-3">
                {reviews.map((r) => (
                  <li key={r.id}><ReviewCard review={r} /></li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* ── Right column ── */}
        <div>
          <div className="card p-6 sticky top-20">
            <p className="text-3xl font-bold text-stone-800">{'€' + cabin.basePricePerNight}</p>
            <p className="text-stone-500 text-sm mb-6">per night</p>

            {!user ? (
              <div className="text-center space-y-3">
                <p className="text-stone-500 text-sm">Sign in to contact the owner</p>
                <Link href="/auth/login" className="btn-primary w-full justify-center">Sign In</Link>
              </div>
            ) : profile?.role === 'guest' ? (
              <button
                onClick={handleContact}
                disabled={contactLoading}
                className="btn-primary w-full justify-center"
              >
                {contactLoading ? 'Starting chat…' : 'Contact Owner / Propose Price'}
              </button>
            ) : profile?.role === 'owner' ? (
              <p className="text-stone-400 text-sm text-center">Owners cannot book cabins.</p>
            ) : null}

            {error && <p className="error-msg mt-3" role="alert">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
