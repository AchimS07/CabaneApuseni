import { describe, it, expect } from '@jest/globals';
import { bookingSchema, loginSchema, registerSchema } from '@/lib/validation/schemas';

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
});

describe('registerSchema', () => {
  it('rejects mismatched passwords', () => {
    const parsed = registerSchema.safeParse({
      name: 'User',
      email: 'user@example.com',
      password: 'password123',
      confirmPassword: 'different',
    });
    expect(parsed.success).toBe(false);
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
});
