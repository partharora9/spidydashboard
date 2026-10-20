/**
 * Vercel Serverless Function: /api/orders/*
 * Handles:
 * - POST /api/orders/:reference/utr
 * - GET  /api/orders/:reference/status
 * - GET  /api/orders/:reference/invoice
 */

import { db } from '../../server/src/db';
import { SERVER_PLANS, PLAN_ID } from '../../server/src/config/plans';
import { manualUpiProvider } from '../../server/src/services/payment/ManualUpiProvider';
import { emailService, EmailTemplates } from '../../server/src/services/email/EmailProvider';
import { env } from '../../server/src/config/env';

export default async function handler(req: any, res: any) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Turnstile-Token');

  if (req.method === 'OPTIONS') {
    return res.status ? res.status(200).end() : res.end();
  }

  // Parse path segments
  const pathParam = req.query?.path;
  const pathSegments: string[] = Array.isArray(pathParam)
    ? pathParam
    : (req.url?.split('/api/orders/')[1] || '').split('?')[0].split('/');

  const reference = pathSegments[0]?.trim();
  const action = pathSegments[1]?.trim().toLowerCase();

  if (!reference) {
    const err = { error: 'Order reference is required' };
    if (res.status && res.json) return res.status(400).json(err);
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(err));
  }

  const order = db.getOrderByReference(reference);
  if (!order) {
    const err = { error: 'Order not found' };
    if (res.status && res.json) return res.status(404).json(err);
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(err));
  }

  const planConfig = SERVER_PLANS[PLAN_ID];

  // 1. Submit UTR Proof (POST /api/orders/:ref/utr)
  if (action === 'utr' && req.method === 'POST') {
    try {
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch {
          body = {};
        }
      }

      const { utr, email, screenshot } = body || {};

      const cleanUtr = String(utr || '').trim();
      if (!/^[0-9]{12}$/.test(cleanUtr)) {
        const err = { error: 'UTR / Transaction ID must be exactly 12 numeric digits.' };
        if (res.status && res.json) return res.status(400).json(err);
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(err));
      }

      if (!email || String(email).toLowerCase().trim() !== order.buyer_email.toLowerCase().trim()) {
        const err = { error: 'Email address does not match order record.' };
        if (res.status && res.json) return res.status(403).json(err);
        res.statusCode = 403;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(err));
      }

      // Check expiry
      if (new Date(order.expires_at) < new Date() && order.status === 'created') {
        db.updateOrderStatus(order.id, 'expired');
        const err = { error: 'This order session has expired. Please initiate a fresh order.' };
        if (res.status && res.json) return res.status(400).json(err);
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(err));
      }

      // Strict duplicate UTR check
      const existing = db.getPaymentByUtr(cleanUtr);
      if (existing && existing.order_id !== order.id) {
        const existingOrder = db.getOrderById(existing.order_id);
        if (existingOrder && existingOrder.status !== 'rejected') {
          const err = {
            error: 'This UPI Transaction ID (UTR) has already been submitted for an order. Duplicate transaction IDs are not allowed.',
          };
          if (res.status && res.json) return res.status(400).json(err);
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify(err));
        }
      }

      await manualUpiProvider.submitProof(order, {
        utr: cleanUtr,
        screenshotData: screenshot,
      });

      const amountFormatted = '₹999';

      // Send pending confirmation to buyer
      try {
        const buyerEmail = EmailTemplates.orderPendingBuyer(order.reference, planConfig.name, amountFormatted);
        await emailService.sendEmail({
          to: order.buyer_email,
          ...buyerEmail,
        });
      } catch (e) {
        console.warn('[Orders API] Buyer pending email warning:', e);
      }

      // Send alert to admin
      if (env.ADMIN_ALERT_EMAIL) {
        try {
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
        } catch (e) {
          console.warn('[Orders API] Admin notification email warning:', e);
        }
      }

      const payload = {
        success: true,
        reference: order.reference,
        status: 'pending_verification',
        message: 'Payment proof submitted. Parth Arora will verify against bank records and directly dispatch your delivery links.',
      };

      if (res.status && res.json) return res.status(200).json(payload);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(payload));
    } catch (err: any) {
      console.error('[Orders API] UTR submission error:', err);
      const errPayload = { error: err.message || 'Failed to submit payment reference.' };
      if (res.status && res.json) return res.status(400).json(errPayload);
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(errPayload));
    }
  }

  // 2. Poll Order Status (GET /api/orders/:ref/status or /api/orders/:ref)
  if (action === 'status' || !action) {
    if (order.status === 'created' && new Date(order.expires_at) < new Date()) {
      db.updateOrderStatus(order.id, 'expired');
      order.status = 'expired';
    }

    const payment = db.getPaymentByOrderId(order.id);

    const payload = {
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
    };

    if (res.status && res.json) return res.status(200).json(payload);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(payload));
  }

  // 3. Invoice View (GET /api/orders/:ref/invoice)
  if (action === 'invoice') {
    const purchase = db.getPurchaseByOrderId(order.id);

    const payload = {
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
    };

    if (res.status && res.json) return res.status(200).json(payload);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(payload));
  }

  const err = { error: 'Unknown action' };
  if (res.status && res.json) return res.status(404).json(err);
  res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify(err));
}
