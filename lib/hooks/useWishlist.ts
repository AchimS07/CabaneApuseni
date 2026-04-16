'use client';

/**
 * lib/hooks/useWishlist.ts
 * Client-side hook for managing cabin wishlist state.
 * Reads initial state from user profile (via useAuth) and persists changes to Firestore.
 * Uses optimistic updates so the UI feels instant.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { toggleWishlistCabin } from '@/lib/firestore';

export interface UseWishlistReturn {
  wishlist: Set<string>;
  isWishlisted: (cabinId: string) => boolean;
  toggle: (cabinId: string) => Promise<void>;
  loading: boolean;
}

export function useWishlist(): UseWishlistReturn {
  const { user, profile } = useAuth();
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Sync wishlist from profile when it loads / changes
  useEffect(() => {
    const ids = (profile as { wishlistedCabins?: string[] } | null)?.wishlistedCabins ?? [];
    setWishlist(new Set(ids));
  }, [profile]);

  const isWishlisted = useCallback(
    (cabinId: string) => wishlist.has(cabinId),
    [wishlist],
  );

  const toggle = useCallback(
    async (cabinId: string) => {
      if (!user) return; // caller is responsible for redirecting to login

      const wasAdded = !wishlist.has(cabinId);

      // Optimistic update
      setWishlist((prev) => {
        const next = new Set(prev);
        if (wasAdded) {
          next.add(cabinId);
        } else {
          next.delete(cabinId);
        }
        return next;
      });

      setLoading(true);
      try {
        await toggleWishlistCabin(user.uid, cabinId, wasAdded);
      } catch {
        // Revert optimistic update on failure
        setWishlist((prev) => {
          const next = new Set(prev);
          if (wasAdded) {
            next.delete(cabinId);
          } else {
            next.add(cabinId);
          }
          return next;
        });
      } finally {
        setLoading(false);
      }
    },
    [user, wishlist],
  );

  return { wishlist, isWishlisted, toggle, loading };
}
