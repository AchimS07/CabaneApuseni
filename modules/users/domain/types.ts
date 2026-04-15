/**
 * modules/users/domain/types.ts
 */

export type UserRole = 'user' | 'owner' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  createdAt: string; // ISO date string
  updatedAt: string;
}
