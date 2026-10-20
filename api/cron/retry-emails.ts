/**
 * CRON JOB: EMAIL RETRY WORKER (Vercel Cron)
 *
 * Runs every 10 minutes via Vercel Cron.
 * Scans DB for requests with pending or failed email statuses,
 * re-attempts delivery with idempotency keys, and updates delivery tracking.
 */

import { getEmailConfig } from '../_lib/config';
import { dbStore } from '../_lib/db';
import {
  buildOwnerNotificationEmail,
  buildBuyerConfirmationEmail,
} from '../_lib/emailTemplates';
import { sendEmailWithRetry } from '../_lib/resendClient';

const MAX_CRON_RETRIES = 5;

export default async function handler(req: any, res: any) {
  // Verify authorization: check Vercel CRON_SECRET if set
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers['authorization'];
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    const unauthorized = { error: 'Unauthorized cron trigger' };
    if (res.status && res.json) return res.status(401).json(unauthorized);
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(unauthorized));
  }

  const config = getEmailConfig();
  const failedRequests = dbStore.getFailedRequests();

  console.log(`[Cron: Retry] Found ${failedRequests.length} candidate requests for email retry`);

  const results: Array<{
    reference: string;
    ownerRetried: boolean;
    buyerRetried: boolean;
    ownerSuccess?: boolean;
    buyerSuccess?: boolean;
  }> = [];

  for (const record of failedRequests) {
    if (record.retry_count >= MAX_CRON_RETRIES) {
      console.log(`[Cron: Retry] Request ${record.reference} reached max retries (${record.retry_count}); skipping`);
      continue;
    }

    const templateContext = {
      reference: record.reference,
      planId: record.plan,
      planName: record.planName,
      amountFormatted: record.amountFormatted,
      buyerName: record.name,
      buyerEmail: record.email,
      buyerMessage: record.message,
      mailDomain: config.mailDomain,
    };

    let ownerSuccess = record.owner_email_status === 'sent';
    let buyerSuccess = record.buyer_email_status === 'sent';
    let didRetryOwner = false;
    let didRetryBuyer = false;

    // Retry owner email if pending or failed
    if (record.owner_email_status !== 'sent') {
      didRetryOwner = true;
      const ownerPayload = buildOwnerNotificationEmail(templateContext);
      const ownerResult = await sendEmailWithRetry({
        to: config.ownerEmail,
        from: config.fromRequests,
        replyTo: record.email,
        payload: ownerPayload,
        idempotencyKey: `${record.reference}-owner-retry-${record.retry_count + 1}`,
        requestReference: record.reference,
        type: 'owner_notification',
      });
      ownerSuccess = ownerResult.success;
      if (ownerSuccess) {
        dbStore.updateRequest(record.reference, {
          owner_email_status: 'sent',
          owner_resend_id: ownerResult.resendId,
        });
      }
    }

    // Retry buyer email if pending or failed (and not suppressed)
    if (record.buyer_email_status !== 'sent' && !dbStore.isSuppressed(record.email)) {
      didRetryBuyer = true;
      const buyerPayload = buildBuyerConfirmationEmail(templateContext);
      const buyerResult = await sendEmailWithRetry({
        to: record.email,
        from: config.fromHello,
        replyTo: config.replyToHello,
        payload: buyerPayload,
        idempotencyKey: `${record.reference}-buyer-retry-${record.retry_count + 1}`,
        requestReference: record.reference,
        type: 'buyer_confirmation',
      });
      buyerSuccess = buyerResult.success;
      if (buyerSuccess) {
        dbStore.updateRequest(record.reference, {
          buyer_email_status: 'sent',
          buyer_resend_id: buyerResult.resendId,
        });
      }
    }

    const newRetryCount = record.retry_count + 1;
    let newOverallStatus: 'sent' | 'failed' | 'partial' = 'failed';
    if (ownerSuccess && buyerSuccess) {
      newOverallStatus = 'sent';
    } else if (ownerSuccess || buyerSuccess) {
      newOverallStatus = 'partial';
    }

    dbStore.updateRequest(record.reference, {
      retry_count: newRetryCount,
      last_retry_at: new Date().toISOString(),
      email_status: newOverallStatus,
    });

    results.push({
      reference: record.reference,
      ownerRetried: didRetryOwner,
      buyerRetried: didRetryBuyer,
      ownerSuccess,
      buyerSuccess,
    });
  }

  const summary = {
    ok: true,
    processed: results.length,
    results,
    timestamp: new Date().toISOString(),
  };

  if (res.status && res.json) return res.status(200).json(summary);
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify(summary));
}
