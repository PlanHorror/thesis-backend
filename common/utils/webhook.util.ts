import * as crypto from 'crypto';

/**
 * Generate a secure random secret for webhook authentication
 * @param length - Length of the secret in bytes (default: 32, results in 64 hex characters)
 * @returns A cryptographically secure random hex string
 */
export function generateWebhookSecret(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate HMAC-SHA256 signature for webhook payload
 * Used by server to sign outgoing webhooks
 * @param secret - The webhook secret key
 * @param payload - The payload to sign (will be JSON stringified if object)
 * @returns The HMAC-SHA256 signature as hex string
 */
export function generateWebhookSignature(
  secret: string,
  payload: string | object,
): string {
  const payloadString =
    typeof payload === 'string' ? payload : JSON.stringify(payload);
  return crypto
    .createHmac('sha256', secret)
    .update(payloadString)
    .digest('hex');
}

/**
 * Verify webhook signature
 * Used by client to verify incoming webhooks are authentic
 * @param secret - The webhook secret key (stored by client when webhook was created)
 * @param payload - The received payload (as string or object)
 * @param signature - The signature from X-Webhook-Signature header
 * @returns true if signature is valid, false otherwise
 *
 * @example
 * // Client-side verification example:
 * const receivedPayload = req.body;
 * const receivedSignature = req.headers['x-webhook-signature'];
 * const myStoredSecret = 'secret-i-received-when-creating-webhook';
 *
 * if (verifyWebhookSignature(myStoredSecret, receivedPayload, receivedSignature)) {
 *   // Message is authentic - process it
 * } else {
 *   // Message may be tampered or not from the expected server
 * }
 */
export function verifyWebhookSignature(
  secret: string,
  payload: string | object,
  signature: string,
): boolean {
  const expectedSignature = generateWebhookSignature(secret, payload);
  // Use timing-safe comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'hex'),
    Buffer.from(signature, 'hex'),
  );
}
