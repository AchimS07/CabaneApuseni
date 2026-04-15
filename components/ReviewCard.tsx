'use client';

import { type Review, type FirebaseTimestamp } from '@/lib/firestore';
import StarRating from './StarRating';
import ReportButton from './ReportButton';
import { useAuth } from '@/lib/hooks/useAuth';

interface Props { review: Review }

function fmtDate(ts: FirebaseTimestamp | null | undefined): string {
  if (!ts) return '';
  try {
    return ts.toDate().toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch { return ''; }
}

export default function ReviewCard({ review }: Props) {
  const { user } = useAuth();

  return (
    <article className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <StarRating value={review.rating} readonly size="sm" />
            <span className="text-stone-400 text-xs">{fmtDate(review.createdAt)}</span>
          </div>
          <p className="font-medium text-stone-800 text-sm">{review.guestName}</p>
          <p className="text-stone-600 text-sm leading-relaxed mt-1">{review.comment}</p>
        </div>
        {user && user.uid !== review.guestId && (
          <div className="shrink-0">
            <ReportButton contentType="review" contentId={review.id} />
          </div>
        )}
      </div>
    </article>
  );
}
