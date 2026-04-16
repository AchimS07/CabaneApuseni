'use client';

/**
 * components/ui/WishlistButton.tsx
 * Heart icon button that toggles a cabin in the user's wishlist.
 * – Logged-out: redirects to /login
 * – Logged-in: optimistic toggle via useWishlist
 */

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useWishlist } from '@/lib/hooks/useWishlist';
import { HeartIcon, HeartFilledIcon } from './Icons';

interface WishlistButtonProps {
  cabinId: string;
  cabinSlug: string;
  /** Additional Tailwind classes */
  className?: string;
  /** Size of the icon in pixels */
  iconSize?: number;
}

export function WishlistButton({
  cabinId,
  cabinSlug,
  className = '',
  iconSize = 22,
}: WishlistButtonProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { isWishlisted, toggle, loading: toggleLoading } = useWishlist();

  const wishlisted = isWishlisted(cabinId);

  const handleClick = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();  // prevent card navigation
      e.stopPropagation(); // prevent bubbling to Link

      // Auth state is not yet resolved — do nothing to avoid false redirects
      if (authLoading) return;

      if (!user) {
        router.push(`/login?redirect=/cabins/${cabinSlug}`);
        return;
      }

      await toggle(cabinId);
    },
    [authLoading, user, router, cabinSlug, cabinId, toggle],
  );

  const loading = authLoading || toggleLoading;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      aria-label={wishlisted ? 'Elimină din favorite' : 'Adaugă la favorite'}
      aria-pressed={wishlisted}
      className={[
        'flex items-center justify-center rounded-full transition',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-60',
        className,
      ].join(' ')}
    >
      {wishlisted ? (
        <HeartFilledIcon
          size={iconSize}
          className="text-brand drop-shadow-sm"
          aria-hidden="true"
        />
      ) : (
        <HeartIcon
          size={iconSize}
          className="text-white drop-shadow-sm stroke-[2.5]"
          aria-hidden="true"
        />
      )}
    </button>
  );
}
