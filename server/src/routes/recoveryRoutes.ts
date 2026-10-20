/**
 * Returning Buyer Recovery Routes ("Get My Files")
 * Allows past buyers to request a fresh 15-minute download link after email OTP verification.
 */

import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { db } from '../db';
import { DeliveryService } from '../services/deliveryService';
import { emailService, EmailTemplates } from '../services/email/EmailProvider';
import { otpRequestLimiter } from '../middleware/rateLimiter';
import { env } from '../config/env';

const router = Router();

const requestOtpSchema = z.object({
  reference: z.string().trim().toUpperCase(),
  email: z.string().email(),
});

const verifyOtpSchema = z.object({
  reference: z.string().trim().toUpperCase(),
  email: z.string().email(),
  code: z.string().trim().regex(/^[0-9]{6}$/, 'Code must be 6 digits.'),
});

/**
 * POST /api/recovery/request
 * Generates and emails a 6-digit verification code.
 */
router.post('/recovery/request', otpRequestLimiter, async (req: Request, res: Response) => {
  try {
    const parse = requestOtpSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Please provide valid order reference and email.' });
    }

    const { reference, email } = parse.data;
    const order = db.getOrderByReference(reference);

    // Timing-attack mitigation: do not reveal if order doesn't exist
    if (!order || order.buyer_email.toLowerCase().trim() !== email.toLowerCase().trim()) {
      return res.json({
        success: true,
        message: 'If the reference and email match an approved purchase, a 6-digit code has been sent.',
      });
    }

    if (order.status !== 'approved') {
      return res.status(400).json({
        error: `Order status is currently '${order.status}'. Recovery is only available for approved orders.`,
      });
    }

    // Generate 6-digit numeric OTP
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

    // Send code
    const emailMsg = EmailTemplates.otpVerificationCode(order.buyer_email, rawOtp, 'SpidyDashboard File Recovery');
    await emailService.sendEmail({
      to: order.buyer_email,
      ...emailMsg,
    });

    return res.json({
      success: true,
      message: 'Verification code sent to your email address.',
    });
  } catch (err) {
    console.error('[Recovery] OTP request error:', err);
    return res.status(500).json({ error: 'Failed to send recovery code.' });
  }
});

/**
 * POST /api/recovery/verify
 * Validates OTP and returns a fresh 15-minute download token.
 */
router.post('/recovery/verify', async (req: Request, res: Response) => {
  try {
    const parse = verifyOtpSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Invalid verification input.' });
    }

    const { reference, email, code } = parse.data;
    const order = db.getOrderByReference(reference);

    if (!order || order.buyer_email.toLowerCase().trim() !== email.toLowerCase().trim()) {
      return res.status(400).json({ error: 'Order reference and email combination does not match.' });
    }

    const otpRow = db.getLatestValidOtp(order.buyer_email, 'file_recovery');
    if (!otpRow) {
      return res.status(400).json({ error: 'No active verification code found or code has expired.' });
    }

    const inputHash = crypto.createHash('sha256').update(code).digest('hex');

    // Constant-time compare
    const match = crypto.timingSafeEqual(Buffer.from(inputHash), Buffer.from(otpRow.code_hash));

    if (!match) {
      db.incrementOtpAttempt(otpRow.id);
      if (otpRow.attempts + 1 >= otpRow.max_attempts) {
        db.consumeOtp(otpRow.id);
        return res.status(400).json({ error: 'Maximum attempts reached. Please request a new code.' });
      }
      return res.status(400).json({ error: 'Invalid verification code. Please check and try again.' });
    }

    // Code verified: consume it
    db.consumeOtp(otpRow.id);

    // Issue fresh download token
    const { rawToken, tokenRow } = DeliveryService.createDownloadToken(order.id);
    const downloadUrl = `${env.CLIENT_ORIGIN}/download?token=${rawToken}`;

    db.createAudit({
      action: 'RECOVER_DOWNLOAD_LINK',
      order_reference: order.reference,
      actor: `buyer:${order.buyer_email}`,
      details: {
        token_id: tokenRow.id,
      },
    });

    return res.json({
      success: true,
      downloadToken: rawToken,
      downloadUrl,
      expiresAt: tokenRow.expires_at,
      maxDownloads: tokenRow.max_downloads,
    });
  } catch (err) {
    console.error('[Recovery] Verification error:', err);
    return res.status(500).json({ error: 'Failed to verify recovery code.' });
  }
});

export default router;
