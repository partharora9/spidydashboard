/**
 * ADMIN DELIVERABILITY API (Vercel Serverless Function)
 *
 * Provides status for the Admin Deliverability dashboard:
 * - GET: list recent requests, email logs, and suppression entries
 * - POST action 'test_send': dispatches a test email directly to owner's Gmail or specified address
 * - POST action 'unsuppress': removes an email from the bounce/complaint suppression list
 */

import { getEmailConfig } from '../lib/config';
import { dbStore } from '../lib/db';
import { sendEmailWithRetry } from '../lib/resendClient';

export default async function handler(req: any, res: any) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Secret, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status ? res.status(200).end() : res.end();
  }

  const config = getEmailConfig();

  // Validate admin secret
  const authHeader = req.headers['authorization'];
  const customHeader = req.headers['x-admin-secret'];
  const querySecret = req.query?.secret;

  const providedSecret =
    customHeader ||
    (authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined) ||
    querySecret;

  if (config.adminSecret && providedSecret !== config.adminSecret) {
    const unauthorized = { error: 'Unauthorized: Invalid admin secret key' };
    if (res.status && res.json) return res.status(401).json(unauthPayload);
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(unauthorized));
  }

  if (req.method === 'GET') {
    const requests = dbStore.getAllRequests().slice(0, 50);
    const emailLogs = dbStore.getAllEmailLogs().slice(0, 100);
    const suppressionList = dbStore.getSuppressionList();

    const data = {
      ok: true,
      config: {
        mailDomain: config.mailDomain,
        fromRequests: config.fromRequests,
        fromHello: config.fromHello,
        hasResendKey: !!config.resendApiKey,
        hasWebhookSecret: !!config.resendWebhookSecret,
        hasPushNotification: !!(config.ntfyTopic || config.telegramBotToken),
      },
      stats: {
        totalRequests: requests.length,
        totalEmailLogs: emailLogs.length,
        totalSuppressed: suppressionList.length,
        deliveredCount: emailLogs.filter((l) => l.status === 'delivered').length,
        bouncedCount: emailLogs.filter((l) => l.status === 'bounced').length,
        complainedCount: emailLogs.filter((l) => l.status === 'complained').length,
      },
      requests,
      emailLogs,
      suppressionList,
    };

    if (res.status && res.json) return res.status(200).json(data);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(data));
  }

  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }

    const { action, email, type } = body || {};

    if (action === 'test_send') {
      const targetEmail = email || config.ownerEmail;
      const testRef = `TEST-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      const testPayload = {
        subject: `Deliverability Test ${testRef}`,
        html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Deliverability Test</title></head>
<body style="font-family: -apple-system, sans-serif; padding: 24px; color: #111;">
  <div style="max-width: 540px; margin: 0 auto; border: 1px solid #E5E7EB; border-radius: 8px; padding: 20px;">
    <h3 style="margin-top: 0; color: #2563EB;">SpidyDashboard Deliverability Check</h3>
    <p>This is an automated deliverability diagnostic sent from <strong>${config.fromRequests}</strong>.</p>
    <p>Target: <code>${targetEmail}</code></p>
    <p>Reference: <code>${testRef}</code></p>
    <p>Timestamp: <code>${new Date().toISOString()}</code></p>
    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
    <p style="font-size: 13px; color: #6B7280;">If you received this in your primary inbox, your SPF, DKIM, DMARC, and Resend credentials are working correctly.</p>
  </div>
</body>
</html>`,
        text: `SpidyDashboard Deliverability Check\n\nThis is an automated test from ${config.fromRequests}.\nTarget: ${targetEmail}\nReference: ${testRef}\nTimestamp: ${new Date().toISOString()}\n\nIf you see this in your primary inbox, your SPF, DKIM, and DMARC are working properly.`,
        headers: {
          'Message-ID': `<test.${testRef.toLowerCase()}@mail.${config.mailDomain}>`,
          'Date': new Date().toUTCString(),
          'X-Entity-Ref-ID': testRef,
        },
      };

      const result = await sendEmailWithRetry({
        to: targetEmail,
        from: type === 'hello' ? config.fromHello : config.fromRequests,
        replyTo: config.replyToHello,
        payload: testPayload,
        idempotencyKey: `${testRef}-manual-test`,
        requestReference: testRef,
        type: 'test',
      });

      const responsePayload = {
        ok: result.success,
        resendId: result.resendId,
        error: result.error,
        targetEmail,
      };

      if (res.status && res.json) return res.status(200).json(responsePayload);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(responsePayload));
    }

    if (action === 'unsuppress' && email) {
      const removed = dbStore.unsuppress(email);
      const unsuppressPayload = { ok: true, removed, email };
      if (res.status && res.json) return res.status(200).json(unsuppressPayload);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(unsuppressPayload));
    }

    const badPayload = { error: 'Unknown action' };
    if (res.status && res.json) return res.status(400).json(badPayload);
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(badPayload));
  }

  const methodNotAllowed = { error: 'Method not allowed' };
  if (res.status && res.json) return res.status(405).json(methodNotAllowed);
  res.statusCode = 405;
  return res.end();
}
