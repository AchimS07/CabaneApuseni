/**
 * lib/validation/schemas.ts
 * Shared Zod schemas for all input validation.
 * Used in Server Actions, Route Handlers, and forms (for client-side preview).
 */
import { z } from 'zod';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// ─── Cabins ───────────────────────────────────────────────────────────────────

export const cabinSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  location: z.string().min(2),
  maxGuests: z.number().int().min(1).max(20),
  pricePerNight: z.number().min(0),
  amenities: z.array(z.string()).default([]),
  published: z.boolean().default(false),
  imageUrls: z.array(z.string().url()).default([]),
});

// ─── Bookings ─────────────────────────────────────────────────────────────────

export const bookingSchema = z.object({
  cabinId: z.string().min(1),
  checkIn: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
    .refine((d) => new Date(d) > new Date(), 'Check-in must be in the future'),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  guestCount: z.number().int().min(1),
  notes: z.string().max(500).optional(),
}).refine(
  (data) => new Date(data.checkOut) > new Date(data.checkIn),
  { message: 'Check-out must be after check-in', path: ['checkOut'] },
);

// ─── Users ────────────────────────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});

// ─── Subscriptions ────────────────────────────────────────────────────────────

export const subscriptionTierSchema = z.enum(['basic', 'pro']);
export type SubscriptionTierInput = z.infer<typeof subscriptionTierSchema>;

// ─── Exported types ───────────────────────────────────────────────────────────

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CabinInput = z.infer<typeof cabinSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
