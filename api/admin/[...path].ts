/**
 * Vercel Serverless Function: /api/admin/*
 * Handles admin operations (login, logout, orders list, approval, rejection)
 */

import { db } from '../../server/src/db';
import { safeCompare } from '../../server/src/middleware/auth';
import { DeliveryService } from '../../server/src/services/deliveryService';
import { emailService, EmailTemplates } from '../../server/src/services/email/EmailProvider';
import { SERVER_PLANS, PLAN_ID } from '../../server/src/config/plans';
import { env } from '../../server/src/config/env';

function checkAuth(req: any): boolean {
  const secretHeader = req.headers['x-admin-token'] || req.headers['authorization']?.replace('Bearer ', '');
  if (secretHeader && safeCompare(secretHeader, env.ADMIN_SECRET)) {
    return true;
  }
  const cookie = req.headers['cookie'] || '';
  if (cookie.includes(`spidy_admin_session=${env.ADMIN_SECRET}`)) {
    return true;
  }
  return false;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Token, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status ? res.status(200).end() : res.end();
  }

  const pathParam = req.query?.path;
  const pathSegments: string[] = Array.isArray(pathParam)
    ? pathParam
    : (req.url?.split('/api/admin/')[1] || '').split('?')[0].split('/');

  const segment0 = pathSegments[0]?.trim().toLowerCase();
  const segment1 = pathSegments[1]?.trim();
  const segment2 = pathSegments[2]?.trim().toLowerCase();

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  // 1. Admin Login (POST /api/admin/login)
  if (segment0 === 'login' && req.method === 'POST') {
    const { secret } = body || {};
    if (!secret || !safeCompare(secret, env.ADMIN_SECRET)) {
      const err = { error: 'Invalid admin secret.' };
      if (res.status && res.json) return res.status(401).json(err);
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(err));
    }

    res.setHeader('Set-Cookie', `spidy_admin_session=${env.ADMIN_SECRET}; Path=/; HttpOnly; SameSite=Strict; Max-Age=28800`);
    const payload = { success: true, message: 'Admin authentication successful.' };
    if (res.status && res.json) return res.status(200).json(payload);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(payload));
  }

  // 2. Admin Logout (POST /api/admin/logout)
  if (segment0 === 'logout') {
    res.setHeader('Set-Cookie', `spidy_admin_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`);
    const payload = { success: true };
    if (res.status && res.json) return res.status(200).json(payload);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(payload));
  }

  // All other endpoints require admin auth
  if (!checkAuth(req)) {
    const err = { error: 'Admin authentication required.' };
    if (res.status && res.json) return res.status(401).json(err);
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(err));
  }

  // 3. Orders List (GET /api/admin/orders)
  if (segment0 === 'orders' && req.method === 'GET' && !segment1) {
    const orders = db.getAllOrders();
    const enriched = orders.map((order) => {
      const payment = db.getPaymentByOrderId(order.id);
      const purchase = db.getPurchaseByOrderId(order.id);
      const planConfig = SERVER_PLANS[PLAN_ID];
      return {
        ...order,
        planName: planConfig.name,
        payment: payment
          ? {
              utr: payment.utr,
              provider: payment.provider,
              isVerified: payment.is_verified,
              submittedAt: payment.utr_submitted_at,
              hasReceipt: Boolean(payment.receipt_key || payment.screenshot_data),
            }
          : null,
        licenseKey: purchase?.license_key || null,
      };
    });
    if (res.status && res.json) return res.status(200).json({ orders: enriched });
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ orders: enriched }));
  }

  // 4. Approve Order (POST /api/admin/orders/:id/approve)
  if (segment0 === 'orders' && segment1 && segment2 === 'approve' && req.method === 'POST') {
    try {
      const order = db.getOrderById(segment1) || db.getOrderByReference(segment1);
      if (!order) {
        const err = { error: 'Order not found' };
        if (res.status && res.json) return res.status(404).json(err);
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(err));
      }
      const result = await DeliveryService.approveOrder(order.id, 'admin');
      if (res.status && res.json) return res.status(200).json(result);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(result));
    } catch (e: any) {
      const err = { error: e.message || 'Approval failed' };
      if (res.status && res.json) return res.status(500).json(err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(err));
    }
  }

  // 5. Reject Order (POST /api/admin/orders/:id/reject)
  if (segment0 === 'orders' && segment1 && segment2 === 'reject' && req.method === 'POST') {
    const order = db.getOrderById(segment1) || db.getOrderByReference(segment1);
    if (!order) {
      const err = { error: 'Order not found' };
      if (res.status && res.json) return res.status(404).json(err);
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(err));
    }
    const reason = String(body?.reason || 'Payment could not be verified in bank statement');
    db.updateOrderStatus(order.id, 'rejected', { rejection_reason: reason });
    try {
      const planConfig = SERVER_PLANS[PLAN_ID];
      const emailContent = EmailTemplates.orderRejectedBuyer(order.reference, planConfig.name, reason);
      await emailService.sendEmail({ to: order.buyer_email, ...emailContent });
    } catch (e) {
      console.warn('[Admin API] Rejection email warning:', e);
    }
    const payload = { success: true, message: 'Order rejected and buyer notified.' };
    if (res.status && res.json) return res.status(200).json(payload);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(payload));
  }

  // 6. Audit logs (GET /api/admin/audit)
  if (segment0 === 'audit' && req.method === 'GET') {
    const logs = db.getAuditLogs(100);
    if (res.status && res.json) return res.status(200).json({ logs });
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ logs }));
  }

  const err = { error: 'Admin endpoint not found' };
  if (res.status && res.json) return res.status(404).json(err);
  res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify(err));
}
