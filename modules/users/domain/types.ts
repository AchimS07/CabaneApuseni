/**
 * modules/users/domain/types.ts
 */

export type UserRole = 'user' | 'owner' | 'admin';

export type SubscriptionTier = 'basic' | 'pro';
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'cancelled';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  createdAt: string; // ISO date string
  updatedAt: string;
  subscriptionTier: SubscriptionTier | null;
  subscriptionStatus: SubscriptionStatus | null;
  subscriptionExpiresAt: string | null;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}
