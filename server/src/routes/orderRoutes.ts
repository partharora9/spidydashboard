/**
 * Public Order Routes
 * POST /api/orders                 - Create order (authoritative Rs 999 Student Edition price)
 * POST /api/orders/:ref/utr        - Submit 12-digit UTR payment proof + optional screenshot
 * GET  /api/orders/:ref/status     - Poll order status
 * GET  /api/orders/:ref/invoice    - Render clean printable invoice
 */

import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { db } from '../db';
import { SERVER_PLANS, PLAN_ID, BASE_PRICE_PAISE, getPlanOrThrow } from '../config/plans';
import { PaiseAllocator } from '../services/paiseAllocator';
import { manualUpiProvider } from '../services/payment/ManualUpiProvider';
import { emailService, EmailTemplates } from '../services/email/EmailProvider';
import { orderCreationLimiter, utrSubmissionLimiter, statusPollingLimiter } from '../middleware/rateLimiter';
import { verifyTurnstileToken } from '../middleware/security';
import { env } from '../config/env';

const router = Router();

// Zod schema for order creation
const createOrderSchema = z.object({
  plan: z.string().optional().default(PLAN_ID),
  email: z.string().email('Please provide a valid email address for delivery.'),
  name: z.string().trim().min(2, 'Full name is required.').max(100),
  phone: z
    .string()
    .trim()
    .min(10, 'Phone number must be at least 10 digits.')
    .max(15, 'Phone number cannot exceed 15 digits.'),
  college: z.string().trim().min(2, 'College / University name is required.').max(150),
  consent: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms of service and acknowledge the strict no-refund policy to proceed.',
  }),
  marketingOptIn: z.boolean().optional().default(false),
  turnstileToken: z.string().optional(),
});

// Zod schema for UTR submission
const submitUtrSchema = z.object({
  utr: z
    .string()
    .trim()
    .regex(/^[0-9]{12}$/, 'UTR / Transaction ID must be exactly 12 numeric digits.'),
  email: z.string().email(),
  screenshot: z.string().max(8000000, 'Screenshot image is too large (max 6MB).').optional(),
  turnstileToken: z.string().optional(),
});

/**
 * POST /api/orders
 * Initiates an order. The server is the SOLE authority for plan prices (strictly Rs 999).
 */
router.post('/orders', orderCreationLimiter, async (req: Request, res: Response) => {
  try {
    const parseResult = createOrderSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.format(),
      });
    }

    const { email, name, phone, college, consent, marketingOptIn, turnstileToken } = parseResult.data;

    // Verify Turnstile
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '';
    const turnstileValid = await verifyTurnstileToken(turnstileToken, clientIp);
    if (!turnstileValid) {
      return res.status(400).json({ error: 'Security verification (CAPTCHA) failed. Please try again.' });
    }

    // Authoritative plan configuration: SpidyDashboard, Student Edition (Rs 999)
    const planConfig = getPlanOrThrow(PLAN_ID);
    const basePriceCents = BASE_PRICE_PAISE;
    const paiseOffset = 0; // Exact amount Rs 999
    const totalAmountCents = basePriceCents;

    // Generate short human-readable reference: SPIDY-7K3Q9
    const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const reference = `SPIDY-${randomSuffix}`;

    const expiresAt = new Date(Date.now() + env.ORDER_EXPIRY_MINUTES * 60 * 1000).toISOString();

    // Create order record with phone and college
    const order = db.createOrder({
      reference,
      plan: PLAN_ID,
      base_amount_cents: basePriceCents,
      paise_offset: paiseOffset,
      total_amount_cents: totalAmountCents,
      currency: 'INR',
      buyer_email: email.toLowerCase().trim(),
      buyer_name: name.trim(),
      buyer_phone: phone.trim(),
      buyer_college: college.trim(),
      consent_given: consent,
      consent_timestamp: new Date().toISOString(),
      privacy_policy_version: 'v1.0',
      marketing_opt_in: marketingOptIn,
      status: 'created',
      expires_at: expiresAt,
      ip_address: clientIp,
      user_agent: req.headers['user-agent'] || null,
    });

    // Generate UPI payment intent and QR code with exact amount Rs 999
    const paymentRequest = await manualUpiProvider.createPaymentRequest(order);

    return res.status(201).json({
      orderId: order.id,
      reference: order.reference,
      plan: order.plan,
      planName: planConfig.name,
      baseAmountFormatted: '₹999',
      exactAmountFormatted: '₹999',
      totalAmountCents: order.total_amount_cents,
      currency: order.currency,
      expiresAt: order.expires_at,
      upiUri: paymentRequest.upiUri,
      vpa: paymentRequest.vpa,
      qrCodeDataUrl: paymentRequest.qrCodeDataUrl,
      instructions: paymentRequest.instructions,
    });
  } catch (err: any) {
    console.error('[Orders] Order creation error:', err);
    return res.status(500).json({ error: 'Failed to initiate order. Please try again.' });
  }
});

/**
 * POST /api/orders/:reference/utr
 * Buyer submits 12-digit UTR and optional screenshot after paying via UPI.
 */
router.post('/orders/:reference/utr', utrSubmissionLimiter, async (req: Request, res: Response) => {
  try {
    const rawReference = req.params.reference;
    const reference = Array.isArray(rawReference) ? rawReference[0] : rawReference;
    if (!reference) {
      return res.status(400).json({ error: 'Order reference is required.' });
    }

    const parseResult = submitUtrSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Invalid UTR submission',
        details: parseResult.error.format(),
      });
    }

    const { utr, email, screenshot, turnstileToken } = parseResult.data;

    // Verify CAPTCHA
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '';
    const turnstileValid = await verifyTurnstileToken(turnstileToken, clientIp);
    if (!turnstileValid) {
      return res.status(400).json({ error: 'Security verification failed. Please try again.' });
    }

    const order = db.getOrderByReference(reference);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    // Verify email matches order
    if (order.buyer_email.toLowerCase().trim() !== email.toLowerCase().trim()) {
      return res.status(403).json({ error: 'Email address does not match order record.' });
    }

    // Check expiry
    if (new Date(order.expires_at) < new Date() && order.status === 'created') {
      db.updateOrderStatus(order.id, 'expired');
      return res.status(400).json({
        error: 'This order session has expired. Please initiate a fresh order.',
      });
    }

    // Strict duplicate UTR rejection
    const cleanUtr = utr.trim();
    const existing = db.getPaymentByUtr(cleanUtr);
    if (existing && existing.order_id !== order.id) {
      const existingOrder = db.getOrderById(existing.order_id);
      if (existingOrder && existingOrder.status !== 'rejected') {
        return res.status(400).json({
          error: 'This UPI Transaction ID (UTR) has already been submitted for an order. Duplicate transaction IDs are not allowed.',
        });
      }
    }

    // Process submission via provider including optional screenshot data
    await manualUpiProvider.submitProof(order, {
      utr: cleanUtr,
      screenshotData: screenshot,
      screenshotMimeType: screenshot?.startsWith('data:image/')
        ? screenshot.split(';')[0].replace('data:', '')
        : 'image/jpeg',
    });

    const planConfig = SERVER_PLANS[PLAN_ID];
    const amountFormatted = '₹999';

    // Send pending confirmation to buyer
    const buyerEmail = EmailTemplates.orderPendingBuyer(order.reference, planConfig.name, amountFormatted);
    await emailService.sendEmail({
      to: order.buyer_email,
      ...buyerEmail,
    });

    // Send alert to admin with student details & UTR
    if (env.ADMIN_ALERT_EMAIL) {
      const adminAlert = EmailTemplates.adminNewOrderAlert(
        order.reference,
        planConfig.name,
        amountFormatted,
        cleanUtr,
        order.buyer_email
      );
      await emailService.sendEmail({
        to: env.ADMIN_ALERT_EMAIL,
        ...adminAlert,
      });
    }

    return res.json({
      success: true,
      reference: order.reference,
      status: 'pending_verification',
      message: 'Payment proof submitted. Parth Arora will verify against bank records and directly dispatch your delivery links.',
    });
  } catch (err: any) {
    console.error('[Orders] UTR submission error:', err);
    return res.status(400).json({ error: err.message || 'Failed to submit UTR proof.' });
  }
});

/**
 * GET /api/orders/:reference/status
 * Polls status of an order.
 */
router.get('/orders/:reference/status', statusPollingLimiter, async (req: Request, res: Response) => {
  const rawReference = req.params.reference;
  const reference = Array.isArray(rawReference) ? rawReference[0] : rawReference;
  if (!reference) {
    return res.status(400).json({ error: 'Order reference is required.' });
  }
  const order = db.getOrderByReference(reference);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  // Auto-expire if past expiry and still in 'created' status
  if (order.status === 'created' && new Date(order.expires_at) < new Date()) {
    db.updateOrderStatus(order.id, 'expired');
    order.status = 'expired';
  }

  const payment = db.getPaymentByOrderId(order.id);
  const planConfig = SERVER_PLANS[PLAN_ID];

  return res.json({
    reference: order.reference,
    plan: order.plan,
    planName: planConfig.name,
    amountFormatted: '₹999',
    status: order.status,
    createdAt: order.created_at,
    expiresAt: order.expires_at,
    buyerName: order.buyer_name,
    buyerEmail: order.buyer_email,
    buyerPhone: order.buyer_phone,
    buyerCollege: order.buyer_college,
    utrSubmitted: !!payment?.utr,
    utrMasked: payment?.utr ? `${payment.utr.slice(0, 3)}******${payment.utr.slice(9)}` : undefined,
    rejectionReason: order.rejection_reason || undefined,
    accessUrl: order.status === 'approved' ? planConfig.directAccessUrl || undefined : undefined,
    accessLinks: order.status === 'approved' ? planConfig.directAccessUrls || undefined : undefined,
  });
});

/**
 * GET /api/orders/:reference/invoice
 * Generates invoice data for the order.
 */
router.get('/orders/:reference/invoice', async (req: Request, res: Response) => {
  const rawReference = req.params.reference;
  const reference = Array.isArray(rawReference) ? rawReference[0] : rawReference;
  if (!reference) {
    return res.status(400).json({ error: 'Order reference is required.' });
  }
  const order = db.getOrderByReference(reference);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const purchase = db.getPurchaseByOrderId(order.id);
  const planConfig = SERVER_PLANS[PLAN_ID];

  return res.json({
    invoiceNumber: `INV-${order.reference}`,
    orderReference: order.reference,
    date: order.approved_at || order.created_at,
    buyerName: order.buyer_name || 'Valued Student',
    buyerEmail: order.buyer_email,
    buyerPhone: order.buyer_phone,
    buyerCollege: order.buyer_college,
    planName: planConfig.name,
    amountFormatted: '₹999',
    totalAmountCents: order.total_amount_cents,
    currency: order.currency,
    status: order.status,
    licenseKey: purchase?.license_key || 'Pending Approval',
    merchant: {
      name: env.MERCHANT_NAME,
      brand: 'SpidyDashboard',
      note: 'SpidyDashboard Student Edition software distribution (One-time delivery). Check with tax accountant for GST applicability.',
    },
  });
});

export default router;
