/**
 * modules/users/domain/types.ts
 */

export type UserRole = 'user' | 'owner' | 'admin';

export type ClientPlan = 'gratuit' | 'explorer' | 'premium';
export type OwnerPlan = 'starter' | 'pro' | 'business';
export type UserPlan = ClientPlan | OwnerPlan;

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  plan?: UserPlan;
  phone?: string;
  avatarUrl?: string;
  createdAt: string; // ISO date string
  updatedAt: string;
}
