/**
 * Vercel Serverless Function: /api/recovery/*
 * Handles:
 * - POST /api/recovery/request
 * - POST /api/recovery/verify
 */

import crypto from 'crypto';
import { db } from '../../server/src/db';
import { SERVER_PLANS, PLAN_ID } from '../../server/src/config/plans';
import { DeliveryService } from '../../server/src/services/deliveryService';
import { emailService, EmailTemplates } from '../../server/src/services/email/EmailProvider';
import { env } from '../../server/src/config/env';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Turnstile-Token');

  if (req.method === 'OPTIONS') {
    return res.status ? res.status(200).end() : res.end();
  }

  const pathParam = req.query?.path;
  const pathSegments: string[] = Array.isArray(pathParam)
    ? pathParam
    : (req.url?.split('/api/recovery/')[1] || '').split('?')[0].split('/');

  const action = pathSegments[0]?.trim().toLowerCase();

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  // 1. Request OTP (POST /api/recovery/request)
  if (action === 'request' && req.method === 'POST') {
    try {
      const { reference, email } = body || {};
      const cleanRef = String(reference || '').trim().toUpperCase();
      const cleanEmail = String(email || '').trim().toLowerCase();

      if (!cleanRef || !cleanEmail.includes('@')) {
        const err = { error: 'Please provide valid order reference and email.' };
        if (res.status && res.json) return res.status(400).json(err);
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(err));
      }

      const order = db.getOrderByReference(cleanRef);

      if (!order || order.buyer_email.toLowerCase().trim() !== cleanEmail) {
        const payload = {
          success: true,
          message: 'If the reference and email match an approved purchase, a 6-digit code has been sent.',
        };
        if (res.status && res.json) return res.status(200).json(payload);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(payload));
      }

      if (order.status !== 'approved') {
        const err = {
          error: `Order status is currently '${order.status}'. Recovery is only available for approved orders.`,
        };
        if (res.status && res.json) return res.status(400).json(err);
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(err));
      }

      const rawOtp = crypto.randomInt(100000, 999999).toString();
      const codeHash = crypto.createHash('sha256').update(rawOtp).digest('hex');
      const expiresAt = new Date(Date.now() + env.OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();

      db.createOtp({
        target_email: order.buyer_email,
        order_reference: order.reference,
        purpose: 'file_recovery',
        code_hash: codeHash,
        expires_at: expiresAt,
      });

      try {
        const emailMsg = EmailTemplates.otpVerificationCode(order.buyer_email, rawOtp, 'SpidyDashboard File Recovery');
        await emailService.sendEmail({
          to: order.buyer_email,
          ...emailMsg,
        });
      } catch (e) {
        console.warn('[Recovery API] Email send warning:', e);
      }

      const payload = {
        success: true,
        message: 'Verification code sent to your email address.',
      };
      if (res.status && res.json) return res.status(200).json(payload);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(payload));
    } catch (err: any) {
      console.error('[Recovery API] OTP request error:', err);
      const errPayload = { error: 'Failed to send recovery code.' };
      if (res.status && res.json) return res.status(500).json(errPayload);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(errPayload));
    }
  }

  // 2. Verify OTP (POST /api/recovery/verify)
  if (action === 'verify' && req.method === 'POST') {
    try {
      const { reference, email, code } = body || {};
      const cleanRef = String(reference || '').trim().toUpperCase();
      const cleanEmail = String(email || '').trim().toLowerCase();
      const cleanCode = String(code || '').trim();

      if (!cleanRef || !cleanEmail || !/^[0-9]{6}$/.test(cleanCode)) {
        const err = { error: 'Invalid verification input. Code must be 6 digits.' };
        if (res.status && res.json) return res.status(400).json(err);
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(err));
      }

      const order = db.getOrderByReference(cleanRef);
      if (!order || order.buyer_email.toLowerCase().trim() !== cleanEmail) {
        const err = { error: 'Order reference and email combination does not match.' };
        if (res.status && res.json) return res.status(400).json(err);
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(err));
      }

      const otpRow = db.getLatestValidOtp(order.buyer_email, 'file_recovery');
      if (!otpRow) {
        const err = { error: 'No active verification code found or code has expired.' };
        if (res.status && res.json) return res.status(400).json(err);
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(err));
      }

      const inputHash = crypto.createHash('sha256').update(cleanCode).digest('hex');
      const match = crypto.timingSafeEqual(Buffer.from(inputHash), Buffer.from(otpRow.code_hash));

      if (!match) {
        db.incrementOtpAttempt(otpRow.id);
        if (otpRow.attempts + 1 >= otpRow.max_attempts) {
          db.consumeOtp(otpRow.id);
          const err = { error: 'Maximum attempts reached. Please request a new code.' };
          if (res.status && res.json) return res.status(400).json(err);
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify(err));
        }
        const err = { error: 'Invalid verification code. Please check and try again.' };
        if (res.status && res.json) return res.status(400).json(err);
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(err));
      }

      db.consumeOtp(otpRow.id);

      const planConfig = SERVER_PLANS[PLAN_ID];
      const { rawToken, tokenRow } = DeliveryService.createDownloadToken(order.id);
      const downloadUrl = planConfig.directAccessUrl || `${env.CLIENT_ORIGIN}/download?token=${rawToken}`;

      db.createAudit({
        action: 'RECOVER_DOWNLOAD_LINK',
        order_reference: order.reference,
        actor: `buyer:${order.buyer_email}`,
        details: { token_id: tokenRow.id },
      });

      const payload = {
        success: true,
        plan: order.plan,
        planName: planConfig.name,
        downloadToken: rawToken,
        downloadUrl,
        directAccessUrl: planConfig.directAccessUrl,
        accessUrls: planConfig.directAccessUrls,
        expiresAt: tokenRow.expires_at,
        maxDownloads: tokenRow.max_downloads,
      };

      if (res.status && res.json) return res.status(200).json(payload);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(payload));
    } catch (err: any) {
      console.error('[Recovery API] Verification error:', err);
      const errPayload = { error: 'Failed to verify recovery code.' };
      if (res.status && res.json) return res.status(500).json(errPayload);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(errPayload));
    }
  }

  const err = { error: 'Endpoint not found' };
  if (res.status && res.json) return res.status(404).json(err);
  res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify(err));
}
