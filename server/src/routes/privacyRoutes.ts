/**
 * Privacy & DPDP Act 2023 Compliance Routes
 * Provides automated Right to Erasure / Data Anonymization with email OTP verification.
 */

import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { db } from '../db';
import { emailService, EmailTemplates } from '../services/email/EmailProvider';
import { otpRequestLimiter } from '../middleware/rateLimiter';
import { env } from '../config/env';

const router = Router();

const deleteRequestSchema = z.object({
  email: z.string().email(),
});

const deleteVerifySchema = z.object({
  email: z.string().email(),
  code: z.string().trim().regex(/^[0-9]{6}$/, 'Code must be 6 digits.'),
});

/**
 * POST /api/privacy/delete-request
 * Sends verification code for data erasure.
 */
router.post('/privacy/delete-request', otpRequestLimiter, async (req: Request, res: Response) => {
  try {
    const parse = deleteRequestSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Please provide a valid email.' });
    }

    const { email } = parse.data;
    const matchingOrders = db.getOrdersByEmail(email);

    // Timing mitigation
    if (matchingOrders.length === 0) {
      return res.json({
        success: true,
        message: 'If records exist for this email, a verification code has been dispatched.',
      });
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

    const emailMsg = EmailTemplates.otpVerificationCode(
      email,
      rawOtp,
      'DPDP Act 2023 Personal Data Erasure Request'
    );
    await emailService.sendEmail({
      to: email,
      ...emailMsg,
    });

    return res.json({
      success: true,
      message: 'Verification code sent to your email.',
    });
  } catch (err) {
    console.error('[Privacy] Delete request error:', err);
    return res.status(500).json({ error: 'Failed to initiate deletion request.' });
  }
});

/**
 * POST /api/privacy/delete-verify
 * Validates OTP and permanently redacts/anonymizes buyer personal data.
 */
router.post('/privacy/delete-verify', async (req: Request, res: Response) => {
  try {
    const parse = deleteVerifySchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Invalid verification input.' });
    }

    const { email, code } = parse.data;
    const otpRow = db.getLatestValidOtp(email, 'privacy_deletion');

    if (!otpRow) {
      return res.status(400).json({ error: 'No active deletion code found or code expired.' });
    }

    const inputHash = crypto.createHash('sha256').update(code).digest('hex');
    const match = crypto.timingSafeEqual(Buffer.from(inputHash), Buffer.from(otpRow.code_hash));

    if (!match) {
      db.incrementOtpAttempt(otpRow.id);
      return res.status(400).json({ error: 'Invalid verification code.' });
    }

    // Consume OTP
    db.consumeOtp(otpRow.id);

    // Anonymize records
    const result = db.anonymizeUserData(email);

    // Log in audit log with anonymized actor
    db.createAudit({
      action: 'DATA_ERASURE_DPDP',
      actor: 'user:verified_otp',
      details: {
        recordsAnonymized: result.ordersAnonymized,
        complianceStandard: 'DPDP Act 2023 / GDPR Right to Erasure',
      },
    });

    return res.json({
      success: true,
      message: `Personal data successfully anonymized across ${result.ordersAnonymized} record(s). Financial accounting hashes retained for tax compliance.`,
    });
  } catch (err) {
    console.error('[Privacy] Delete verify error:', err);
    return res.status(500).json({ error: 'Failed to process data deletion.' });
  }
});

export default router;
