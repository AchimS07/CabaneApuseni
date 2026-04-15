/**
 * lib/validation/schemas.ts
 * Shared Zod schemas for all input validation.
 * Used in Server Actions, Route Handlers, and forms (for client-side preview).
 */
import { z } from 'zod';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('Adresă de email invalidă'),
  password: z.string().min(8, 'Parola trebuie să aibă cel puțin 8 caractere'),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Numele trebuie să aibă cel puțin 2 caractere'),
    email: z.string().email('Adresă de email invalidă'),
    password: z.string().min(8, 'Parola trebuie să aibă cel puțin 8 caractere'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Parolele nu coincid',
    path: ['confirmPassword'],
  });

// ─── Cabins ───────────────────────────────────────────────────────────────────

export const cabinSchema = z.object({
  title: z.string().min(3, 'Titlul trebuie să aibă cel puțin 3 caractere'),
  slug: z
    .string()
    .min(3, 'Slug-ul trebuie să aibă cel puțin 3 caractere')
    .regex(/^[a-z0-9-]+$/, 'Slug-ul poate conține doar litere mici, cifre și liniuțe'),
  description: z.string().min(20, 'Descrierea trebuie să aibă cel puțin 20 de caractere'),
  location: z.string().min(2, 'Locația este obligatorie'),
  maxGuests: z.number().int().min(1, 'Minimum 1 oaspete').max(20, 'Maximum 20 de oaspeți'),
  pricePerNight: z.number().min(1, 'Prețul trebuie să fie cel puțin 1 RON'),
  amenities: z.array(z.string()).default([]),
  published: z.boolean().default(false),
  imageUrls: z.array(z.string().url('URL imagine invalid')).default([]),
});

// ─── Bookings ─────────────────────────────────────────────────────────────────

export const bookingSchema = z.object({
  cabinId: z.string().min(1, 'Cabana este obligatorie'),
  checkIn: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data trebuie să fie în format YYYY-MM-DD')
    .refine((d) => new Date(d) > new Date(), 'Data de check-in trebuie să fie în viitor'),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data trebuie să fie în format YYYY-MM-DD'),
  guestCount: z.number().int().min(1, 'Minimum 1 oaspete'),
  notes: z.string().max(500, 'Mențiunile nu pot depăși 500 de caractere').optional(),
}).refine(
  (data) => new Date(data.checkOut) > new Date(data.checkIn),
  { message: 'Data de check-out trebuie să fie după check-in', path: ['checkOut'] },
);

// ─── Users ────────────────────────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Numele trebuie să aibă cel puțin 2 caractere'),
  phone: z.string().optional(),
  avatarUrl: z.string().url('URL invalid pentru avatar').optional(),
});

// ─── Exported types ───────────────────────────────────────────────────────────

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CabinInput = z.infer<typeof cabinSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
