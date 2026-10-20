/**
 * SPIDYDASHBOARD REQUEST API ENDPOINT (Vercel Serverless Function)
 *
 * Implements high-deliverability email dispatching with Resend:
 * 1. Validates input, strips header injection, blocks disposable domains
 * 2. Saves request to DB FIRST (status: "new", email_status: "pending")
 * 3. Sends push notification (zero-PII secondary notification channel)
 * 4. Sends owner email first to OWNER_EMAIL with validated buyer reply-to
 * 5. Sends buyer confirmation second with conversational tone and next steps
 * 6. Idempotency keys prevent duplicate dispatch on network retry
 * 7. Returns only { ok: true, reference } to the client
 */

import { getEmailConfig } from './lib/config';
import { dbStore, type RequestRecord } from './lib/db';
import {
  validateAndNormalizeEmail,
  stripHeaderInjection,
  maskEmail,
} from './lib/sanitizer';
import {
  buildOwnerNotificationEmail,
  buildBuyerConfirmationEmail,
} from './lib/emailTemplates';
import { sendEmailWithRetry } from './lib/resendClient';
import { sendOwnerPushNotification } from './lib/pushNotifier';

// In-memory rate limiter per IP: max 5 requests per 10 minutes
const ipRateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = ipRateLimitMap.get(ip);
  if (!record || now > record.resetAt) {
    ipRateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }
  record.count += 1;
  return true;
}

function generateReference(): string {
  // Generate stable format like SPIDY-7K3Q9
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let ref = 'SPIDY-';
  for (let i = 0; i < 5; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref;
}

export default async function handler(req: any, res: any) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Turnstile-Token');

  if (req.method === 'OPTIONS') {
    return res.status ? res.status(200).end() : res.end();
  }

  if (req.method === 'GET') {
    const payload = {
      service: 'SpidyDashboard Request API',
      status: 'operational',
      timestamp: new Date().toISOString(),
    };
    if (res.status && res.json) return res.status(200).json(payload);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(payload));
  }

  if (req.method !== 'POST') {
    const err = { error: 'Method not allowed' };
    if (res.status && res.json) return res.status(405).json(err);
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(err));
  }

  // Client IP extraction
  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    '127.0.0.1';

  // Apply Rate Limiting
  if (!checkRateLimit(ip)) {
    console.warn(`[Request API] Rate limit exceeded for IP: ${ip}`);
    const rateLimitPayload = { error: 'Too many requests. Please wait a few minutes before trying again.' };
    if (res.status && res.json) return res.status(429).json(rateLimitPayload);
    res.statusCode = 429;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(rateLimitPayload));
  }

  // Parse Body safely
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  const {
    email: rawEmail,
    plan: rawPlan,
    name: rawName,
    message: rawMessage,
    // Honeypot field (bots fill this, legitimate users never see it)
    website: honeypot,
    // Turnstile token if enabled
    turnstileToken,
  } = body || {};

  // Honeypot verification: reject bot submissions quietly
  if (honeypot && String(honeypot).trim().length > 0) {
    console.warn('[Request API] Honeypot triggered, discarding request silently.');
    const botPayload = { ok: true, reference: 'SPIDY-OK' };
    if (res.status && res.json) return res.status(200).json(botPayload);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(botPayload));
  }

  // Cloudflare Turnstile Verification (if secret key configured)
  const turnstileSecret = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
  if (turnstileSecret && turnstileToken) {
    try {
      const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: turnstileSecret,
          response: turnstileToken,
          remoteip: ip,
        }),
      });
      const verifyData: any = await verifyRes.json();
      if (!verifyData.success) {
        console.warn('[Request API] Turnstile challenge verification failed.');
        const badPayload = { error: 'Bot verification failed. Please refresh and try again.' };
        if (res.status && res.json) return res.status(403).json(badPayload);
        res.statusCode = 403;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(badPayload));
      }
    } catch (e: any) {
      console.warn('[Request API] Turnstile check exception (fail open):', e?.message);
    }
  }

  // Validate and normalize buyer email
  const emailValidation = validateAndNormalizeEmail(rawEmail);
  if (!emailValidation.valid) {
    const errorPayload = { error: emailValidation.error || 'Please provide a valid email address.' };
    if (res.status && res.json) return res.status(400).json(errorPayload);
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(errorPayload));
  }

  const buyerEmail = emailValidation.email;
  const buyerName = stripHeaderInjection(rawName || '').slice(0, 100);
  const buyerMessage = String(rawMessage || '').slice(0, 1500);

  // Plan normalization - SpidyDashboard, Student Edition (Rs 999)
  const planId = 'student_edition';
  const planName = 'SpidyDashboard, Student Edition';
  const amountFormatted = '₹999';

  // Generate Reference ID
  const reference = generateReference();
  const config = getEmailConfig();

  // STEP 1: SAVE TO DATABASE FIRST (status: "new", email_status: "pending")
  const requestRecord: RequestRecord = {
    id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    reference,
    plan: planId,
    planName,
    amountFormatted,
    email: buyerEmail,
    name: buyerName || 'Customer',
    message: buyerMessage,
    status: 'new',
    email_status: 'pending',
    owner_email_status: 'pending',
    buyer_email_status: 'pending',
    retry_count: 0,
    created_at: new Date().toISOString(),
    ip,
    user_agent: req.headers['user-agent'] as string | undefined,
  };

  dbStore.saveRequest(requestRecord);
  console.log(`[Request API] Saved new request ${reference} for ${maskEmail(buyerEmail)} to database`);

  // STEP 2: DISPATCH SECONDARY PUSH NOTIFICATION (zero-PII)
  sendOwnerPushNotification({
    reference,
    planName,
    amountFormatted,
  }).catch((err) => {
    console.warn('[Request API] Push notification background error:', err?.message || err);
  });

  // Prepare Email Templates
  const templateContext = {
    reference,
    planId,
    planName,
    amountFormatted,
    buyerName,
    buyerEmail,
    buyerMessage,
    mailDomain: config.mailDomain,
  };

  const ownerPayload = buildOwnerNotificationEmail(templateContext);
  const buyerPayload = buildBuyerConfirmationEmail(templateContext);

  // STEP 3: SEND OWNER EMAIL FIRST
  let ownerResendId: string | undefined;
  let ownerStatus: 'sent' | 'failed' = 'failed';

  try {
    const ownerResult = await sendEmailWithRetry({
      to: config.ownerEmail,
      from: config.fromRequests,
      replyTo: buyerEmail,
      payload: ownerPayload,
      idempotencyKey: `${reference}-owner`,
      requestReference: reference,
      type: 'owner_notification',
    });

    if (ownerResult.success) {
      ownerStatus = 'sent';
      ownerResendId = ownerResult.resendId;
      console.log(`[Request API] Owner email sent successfully (${ownerResendId})`);
    } else {
      console.warn(`[Request API] Owner email dispatch failed: ${ownerResult.error}`);
    }
  } catch (err: any) {
    console.error(`[Request API] Owner email exception: ${err?.message || err}`);
  }

  // STEP 4: SEND BUYER CONFIRMATION SECOND (failure never blocks owner or success screen)
  let buyerResendId: string | undefined;
  let buyerStatus: 'sent' | 'failed' | 'suppressed' = 'failed';

  if (dbStore.isSuppressed(buyerEmail)) {
    buyerStatus = 'suppressed';
    console.warn(`[Request API] Buyer email ${maskEmail(buyerEmail)} suppressed`);
  } else {
    try {
      const buyerResult = await sendEmailWithRetry({
        to: buyerEmail,
        from: config.fromHello,
        replyTo: config.replyToHello,
        payload: buyerPayload,
        idempotencyKey: `${reference}-buyer`,
        requestReference: reference,
        type: 'buyer_confirmation',
      });

      if (buyerResult.success) {
        buyerStatus = 'sent';
        buyerResendId = buyerResult.resendId;
        console.log(`[Request API] Buyer confirmation sent successfully (${buyerResendId})`);
      } else {
        console.warn(`[Request API] Buyer confirmation dispatch failed: ${buyerResult.error}`);
      }
    } catch (err: any) {
      console.error(`[Request API] Buyer email exception: ${err?.message || err}`);
    }
  }

  // STEP 5: UPDATE DB RECORD WITH EMAIL RESULTS
  let overallEmailStatus: 'sent' | 'failed' | 'partial' = 'failed';
  if (ownerStatus === 'sent' && buyerStatus === 'sent') {
    overallEmailStatus = 'sent';
  } else if (ownerStatus === 'sent' || buyerStatus === 'sent') {
    overallEmailStatus = 'partial';
  }

  dbStore.updateRequest(reference, {
    email_status: overallEmailStatus,
    owner_email_status: ownerStatus,
    buyer_email_status: buyerStatus,
    owner_resend_id: ownerResendId,
    buyer_resend_id: buyerResendId,
  });

  // STEP 6: RETURN ONLY { ok: true, reference } TO BROWSER
  const clientResponse = {
    ok: true,
    reference,
  };

  if (res.status && res.json) {
    return res.status(200).json(clientResponse);
  }
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify(clientResponse));
}
