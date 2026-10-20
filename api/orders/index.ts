/**
 * Vercel Serverless Function: POST /api/orders
 * Authoritative creation of SpidyDashboard Student Edition (Rs 999) orders
 */

import crypto from 'crypto';
import { db } from '../../server/src/db';
import { PLAN_ID, BASE_PRICE_PAISE, getPlanOrThrow } from '../../server/src/config/plans';
import { manualUpiProvider } from '../../server/src/services/payment/ManualUpiProvider';
import { env } from '../../server/src/config/env';

export default async function handler(req: any, res: any) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Turnstile-Token');

  if (req.method === 'OPTIONS') {
    return res.status ? res.status(200).end() : res.end();
  }

  if (req.method !== 'POST') {
    const err = { error: 'Method not allowed' };
    if (res.status && res.json) return res.status(405).json(err);
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(err));
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }

    const { email, name, phone, college, consent, marketingOptIn } = body || {};

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      const err = { error: 'Please provide a valid delivery email address.' };
      if (res.status && res.json) return res.status(400).json(err);
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(err));
    }
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      const err = { error: 'Please enter your full name.' };
      if (res.status && res.json) return res.status(400).json(err);
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(err));
    }
    if (!phone || typeof phone !== 'string' || phone.trim().length < 10) {
      const err = { error: 'Please enter a valid 10-digit mobile number.' };
      if (res.status && res.json) return res.status(400).json(err);
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(err));
    }
    if (!college || typeof college !== 'string' || college.trim().length < 2) {
      const err = { error: 'Please enter your college or university name.' };
      if (res.status && res.json) return res.status(400).json(err);
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(err));
    }
    if (!consent) {
      const err = { error: 'You must accept the terms of service and acknowledge the strict no-refund policy to proceed.' };
      if (res.status && res.json) return res.status(400).json(err);
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(err));
    }

    const planConfig = getPlanOrThrow(PLAN_ID);
    const basePriceCents = BASE_PRICE_PAISE;
    const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const reference = `SPIDY-${randomSuffix}`;
    const expiresAt = new Date(Date.now() + env.ORDER_EXPIRY_MINUTES * 60 * 1000).toISOString();

    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket?.remoteAddress || '';

    const order = db.createOrder({
      reference,
      plan: PLAN_ID,
      base_amount_cents: basePriceCents,
      paise_offset: 0,
      total_amount_cents: basePriceCents,
      currency: 'INR',
      buyer_email: email.toLowerCase().trim(),
      buyer_name: name.trim(),
      buyer_phone: phone.trim(),
      buyer_college: college.trim(),
      consent_given: true,
      consent_timestamp: new Date().toISOString(),
      privacy_policy_version: 'v1.0',
      marketing_opt_in: Boolean(marketingOptIn),
      status: 'created',
      expires_at: expiresAt,
      ip_address: clientIp,
      user_agent: req.headers['user-agent'] || null,
    });

    const paymentRequest = await manualUpiProvider.createPaymentRequest(order);

    const payload = {
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
    };

    if (res.status && res.json) return res.status(201).json(payload);
    res.statusCode = 201;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(payload));
  } catch (err: any) {
    console.error('[Orders API] Order creation error:', err);
    const errPayload = { error: 'Failed to initiate order. Please try again.' };
    if (res.status && res.json) return res.status(500).json(errPayload);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(errPayload));
  }
}
