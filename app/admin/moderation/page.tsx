'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRequireRole } from '@/lib/hooks/useRequireRole';
import {
  getPendingReports, hideAndActionReport, actionReport,
  type Report, type FirebaseTimestamp,
} from '@/lib/firestore';

interface ReportWithPreview extends Report {
  contentPreview: string;
}

async function fetchPreview(report: Report): Promise<string> {
  try {
    if (report.contentType === 'listing') {
      const snap = await getDoc(doc(db, 'cabins', report.contentId));
      return snap.exists() ? (snap.data().title as string) : 'Cabin not found';
    }
    if (report.contentType === 'review') {
      const snap = await getDoc(doc(db, 'reviews', report.contentId));
      if (!snap.exists()) return 'Review not found';
      const text = snap.data().comment as string;
      return text.length > 100 ? text.substring(0, 100) + '…' : text;
    }
    return 'Message (ID: ' + report.contentId + ')';
  } catch { return 'Unable to load preview'; }
}

function fmtDate(ts: FirebaseTimestamp | undefined): string {
  if (!ts) return '';
  try {
    return ts.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return ''; }
}

export default function ModerationPage() {
  const { loading: authLoading } = useRequireRole('admin');
  const [reports, setReports] = useState<ReportWithPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [acting,  setActing]  = useState<string | null>(null);

  useEffect(() => {
    getPendingReports()
      .then(async (list) => {
        const withPreviews = await Promise.all(
          list.map(async (r) => ({ ...r, contentPreview: await fetchPreview(r) })),
        );
        setReports(withPreviews);
      })
      .catch(() => setError('Failed to load reports.'))
      .finally(() => setLoading(false));
  }, []);

  const handleHide = async (report: ReportWithPreview) => {
    if (report.contentType === 'message') { handleDismiss(report.id); return; }
    setActing(report.id); setError('');
    try {
      await hideAndActionReport(report.id, report.contentType, report.contentId);
      setReports((prev) => prev.filter((r) => r.id !== report.id));
    } catch { setError('Action failed.'); }
    finally   { setActing(null); }
  };

  const handleDismiss = async (reportId: string) => {
    setActing(reportId); setError('');
    try {
      await actionReport(reportId);
      setReports((prev) => prev.filter((r) => r.id !== reportId));
    } catch { setError('Action failed.'); }
    finally   { setActing(null); }
  };

  if (authLoading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-700" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Moderation</h1>
      {error && <p className="error-msg mb-4" role="alert">{error}</p>}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="bg-stone-100 rounded-xl h-24 animate-pulse" />)}
        </div>
      ) : reports.length === 0 ? (
        <div className="card p-12 text-center">
          <span className="text-5xl" aria-hidden="true">✅</span>
          <p className="text-stone-500 mt-4">No pending reports. All clear!</p>
        </div>
      ) : (
        <>
          <p className="text-stone-500 text-sm mb-4">
            {reports.length + ' pending report' + (reports.length !== 1 ? 's' : '')}
          </p>
          <ul className="space-y-3">
            {reports.map((report) => (
              <li key={report.id} className="card p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 capitalize">
                        {report.contentType}
                      </span>
                      <span className="text-stone-400 text-xs">{fmtDate(report.createdAt)}</span>
                    </div>
                    <p className="font-medium text-stone-800 text-sm truncate">{report.contentPreview}</p>
                    <p className="text-stone-500 text-sm mt-0.5">Reason: {report.reason}</p>
                  </div>
                  <div className="flex gap-2 shrink-0 flex-wrap">
                    {report.contentType !== 'message' && (
                      <button
                        onClick={() => handleHide(report)}
                        disabled={acting === report.id}
                        className="btn-danger text-xs py-1.5 px-3"
                      >
                        {acting === report.id ? '…' : 'Hide Content'}
                      </button>
                    )}
                    <button
                      onClick={() => handleDismiss(report.id)}
                      disabled={acting === report.id}
                      className="btn-secondary text-xs py-1.5 px-3"
                    >
                      {acting === report.id ? '…' : 'Dismiss'}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
