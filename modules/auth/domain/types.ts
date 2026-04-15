/**
 * modules/auth/domain/types.ts
 */

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthResult {
  uid: string;
  idToken: string;
}
