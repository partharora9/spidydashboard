/**
 * RESEND / SVIX WEBHOOK SIGNATURE VERIFIER
 * Validates HMAC-SHA256 signatures with constant-time comparison and 5-minute replay window.
 */

import crypto from 'crypto';

export interface WebhookVerificationResult {
  valid: boolean;
  error?: string;
}

const TOLERANCE_SECONDS = 300; // 5 minutes

export function verifyResendWebhook(
  rawBody: string,
  headers: Record<string, string | string[] | undefined>,
  secret: string
): WebhookVerificationResult {
  if (!secret) {
    return { valid: false, error: 'Webhook secret is not configured' };
  }

  const svixId = (headers['svix-id'] || headers['Svix-Id']) as string | undefined;
  const svixTimestamp = (headers['svix-timestamp'] || headers['Svix-Timestamp']) as string | undefined;
  const svixSignature = (headers['svix-signature'] || headers['Svix-Signature']) as string | undefined;

  if (!svixId || !svixTimestamp || !svixSignature) {
    return { valid: false, error: 'Missing required Svix headers' };
  }

  // Check timestamp freshness to mitigate replay attacks
  const timestampSec = parseInt(svixTimestamp, 10);
  const nowSec = Math.floor(Date.now() / 1000);

  if (isNaN(timestampSec) || Math.abs(nowSec - timestampSec) > TOLERANCE_SECONDS) {
    return { valid: false, error: 'Webhook timestamp is outside of the 5-minute tolerance window' };
  }

  // Parse secret (strip 'whsec_' if present)
  let secretKey: Buffer;
  try {
    const rawSecret = secret.startsWith('whsec_') ? secret.slice(6) : secret;
    secretKey = Buffer.from(rawSecret, 'base64');
  } catch {
    return { valid: false, error: 'Invalid secret format' };
  }

  // Sign: "${svix_id}.${svix_timestamp}.${rawBody}"
  const toSign = `${svixId}.${svixTimestamp}.${rawBody}`;
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(toSign);
  const expectedSignature = hmac.digest('base64');

  // svixSignature format: "v1,g0hM9Lw... v1,another..."
  const passedSignatures = svixSignature.split(' ');
  for (const part of passedSignatures) {
    const [version, signature] = part.split(',');
    if (version === 'v1' && signature) {
      try {
        const expectedBuf = Buffer.from(expectedSignature, 'utf-8');
        const signatureBuf = Buffer.from(signature, 'utf-8');
        if (expectedBuf.length === signatureBuf.length && crypto.timingSafeEqual(expectedBuf, signatureBuf)) {
          return { valid: true };
        }
      } catch {
        // Continue checking other signatures
      }
    }
  }

  return { valid: false, error: 'Webhook signature verification failed' };
}
