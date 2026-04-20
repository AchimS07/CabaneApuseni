'use client';

import { useState } from 'react';
import { ShareIcon } from '@/components/ui/Icons';

interface Props {
  title: string;
  url: string;
  shareLabel: string;
  ariaLabel: string;
}

export function ShareButton({ title, url, shareLabel, ariaLabel }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard copy.
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available.
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 underline transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500"
      aria-label={ariaLabel}
    >
      <ShareIcon size={16} aria-hidden="true" />
      {copied ? '✓ Copied!' : shareLabel}
    </button>
  );
}
