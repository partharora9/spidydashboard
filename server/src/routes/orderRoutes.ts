/**
 * Public Order Routes
 * POST /api/orders                 - Create order (server calculates price & paise offset)
 * POST /api/orders/:ref/utr        - Submit 12-digit UTR payment proof
 * GET  /api/orders/:ref/status     - Poll order status
 * GET  /api/orders/:ref/invoice    - Render clean printable invoice
 */

import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { db } from '../db';
import { SERVER_PLANS, getPlanOrThrow } from '../config/plans';
import { PaiseAllocator } from '../services/paiseAllocator';
import { manualUpiProvider } from '../services/payment/ManualUpiProvider';
import { emailService, EmailTemplates } from '../services/email/EmailProvider';
import { orderCreationLimiter, utrSubmissionLimiter, statusPollingLimiter } from '../middleware/rateLimiter';
import { verifyTurnstileToken } from '../middleware/security';
import { DeliveryService } from '../services/deliveryService';
import { env } from '../config/env';

const router = Router();

// Zod schema for order creation
const createOrderSchema = z.object({
  plan: z.enum(['standard', 'complete']),
  email: z.string().email('Please provide a valid email address for delivery.'),
  name: z.string().max(100).optional(),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms of service and acknowledge the strict no-refund policy to proceed.' }),
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
  turnstileToken: z.string().optional(),
});

/**
 * POST /api/orders
 * Initiates an order. The server is the SOLE authority for plan prices.
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

    const { plan, email, name, consent, marketingOptIn, turnstileToken } = parseResult.data;

    // Verify Turnstile
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '';
    const turnstileValid = await verifyTurnstileToken(turnstileToken, clientIp);
    if (!turnstileValid) {
      return res.status(400).json({ error: 'Security verification (CAPTCHA) failed. Please try again.' });
    }

    // Look up authoritative server plan price (in paise)
    const planConfig = getPlanOrThrow(plan);
    const basePriceCents = planConfig.basePriceCents;

    // Allocate unique paise offset (e.g. 37 paise -> Rs 499.37)
    const paiseOffset = PaiseAllocator.allocatePaiseOffset(plan, basePriceCents);
    const totalAmountCents = basePriceCents + paiseOffset;

    // Generate short human-readable reference: SPIDY-7K3Q9
    const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const reference = `SPIDY-${randomSuffix}`;

    const expiresAt = new Date(Date.now() + env.ORDER_EXPIRY_MINUTES * 60 * 1000).toISOString();

    // Create order record
    const order = db.createOrder({
      reference,
      plan,
      base_amount_cents: basePriceCents,
      paise_offset: paiseOffset,
      total_amount_cents: totalAmountCents,
      currency: 'INR',
      buyer_email: email.toLowerCase().trim(),
      buyer_name: name?.trim() || null,
      consent_given: consent,
      consent_timestamp: new Date().toISOString(),
      privacy_policy_version: 'v1.0',
      marketing_opt_in: marketingOptIn,
      status: 'created',
      expires_at: expiresAt,
      ip_address: clientIp,
      user_agent: req.headers['user-agent'] || null,
    });

    // Generate UPI payment intent and QR code
    const paymentRequest = await manualUpiProvider.createPaymentRequest(order);

    return res.status(201).json({
      orderId: order.id,
      reference: order.reference,
      plan: order.plan,
      planName: planConfig.name,
      baseAmountFormatted: PaiseAllocator.formatAmountINR(basePriceCents),
      exactAmountFormatted: paymentRequest.exactAmountFormatted,
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
 * Buyer submits 12-digit UTR after paying in their UPI app.
 */
router.post('/orders/:reference/utr', utrSubmissionLimiter, async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;
    const parseResult = submitUtrSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Invalid UTR submission',
        details: parseResult.error.format(),
      });
    }

    const { utr, email, turnstileToken } = parseResult.data;

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

    // Process submission via provider
    const result = await manualUpiProvider.submitProof(order, { utr });

    const planConfig = SERVER_PLANS[order.plan];
    const amountFormatted = PaiseAllocator.formatAmountINR(order.total_amount_cents);

    // Send pending confirmation to buyer (access sent directly after manual verification)
    const buyerEmail = EmailTemplates.orderPendingBuyer(order.reference, planConfig.name, amountFormatted);
    await emailService.sendEmail({
      to: order.buyer_email,
      ...buyerEmail,
    });

    // Send alert to admin
    if (env.ADMIN_ALERT_EMAIL) {
      const adminAlert = EmailTemplates.adminNewOrderAlert(
        order.reference,
        planConfig.name,
        amountFormatted,
        utr,
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
      message: 'Payment proof submitted. Parth Arora will verify against bank records and directly dispatch your access link.',
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
  const { reference } = req.params;
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
  const planConfig = SERVER_PLANS[order.plan];

  return res.json({
    reference: order.reference,
    plan: order.plan,
    planName: planConfig.name,
    amountFormatted: PaiseAllocator.formatAmountINR(order.total_amount_cents),
    status: order.status,
    createdAt: order.created_at,
    expiresAt: order.expires_at,
    utrSubmitted: !!payment?.utr,
    utrMasked: payment?.utr ? `${payment.utr.slice(0, 3)}******${payment.utr.slice(9)}` : undefined,
    rejectionReason: order.rejection_reason || undefined,
    accessUrl: order.status === 'approved'
      ? (planConfig.directAccessUrl || undefined)
      : undefined,
  });
});

/**
 * GET /api/orders/:reference/invoice
 * Generates invoice data for the order.
 */
router.get('/orders/:reference/invoice', async (req: Request, res: Response) => {
  const { reference } = req.params;
  const order = db.getOrderByReference(reference);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const purchase = db.getPurchaseByOrderId(order.id);
  const planConfig = SERVER_PLANS[order.plan];

  return res.json({
    invoiceNumber: `INV-${order.reference}`,
    orderReference: order.reference,
    date: order.approved_at || order.created_at,
    buyerName: order.buyer_name || 'Valued Customer',
    buyerEmail: order.buyer_email,
    planName: planConfig.name,
    amountFormatted: PaiseAllocator.formatAmountINR(order.total_amount_cents),
    totalAmountCents: order.total_amount_cents,
    currency: order.currency,
    status: order.status,
    licenseKey: purchase?.license_key || 'Pending Approval',
    merchant: {
      name: env.MERCHANT_NAME,
      brand: 'SpidyDashboard',
      note: 'Source code software distribution (One-time delivery). Check with tax accountant for GST applicability.',
    },
  });
});

export default router;
