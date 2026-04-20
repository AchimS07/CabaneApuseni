/**
 * lib/netopia/types.ts
 * TypeScript types for the Netopia Payments REST API v2.
 */

// ─── Checkout request ──────────────────────────────────────────────────────────

export interface NetopiaPaymentConfig {
  emailTemplate?: string;
  notifyUrl: string;
  redirectUrl: string;
  language?: string;
}

export interface NetopiaPaymentOptions {
  installments: number;
  bonus: number;
}

export interface NetopiaPaymentInstrument {
  type: 'card';
  account?: string;
  expMonth?: number;
  expYear?: number;
  secretCode?: string;
  token?: string;
}

export interface NetopiaBillingInfo {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  city: string;
  /** ISO 3166-1 numeric country code. 642 = Romania */
  country: number;
  state: string;
  postalCode: string;
  details: string;
}

export interface NetopiaProduct {
  name: string;
  code: string;
  category: string;
  price: number;
  vat: number;
}

export interface NetopiaOrderRequest {
  ntpID?: string;
  /** Seller signature (posSignature) from the Netopia merchant dashboard */
  posSignature: string;
  /** ISO 8601 date-time */
  dateTime: string;
  description: string;
  orderID: string;
  amount: number;
  currency: string;
  billing: NetopiaBillingInfo;
  shipping: NetopiaBillingInfo;
  products: NetopiaProduct[];
  installments: { selected: number; available: number[] };
  /** Arbitrary metadata returned verbatim in IPN – use to store uid/plan */
  data: Record<string, string>;
}

export interface NetopiaCheckoutRequest {
  config: NetopiaPaymentConfig;
  payment: {
    options: NetopiaPaymentOptions;
    instrument: NetopiaPaymentInstrument;
    data: Record<string, unknown>;
  };
  order: NetopiaOrderRequest;
}

// ─── Checkout response ──────────────────────────────────────────────────────────

export interface NetopiaCheckoutError {
  /** "101" means success/redirect – despite being in the error field */
  code: string;
  message: string;
}

export interface NetopiaCheckoutResponse {
  error: NetopiaCheckoutError;
  payment?: {
    paymentURL: string;
    token?: string;
    ntpID?: string;
    status?: number;
    amount?: number;
    currency?: string;
  };
}

// ─── IPN payload ───────────────────────────────────────────────────────────────

/**
 * Card binding returned on a successful payment.
 * Saving the token allows future charges without a redirect.
 */
export interface NetopiaIpnBinding {
  token: string;
  expMonth: number;
  expYear: number;
}

/**
 * Netopia IPN payment status codes:
 *  3  = Authorized (pending capture)
 *  5  = Confirmed (captured)
 *  6  = Payment failed
 *  12 = Cancelled
 */
export interface NetopiaIpnPayment {
  ntpID: string;
  status: number;
  amount: number;
  currency: string;
  binding?: NetopiaIpnBinding;
  /** Mirrors the `data` field sent in the original order */
  data: Record<string, string>;
}

export interface NetopiaIpnOrder {
  ntpID: string;
  posSignature: string;
  orderID: string;
  amount: number;
  currency: string;
  data: Record<string, string>;
}

export interface NetopiaIpnPayload {
  payment: NetopiaIpnPayment;
  order: NetopiaIpnOrder;
}
