'use client';

/**
 * components/ui/PaymentVerifier.tsx
 * Rendered when the user returns from Netopia with ?subscription=success.
 * Immediately calls the server action to activate the subscription via the
 * Firestore pending-payment record, then refreshes the page.
 */
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { verifyPendingPaymentAction } from '@/modules/users/actions';

type State = 'verifying' | 'activated' | 'already_active' | 'error';

export function PaymentVerifier() {
  const router = useRouter();
  const called = useRef(false);
  const [state, setState] = useState<State>('verifying');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    verifyPendingPaymentAction().then((result) => {
      if (!result.ok) {
        setState('error');
        setErrorMsg(result.error);
        return;
      }

      if (result.activated) {
        setState('activated');
        // Remove the query param and hard-refresh so the page re-fetches from Firestore
        router.replace('/dashboard/owner');
      } else {
        // IPN already handled it before the redirect landed
        setState('already_active');
        router.replace('/dashboard/owner');
      }
    });
  }, [router]);

  if (state === 'verifying') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex items-center gap-2 rounded-xl border border-pine-200 bg-pine-50 px-4 py-3 text-sm text-pine-800"
      >
        <svg
          className="h-4 w-4 animate-spin text-pine-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        Se activează abonamentul…
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div
        role="alert"
        className="flex flex-col gap-2 rounded-xl border border-earth-200 bg-earth-50 px-4 py-3 text-sm"
      >
        <p className="font-semibold text-earth-800">
          Plata a fost procesată, dar activarea a întârziat.
        </p>
        <p className="text-earth-700">{errorMsg}</p>
        <button
          type="button"
          onClick={() => { called.current = false; setState('verifying'); setErrorMsg(''); }}
          className="mt-1 self-start rounded-md bg-ember-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-ember-600 focus:outline-none focus:ring-2 focus:ring-ember-500 focus:ring-offset-1"
        >
          Încearcă din nou
        </button>
      </div>
    );
  }

  return null;
}
