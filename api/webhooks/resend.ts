/**
 * RESEND WEBHOOK HANDLER (Vercel Serverless Function)
 *
 * Receives and processes events from Resend (via Svix):
 * - email.delivered: updates status in DB
 * - email.bounced: marks bounced, adds to suppression list, alerts owner if owner email bounced
 * - email.complained: marks complained, adds to suppression list, alerts owner
 * - email.delivery_delayed: logs warning
 *
 * Implements Svix HMAC-SHA256 signature verification with 5-minute replay window.
 */

import { getEmailConfig } from '../_lib/config';
import { dbStore } from '../_lib/db';
import { verifyResendWebhook } from '../_lib/webhookValidator';
import { sendOwnerEmergencyAlert } from '../_lib/pushNotifier';
import { maskEmail } from '../_lib/sanitizer';

// Read raw body helper for Vercel functions
async function getRawBody(req: any): Promise<string> {
  if (typeof req.body === 'string') return req.body;
  if (Buffer.isBuffer(req.body)) return req.body.toString('utf-8');
  if (req.rawBody) return req.rawBody.toString('utf-8');

  // Stream reading if not pre-parsed
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk: any) => {
      data += chunk;
    });
    req.on('end', () => {
      resolve(data);
    });
    req.on('error', (err: any) => {
      reject(err);
    });
  });
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    const notAllowed = { error: 'Method not allowed' };
    if (res.status && res.json) return res.status(405).json(notAllowed);
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(notAllowed));
  }

  const config = getEmailConfig();

  let rawBody = '';
  try {
    rawBody = await getRawBody(req);
  } catch (err: any) {
    console.error('[Webhook] Failed to read request body:', err?.message || err);
    if (res.status && res.json) return res.status(400).json({ error: 'Cannot read body' });
    res.statusCode = 400;
    return res.end();
  }

  // Svix signature verification
  if (config.resendWebhookSecret) {
    const verification = verifyResendWebhook(rawBody, req.headers, config.resendWebhookSecret);
    if (!verification.valid) {
      console.warn('[Webhook] Invalid signature rejection:', verification.error);
      const unauthPayload = { error: verification.error || 'Invalid signature' };
      if (res.status && res.json) return res.status(401).json(unauthPayload);
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(unauthPayload));
    }
  } else {
    console.warn('[Webhook] Warning: RESEND_WEBHOOK_SECRET is not configured; skipping verification');
  }

  let eventPayload: any;
  try {
    eventPayload = JSON.parse(rawBody);
  } catch {
    if (res.status && res.json) return res.status(400).json({ error: 'Invalid JSON' });
    res.statusCode = 400;
    return res.end();
  }

  const eventType = eventPayload?.type;
  const eventData = eventPayload?.data;
  const emailId = eventData?.email_id || eventData?.id;
  const recipient = Array.isArray(eventData?.to) ? eventData.to[0] : eventData?.to;

  console.log(`[Webhook] Received event: ${eventType} for ID: ${emailId} (to: ${recipient ? maskEmail(recipient) : 'unknown'})`);

  if (!emailId) {
    if (res.status && res.json) return res.status(200).json({ received: true });
    res.statusCode = 200;
    return res.end(JSON.stringify({ received: true }));
  }

  switch (eventType) {
    case 'email.delivered': {
      dbStore.updateEmailByResendId(emailId, { status: 'delivered' });
      break;
    }

    case 'email.bounced': {
      dbStore.updateEmailByResendId(emailId, {
        status: 'bounced',
        error_message: eventData?.bounce?.message || 'Email bounced by recipient mailserver',
      });

      if (recipient) {
        dbStore.suppress(recipient, 'bounce');
        console.warn(`[Webhook] Added ${maskEmail(recipient)} to suppression list due to bounce`);

        // Emergency push alert if the owner email itself bounced!
        if (recipient.toLowerCase() === config.ownerEmail.toLowerCase()) {
          sendOwnerEmergencyAlert(
            `CRITICAL: Owner email to ${config.ownerEmail} bounced! Check DNS MX/SPF/DKIM or Resend configuration immediately.`
          ).catch(() => {});
        }
      }
      break;
    }

    case 'email.complained': {
      dbStore.updateEmailByResendId(emailId, {
        status: 'complained',
        error_message: 'Spam complaint recorded',
      });

      if (recipient) {
        dbStore.suppress(recipient, 'complaint');
        console.warn(`[Webhook] Added ${maskEmail(recipient)} to suppression list due to spam complaint`);

        if (recipient.toLowerCase() === config.ownerEmail.toLowerCase()) {
          sendOwnerEmergencyAlert(
            `CRITICAL: Spam complaint received on owner address ${config.ownerEmail}.`
          ).catch(() => {});
        }
      }
      break;
    }

    case 'email.delivery_delayed': {
      console.warn(`[Webhook] Delivery delayed for ${emailId}: ${eventData?.delay_reason || 'Unknown reason'}`);
      break;
    }

    default: {
      console.log(`[Webhook] Unhandled event type: ${eventType}`);
    }
  }

  const responsePayload = { received: true, event: eventType };
  if (res.status && res.json) return res.status(200).json(responsePayload);
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify(responsePayload));
}
