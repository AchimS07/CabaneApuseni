/**
 * lib/netopia/client.ts
 * Server-only Netopia Payments API client. Never import in Client Components.
 *
 * Implements the Netopia Payments REST API v2:
 * https://doc.netopia-payments.com/docs/payment-api/v2.x/start/start-strc/
 *
 * Environment variables required:
 *   NETOPIA_API_KEY       – API key from Netopia merchant dashboard
 *   NETOPIA_SELLER_ID     – posSignature (seller ID) from Netopia dashboard
 *   NETOPIA_SANDBOX       – set to "true" for sandbox mode (omit for production)
 */
import { getServerEnv } from '@/lib/env';
import type { NetopiaCheckoutRequest, NetopiaCheckoutResponse } from './types';

const SANDBOX_URL = 'https://secure.sandbox.netopia-payments.com/payment/card/start';
const LIVE_URL = 'https://secure.mobilpay.ro/pay/payment/card/start';

export function getNetopiaBaseUrl(): string {
  const env = getServerEnv();
  return env.NETOPIA_SANDBOX === 'true' ? SANDBOX_URL : LIVE_URL;
}

/**
 * Initiates a Netopia hosted checkout session.
 * Returns the checkout response containing `payment.paymentURL`.
 *
 * A successful response has `error.code === "101"` (quirk of Netopia's API –
 * code 101 means "redirect user to paymentURL", not an error).
 */
export async function createNetopiaPayment(
  payload: NetopiaCheckoutRequest,
): Promise<NetopiaCheckoutResponse> {
  const env = getServerEnv();
  if (!env.NETOPIA_API_KEY) {
    throw new Error('NETOPIA_API_KEY is not configured. Add it to your .env.local file.');
  }

  const url = getNetopiaBaseUrl();
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: env.NETOPIA_API_KEY,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Netopia API error ${response.status}: ${text}`);
  }

  return response.json() as Promise<NetopiaCheckoutResponse>;
}
