/**
 * RESEND EMAIL DISPATCH ENGINE
 * Robust transactional sender with 8-second timeout, 3x exponential backoff with jitter,
 * 429/5xx retry handling (4xx fast-fail), idempotency keys, and zero tracking redirects.
 */

import { getEmailConfig } from './config';
import { dbStore, type EmailLogRecord } from './db';
import type { EmailPayload } from './emailTemplates';

export interface SendEmailOptions {
  to: string;
  from: string;
  replyTo?: string;
  payload: EmailPayload;
  idempotencyKey: string;
  requestReference: string;
  type: 'owner_notification' | 'buyer_confirmation' | 'test';
}

export interface SendResult {
  success: boolean;
  resendId?: string;
  error?: string;
  statusCode?: number;
  attempts: number;
}

const RESEND_API_URL = 'https://api.resend.com/emails';
const MAX_ATTEMPTS = 3;
const TIMEOUT_MS = 8000;

/**
 * Computes exponential backoff with jitter:
 * Base: 500ms -> 1000ms -> 2000ms + random jitter (0-250ms)
 */
function getBackoffDelay(attempt: number): number {
  const base = Math.min(500 * Math.pow(2, attempt - 1), 3000);
  const jitter = Math.floor(Math.random() * 250);
  return base + jitter;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function sendEmailWithRetry(options: SendEmailOptions): Promise<SendResult> {
  const config = getEmailConfig();
  const emailLogId = `log_${options.idempotencyKey}`;

  // Check if address is on suppression list (bounced or complained)
  if (dbStore.isSuppressed(options.to)) {
    console.warn(`[Resend] Suppressed recipient ${options.to} - skipping delivery`);
    return {
      success: false,
      error: 'Recipient address is on the bounce/complaint suppression list',
      attempts: 0,
    };
  }

  // Pre-log email as pending
  const logRecord: EmailLogRecord = {
    id: emailLogId,
    request_reference: options.requestReference,
    recipient: options.to,
    type: options.type,
    status: 'pending',
    idempotency_key: options.idempotencyKey,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  dbStore.logEmail(logRecord);

  // If no Resend API key is present (dev mode / mock test)
  if (!config.resendApiKey) {
    console.log(`[Resend Mock] Simulating send to ${options.to} (Subject: "${options.payload.subject}")`);
    const mockId = `mock_re_${Date.now()}`;
    dbStore.logEmail({
      ...logRecord,
      resend_id: mockId,
      status: 'sent',
    });
    return {
      success: true,
      resendId: mockId,
      attempts: 1,
    };
  }

  let lastError = 'Unknown error';
  let lastStatus = 500;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(RESEND_API_URL, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Authorization': `Bearer ${config.resendApiKey}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': options.idempotencyKey,
        },
        body: JSON.stringify({
          from: options.from,
          to: [options.to],
          reply_to: options.replyTo,
          subject: options.payload.subject,
          html: options.payload.html,
          text: options.payload.text,
          headers: options.payload.headers,
        }),
      });

      clearTimeout(timer);
      lastStatus = response.status;

      let data: any = {};
      try {
        data = await response.json();
      } catch {
        // Non-JSON response
      }

      // Success
      if (response.ok && data?.id) {
        dbStore.logEmail({
          ...logRecord,
          resend_id: data.id,
          status: 'sent',
          updated_at: new Date().toISOString(),
        });
        return {
          success: true,
          resendId: data.id,
          statusCode: response.status,
          attempts: attempt,
        };
      }

      // Handle Failures
      lastError = data?.message || data?.error || `HTTP ${response.status}`;
      console.warn(`[Resend] Attempt ${attempt} failed with status ${response.status}: ${lastError}`);

      // 4xx errors (e.g. 400 Bad Request, 401 Unauthorized, 403 Forbidden, 422 Unprocessable)
      // DO NOT RETRY 4xx errors, EXCEPT 429 Rate Limit
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        console.error(`[Resend] Fast-failing non-retryable 4xx client error (${response.status}): ${lastError}`);
        break;
      }

      // If 429 or 5xx: retry with backoff if attempts remaining
      if (attempt < MAX_ATTEMPTS) {
        const delay = getBackoffDelay(attempt);
        await sleep(delay);
      }
    } catch (err: any) {
      clearTimeout(timer);
      const isTimeout = err?.name === 'AbortError' || err?.message?.includes('aborted');
      lastError = isTimeout ? `Request timed out after ${TIMEOUT_MS}ms` : err?.message || 'Network exception';
      console.warn(`[Resend] Attempt ${attempt} caught network error: ${lastError}`);

      if (attempt < MAX_ATTEMPTS) {
        const delay = getBackoffDelay(attempt);
        await sleep(delay);
      }
    }
  }

  // All retries failed
  dbStore.logEmail({
    ...logRecord,
    status: 'failed',
    error_message: lastError,
    updated_at: new Date().toISOString(),
  });

  return {
    success: false,
    error: lastError,
    statusCode: lastStatus,
    attempts: MAX_ATTEMPTS,
  };
}
