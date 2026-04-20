import { describe, it, expect } from '@jest/globals';
import { bookingSchema, cabinSchema, loginSchema, registerSchema, updateProfileSchema } from '@/lib/validation/schemas';

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    const parsed = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'password123',
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects invalid email and short password', () => {
    const parsed = loginSchema.safeParse({
      email: 'invalid-email',
      password: '123',
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects missing email', () => {
    const parsed = loginSchema.safeParse({ password: 'password123' });
    expect(parsed.success).toBe(false);
  });

  it('rejects missing password', () => {
    const parsed = loginSchema.safeParse({ email: 'user@example.com' });
    expect(parsed.success).toBe(false);
  });

  it('rejects empty object', () => {
    expect(loginSchema.safeParse({}).success).toBe(false);
  });
});

describe('registerSchema', () => {
  it('accepts valid matching passwords', () => {
    const parsed = registerSchema.safeParse({
      name: 'Ion Popescu',
      email: 'ion@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects mismatched passwords', () => {
    const parsed = registerSchema.safeParse({
      name: 'User',
      email: 'user@example.com',
      password: 'password123',
      confirmPassword: 'different',
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects name that is too short', () => {
    const parsed = registerSchema.safeParse({
      name: 'A',
      email: 'user@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const parsed = registerSchema.safeParse({
      name: 'Ion Popescu',
      email: 'not-an-email',
      password: 'password123',
      confirmPassword: 'password123',
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects short password', () => {
    const parsed = registerSchema.safeParse({
      name: 'Ion Popescu',
      email: 'ion@example.com',
      password: 'short',
      confirmPassword: 'short',
    });
    expect(parsed.success).toBe(false);
  });
});

describe('cabinSchema', () => {
  const validCabin = {
    title: 'Cabana Apuseni',
    slug: 'cabana-apuseni',
    description: 'O cabana frumoasa in munti cu vedere panoramica.',
    location: 'Munții Apuseni',
    maxGuests: 4,
    pricePerNight: 300,
    amenities: ['wifi', 'parking'],
    imageUrls: ['https://example.com/image.jpg'],
    published: false,
  };

  it('accepts a valid cabin', () => {
    expect(cabinSchema.safeParse(validCabin).success).toBe(true);
  });

  it('defaults amenities and imageUrls to empty arrays', () => {
    const { amenities, imageUrls, ...rest } = validCabin;
    const parsed = cabinSchema.safeParse(rest);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.amenities).toEqual([]);
      expect(parsed.data.imageUrls).toEqual([]);
    }
  });

  it('defaults published to false', () => {
    const { published, ...rest } = validCabin;
    const parsed = cabinSchema.safeParse(rest);
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.published).toBe(false);
  });

  it('rejects title shorter than 3 characters', () => {
    expect(cabinSchema.safeParse({ ...validCabin, title: 'AB' }).success).toBe(false);
  });

  it('rejects slug with uppercase letters', () => {
    expect(cabinSchema.safeParse({ ...validCabin, slug: 'Cabana-Test' }).success).toBe(false);
  });

  it('rejects slug with spaces', () => {
    expect(cabinSchema.safeParse({ ...validCabin, slug: 'cabana test' }).success).toBe(false);
  });

  it('rejects description shorter than 20 characters', () => {
    expect(cabinSchema.safeParse({ ...validCabin, description: 'Too short' }).success).toBe(false);
  });

  it('rejects maxGuests of 0', () => {
    expect(cabinSchema.safeParse({ ...validCabin, maxGuests: 0 }).success).toBe(false);
  });

  it('rejects maxGuests greater than 20', () => {
    expect(cabinSchema.safeParse({ ...validCabin, maxGuests: 21 }).success).toBe(false);
  });

  it('rejects maxGuests that is not an integer', () => {
    expect(cabinSchema.safeParse({ ...validCabin, maxGuests: 2.5 }).success).toBe(false);
  });

  it('rejects negative pricePerNight', () => {
    expect(cabinSchema.safeParse({ ...validCabin, pricePerNight: -1 }).success).toBe(false);
  });

  it('rejects pricePerNight of 0', () => {
    expect(cabinSchema.safeParse({ ...validCabin, pricePerNight: 0 }).success).toBe(false);
  });

  it('rejects non-URL strings in imageUrls', () => {
    expect(
      cabinSchema.safeParse({ ...validCabin, imageUrls: ['not-a-url'] }).success,
    ).toBe(false);
  });
});

describe('bookingSchema', () => {
  it('accepts valid booking dates and guest count', () => {
    const parsed = bookingSchema.safeParse({
      cabinId: 'cabin-1',
      checkIn: '2030-06-10',
      checkOut: '2030-06-12',
      guestCount: 2,
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects check-out before check-in', () => {
    const parsed = bookingSchema.safeParse({
      cabinId: 'cabin-1',
      checkIn: '2030-06-12',
      checkOut: '2030-06-10',
      guestCount: 2,
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects a past check-in date', () => {
    const parsed = bookingSchema.safeParse({
      cabinId: 'cabin-1',
      checkIn: '2020-01-01',
      checkOut: '2020-01-03',
      guestCount: 2,
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects guestCount of 0', () => {
    const parsed = bookingSchema.safeParse({
      cabinId: 'cabin-1',
      checkIn: '2030-06-10',
      checkOut: '2030-06-12',
      guestCount: 0,
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects dates not in YYYY-MM-DD format', () => {
    const parsed = bookingSchema.safeParse({
      cabinId: 'cabin-1',
      checkIn: '10/06/2030',
      checkOut: '12/06/2030',
      guestCount: 2,
    });
    expect(parsed.success).toBe(false);
  });

  it('accepts optional notes within 500 characters', () => {
    const parsed = bookingSchema.safeParse({
      cabinId: 'cabin-1',
      checkIn: '2030-06-10',
      checkOut: '2030-06-12',
      guestCount: 2,
      notes: 'Please prepare the fireplace.',
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects notes longer than 500 characters', () => {
    const parsed = bookingSchema.safeParse({
      cabinId: 'cabin-1',
      checkIn: '2030-06-10',
      checkOut: '2030-06-12',
      guestCount: 2,
      notes: 'A'.repeat(501),
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects missing cabinId', () => {
    const parsed = bookingSchema.safeParse({
      checkIn: '2030-06-10',
      checkOut: '2030-06-12',
      guestCount: 2,
    });
    expect(parsed.success).toBe(false);
  });
});

describe('updateProfileSchema', () => {
  it('accepts a valid profile update with name only', () => {
    expect(updateProfileSchema.safeParse({ name: 'Ion Popescu' }).success).toBe(true);
  });

  it('accepts optional phone and avatarUrl', () => {
    const parsed = updateProfileSchema.safeParse({
      name: 'Ion Popescu',
      phone: '+40723000000',
      avatarUrl: 'https://example.com/avatar.jpg',
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects name shorter than 2 characters', () => {
    expect(updateProfileSchema.safeParse({ name: 'A' }).success).toBe(false);
  });

  it('rejects non-URL avatarUrl', () => {
    expect(
      updateProfileSchema.safeParse({ name: 'Ion Popescu', avatarUrl: 'not-a-url' }).success,
    ).toBe(false);
  });

  it('accepts missing optional fields', () => {
    expect(updateProfileSchema.safeParse({ name: 'Maria Ionescu' }).success).toBe(true);
  });
});
