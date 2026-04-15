/**
 * Unit tests for the shared result helpers.
 */
import { describe, it, expect } from '@jest/globals';
import { ok, fail } from '@/lib/result';

describe('ok', () => {
  it('wraps a value in a success result', () => {
    const r = ok({ id: '1' });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data).toEqual({ id: '1' });
  });
});

describe('fail', () => {
  it('wraps an error result', () => {
    const r = fail('NOT_FOUND', 'Resource not found');
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe('NOT_FOUND');
      expect(r.error.message).toBe('Resource not found');
    }
  });

  it('includes field-level details when provided', () => {
    const r = fail('VALIDATION_ERROR', 'Invalid input', { email: ['Invalid email'] });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.details?.email).toEqual(['Invalid email']);
  });
});
