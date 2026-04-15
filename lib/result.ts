/**
 * lib/result.ts
 * Standard result envelope used by all application services and actions.
 */

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: AppError };

export interface AppError {
  code: ErrorCode;
  message: string;
  details?: Record<string, string[]>; // field-level validation errors
}

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'AUTH_ERROR'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'UNAVAILABLE'
  | 'INTERNAL_ERROR';

export function ok<T>(data: T): Result<T> {
  return { ok: true, data };
}

export function fail(code: ErrorCode, message: string, details?: Record<string, string[]>): Result<never> {
  return { ok: false, error: { code, message, details } };
}
