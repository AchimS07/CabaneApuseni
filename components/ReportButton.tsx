'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { createReport } from '@/lib/firestore';

interface Props {
  contentType: 'listing' | 'review' | 'message';
  contentId: string;
}

export default function ReportButton({ contentType, contentId }: Props) {
  const { user } = useAuth();
  const [open,      setOpen]      = useState(false);
  const [reason,    setReason]    = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error,     setError]     = useState('');

  if (!user) return null;

  const openDialog = () => { setOpen(true); setSubmitted(false); setReason(''); setError(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) { setError('Please provide a reason.'); return; }
    setSubmitting(true);
    setError('');
    try {
      await createReport({ reportedBy: user.uid, contentType, contentId, reason: reason.trim() });
      setSubmitted(true);
    } catch {
      setError('Failed to submit report. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={openDialog}
        className="text-stone-400 hover:text-red-500 transition-colors p-1 rounded"
        aria-label={'Report this ' + contentType}
        title={'Report this ' + contentType}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 21V5a2 2 0 012-2h13l-3 4H5v12m0 0l4-4h12" />
        </svg>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-title"
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 id="report-title" className="text-lg font-semibold text-stone-800 mb-4 capitalize">
              {'Report ' + contentType}
            </h2>

            {submitted ? (
              <div className="text-center py-4 space-y-4">
                <p className="text-green-700 font-medium">Thank you – your report has been submitted.</p>
                <button onClick={() => setOpen(false)} className="btn-primary">Close</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <label htmlFor="report-reason" className="label">Reason for reporting</label>
                <textarea
                  id="report-reason"
                  className="input-field min-h-[6rem] resize-none"
                  placeholder="Describe why this content is inappropriate…"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  maxLength={500}
                  required
                />
                {error && <p className="error-msg" role="alert">{error}</p>}
                <div className="flex gap-3 mt-4">
                  <button type="submit" disabled={submitting} className="btn-primary flex-1">
                    {submitting ? 'Submitting…' : 'Submit Report'}
                  </button>
                  <button type="button" onClick={() => setOpen(false)} className="btn-secondary flex-1">
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
