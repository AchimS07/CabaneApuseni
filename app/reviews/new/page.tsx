import { redirect } from 'next/navigation';

export default function NewReviewPage() {
  redirect('/dashboard');
}

function NewReviewContent() {
  const router      = useRouter();
  const searchParams = useSearchParams();
  const bookingId   = searchParams.get('bookingId') ?? '';
  const { profile, loading: authLoading } = useRequireRole('guest');
  const [cabin,           setCabin]           = useState<Cabin | null>(null);
  const [rating,          setRating]          = useState(0);
  const [comment,         setComment]         = useState('');
  const [errors,          setErrors]          = useState<Record<string, string>>({});
  const [dataLoading,     setDataLoading]     = useState(true);
  const [submitting,      setSubmitting]      = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  useEffect(() => {
    if (!bookingId || !profile) return;
    (async () => {
      try {
        const existing = await getBookingReview(bookingId);
        if (existing) { setAlreadyReviewed(true); setDataLoading(false); return; }
        const bookingSnap = await getDoc(doc(db, 'bookings', bookingId));
        if (!bookingSnap.exists()) { setErrors({ form: 'Booking not found.' }); setDataLoading(false); return; }
        const booking = bookingSnap.data();
        if (booking.guestId !== profile.uid) { setErrors({ form: 'Unauthorized.' }); setDataLoading(false); return; }
        const c = await getCabin(booking.cabinId as string);
        setCabin(c);
      } catch { setErrors({ form: 'Failed to load booking details.' }); }
      finally   { setDataLoading(false); }
    })();
  }, [bookingId, profile]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile || !cabin) return;
    const errs: Record<string, string> = {};
    if (rating < 1 || rating > 5) errs.rating  = 'Please select a rating (1–5 stars).';
    if (!comment.trim())          errs.comment = 'Please write a review.';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({}); setSubmitting(true);
    try {
      await createReview({
        bookingId, cabinId: cabin.id, guestId: profile.uid,
        guestName: profile.displayName, rating, comment: comment.trim(),
      });
      router.push('/messages');
    } catch { setErrors({ form: 'Failed to submit review. Please try again.' }); }
    finally   { setSubmitting(false); }
  };

  if (authLoading || dataLoading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-700" />
    </div>
  );

  if (alreadyReviewed) return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <span className="text-5xl" aria-hidden="true">✅</span>
      <h1 className="text-xl font-bold text-stone-800 mt-4">Review Already Submitted</h1>
      <p className="text-stone-500 mt-2">You have already reviewed this booking.</p>
      <Link href="/messages" className="btn-primary mt-6 inline-flex">Back to Messages</Link>
    </div>
  );

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <Link href="/messages" className="text-forest-700 hover:text-forest-900 text-sm block mb-6">
        ← Back to messages
      </Link>
      <div className="card p-6">
        <h1 className="text-xl font-bold text-stone-800 mb-1">Leave a Review</h1>
        {cabin && <p className="text-stone-500 text-sm mb-6">{cabin.title}</p>}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div>
            <p className="label mb-2" id="rating-label">Your rating *</p>
            <StarRating value={rating} onChange={setRating} size="lg" />
            {errors.rating && <p className="error-msg mt-1" role="alert">{errors.rating}</p>}
          </div>

          <div>
            <label htmlFor="comment" className="label">Your review *</label>
            <textarea
              id="comment" rows={5} required className="input-field resize-none"
              placeholder="Share your experience staying at this cabin…"
              value={comment} onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
            />
            <p className="text-xs text-stone-400 mt-1 text-right">
              {comment.length + '/1000'}
            </p>
            {errors.comment && <p className="error-msg" role="alert">{errors.comment}</p>}
          </div>

          {errors.form && <p className="error-msg" role="alert">{errors.form}</p>}

          <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
            {submitting ? 'Submitting…' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function NewReviewPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-700" />
      </div>
    }>
      <NewReviewContent />
    </Suspense>
  );
}
