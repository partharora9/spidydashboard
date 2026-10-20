/**
 * Vercel Serverless Function: /api/privacy/*
 * Handles:
 * - POST /api/privacy/delete-request
 * - POST /api/privacy/delete-verify
 */

import crypto from 'crypto';
import { db } from '../../server/src/db';
import { emailService, EmailTemplates } from '../../server/src/services/email/EmailProvider';
import { env } from '../../server/src/config/env';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status ? res.status(200).end() : res.end();
  }

  const pathParam = req.query?.path;
  const pathSegments: string[] = Array.isArray(pathParam)
    ? pathParam
    : (req.url?.split('/api/privacy/')[1] || '').split('?')[0].split('/');

  const action = pathSegments[0]?.trim().toLowerCase();

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  // 1. Delete Request
  if (action === 'delete-request' && req.method === 'POST') {
    try {
      const email = String(body?.email || '').trim().toLowerCase();
      if (!email.includes('@')) {
        const err = { error: 'Please provide a valid email.' };
        if (res.status && res.json) return res.status(400).json(err);
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(err));
      }

      const matchingOrders = db.getOrdersByEmail(email);
      if (matchingOrders.length === 0) {
        const payload = {
          success: true,
          message: 'If records exist for this email, a verification code has been dispatched.',
        };
        if (res.status && res.json) return res.status(200).json(payload);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(payload));
      }

      const rawOtp = crypto.randomInt(100000, 999999).toString();
      const codeHash = crypto.createHash('sha256').update(rawOtp).digest('hex');
      const expiresAt = new Date(Date.now() + env.OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();

      db.createOtp({
        target_email: email,
        purpose: 'privacy_deletion',
        code_hash: codeHash,
        expires_at: expiresAt,
      });

      try {
        const emailMsg = EmailTemplates.otpVerificationCode(
          email,
          rawOtp,
          'DPDP Act 2023 Personal Data Erasure Request'
        );
        await emailService.sendEmail({
          to: email,
          ...emailMsg,
        });
      } catch (e) {
        console.warn('[Privacy API] Email send warning:', e);
      }

      const payload = { success: true, message: 'Verification code sent to your email.' };
      if (res.status && res.json) return res.status(200).json(payload);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(payload));
    } catch (err: any) {
      console.error('[Privacy API] Delete request error:', err);
      const errPayload = { error: 'Failed to initiate deletion request.' };
      if (res.status && res.json) return res.status(500).json(errPayload);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(errPayload));
    }
  }

  // 2. Delete Verify
  if (action === 'delete-verify' && req.method === 'POST') {
    try {
      const email = String(body?.email || '').trim().toLowerCase();
      const code = String(body?.code || '').trim();

      if (!email.includes('@') || !/^[0-9]{6}$/.test(code)) {
        const err = { error: 'Invalid verification input.' };
        if (res.status && res.json) return res.status(400).json(err);
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(err));
      }

      const otpRow = db.getLatestValidOtp(email, 'privacy_deletion');
      if (!otpRow) {
        const err = { error: 'No active deletion code found or code expired.' };
        if (res.status && res.json) return res.status(400).json(err);
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(err));
      }

      const inputHash = crypto.createHash('sha256').update(code).digest('hex');
      const match = crypto.timingSafeEqual(Buffer.from(inputHash), Buffer.from(otpRow.code_hash));

      if (!match) {
        db.incrementOtpAttempt(otpRow.id);
        const err = { error: 'Invalid verification code.' };
        if (res.status && res.json) return res.status(400).json(err);
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(err));
      }

      db.consumeOtp(otpRow.id);
      const result = db.anonymizeUserData(email);

      db.createAudit({
        action: 'DATA_ERASURE_DPDP',
        actor: 'user:verified_otp',
        details: {
          recordsAnonymized: result.ordersAnonymized,
          complianceStandard: 'DPDP Act 2023 / GDPR Right to Erasure',
        },
      });

      const payload = {
        success: true,
        message: `Personal data successfully anonymized across ${result.ordersAnonymized} record(s). Financial accounting hashes retained for tax compliance.`,
      };
      if (res.status && res.json) return res.status(200).json(payload);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(payload));
    } catch (err: any) {
      console.error('[Privacy API] Delete verify error:', err);
      const errPayload = { error: 'Failed to process data deletion.' };
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
