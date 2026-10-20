/**
 * Admin API Routes
 * Protected by requireAdminAuth (constant-time secret verification & IP allowlist)
 */

import { Router, type Request, type Response } from 'express';
import { db } from '../db';
import { requireAdminAuth, safeCompare } from '../middleware/auth';
import { DeliveryService } from '../services/deliveryService';
import { BankStatementReconciler } from '../services/reconciler';
import { emailService, EmailTemplates } from '../services/email/EmailProvider';
import { SERVER_PLANS } from '../config/plans';
import { storage } from '../services/storage/StorageProvider';
import { PaiseAllocator } from '../services/paiseAllocator';
import { env } from '../config/env';

const router = Router();

/**
 * POST /api/admin/login
 * Sets secure, httpOnly, sameSite strict cookie on valid secret.
 */
router.post('/admin/login', (req: Request, res: Response) => {
  const { secret } = req.body;

  if (!secret || !safeCompare(secret, env.ADMIN_SECRET)) {
    return res.status(401).json({ error: 'Invalid admin secret.' });
  }

  // Set secure cookie
  res.cookie('spidy_admin_session', env.ADMIN_SECRET, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 8 * 60 * 60 * 1000, // 8 hours
  });

  return res.json({ success: true, message: 'Admin authentication successful.' });
});

/**
 * POST /api/admin/logout
 */
router.post('/admin/logout', (_req: Request, res: Response) => {
  res.clearCookie('spidy_admin_session');
  return res.json({ success: true });
});

// All routes below require admin authentication
router.use('/admin', requireAdminAuth);

/**
 * GET /api/admin/orders
 * Returns all orders with payment details, sorted chronologically.
 */
router.get('/admin/orders', (req: Request, res: Response) => {
  const statusFilter = req.query.status as string | undefined;
  const search = (req.query.search as string | undefined)?.toLowerCase().trim();

  let orders = db.getAllOrders();

  if (statusFilter && statusFilter !== 'all') {
    orders = orders.filter((o) => o.status === statusFilter);
  }

  if (search) {
    orders = orders.filter(
      (o) =>
        o.reference.toLowerCase().includes(search) ||
        o.buyer_email.toLowerCase().includes(search) ||
        (o.buyer_name && o.buyer_name.toLowerCase().includes(search))
    );
  }

  const enriched = orders.map((order) => {
    const payment = db.getPaymentByOrderId(order.id);
    const purchase = db.getPurchaseByOrderId(order.id);
    const planConfig = SERVER_PLANS[order.plan];
    return {
      ...order,
      formattedAmount: PaiseAllocator.formatAmountINR(order.total_amount_cents),
      payment: payment || null,
      purchase: purchase || null,
      deliveryLinks: planConfig?.directAccessUrls || [],
      primaryDeliveryUrl: planConfig?.directAccessUrl || '',
    };
  });

  return res.json({
    orders: enriched,
    counts: {
      total: db.getAllOrders().length,
      pending: db.getAllOrders().filter((o) => o.status === 'pending_verification').length,
      approved: db.getAllOrders().filter((o) => o.status === 'approved').length,
      created: db.getAllOrders().filter((o) => o.status === 'created').length,
      rejected: db.getAllOrders().filter((o) => o.status === 'rejected').length,
    },
    planDeliveryLinks: {
      standard: {
        planId: 'standard',
        name: SERVER_PLANS.standard?.name || 'Standard Plan',
        primaryUrl: SERVER_PLANS.standard?.directAccessUrl || '',
        links: SERVER_PLANS.standard?.directAccessUrls || [],
      },
      complete: {
        planId: 'complete',
        name: SERVER_PLANS.complete?.name || 'Complete Kit',
        primaryUrl: SERVER_PLANS.complete?.directAccessUrl || '',
        links: SERVER_PLANS.complete?.directAccessUrls || [],
      },
    },
  });
});

/**
 * POST /api/admin/orders/:id/approve
 * Human-click approval. Idempotently triggers delivery flow.
 */
router.post('/admin/orders/:id/approve', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const actor = (req as any).adminUser?.role || 'admin';
    const result = await DeliveryService.approveOrder(id, actor);
    return res.json(result);
  } catch (err: any) {
    console.error('[Admin] Approval error:', err);
    return res.status(400).json({ error: err.message || 'Failed to approve order.' });
  }
});

/**
 * POST /api/admin/orders/:id/reject
 */
router.post('/admin/orders/:id/reject', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const actor = (req as any).adminUser?.role || 'admin';

    if (!reason || typeof reason !== 'string') {
      return res.status(400).json({ error: 'A specific rejection reason is required.' });
    }

    const updated = await DeliveryService.rejectOrder(id, reason, actor);
    return res.json({ success: true, order: updated });
  } catch (err: any) {
    console.error('[Admin] Rejection error:', err);
    return res.status(400).json({ error: err.message || 'Failed to reject order.' });
  }
});

/**
 * POST /api/admin/orders/:id/revoke
 * Revokes active download links for an order.
 */
router.post('/admin/orders/:id/revoke', (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason = 'Revoked by administrator' } = req.body;

  db.revokeDownloadTokensForOrder(id, reason);
  db.createAudit({
    action: 'REVOKE_DOWNLOAD_TOKENS',
    actor: 'admin',
    details: { order_id: id, reason },
  });

  return res.json({ success: true, message: 'All active download tokens revoked.' });
});

/**
 * POST /api/admin/orders/:id/resend-email
 */
router.post('/admin/orders/:id/resend-email', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = db.getOrderById(id);

    if (!order || order.status !== 'approved') {
      return res.status(400).json({ error: 'Order must be in approved status to resend delivery email.' });
    }

    const planConfig = SERVER_PLANS[order.plan];
    const { rawToken } = DeliveryService.createDownloadToken(order.id);
    const downloadUrl = planConfig.directAccessUrl || `${env.CLIENT_ORIGIN}/download?token=${rawToken}`;
    const checksum = await storage.getFileChecksum(planConfig.releaseFileName);

    const emailMsg = EmailTemplates.orderApprovedDelivery(
      order.reference,
      planConfig.name,
      downloadUrl,
      checksum,
      env.DOWNLOAD_TOKEN_EXPIRY_MINUTES,
      planConfig.directAccessUrls
    );
    await emailService.sendEmail({
      to: order.buyer_email,
      ...emailMsg,
    });

    db.createAudit({
      action: 'RESEND_DELIVERY_EMAIL',
      order_reference: order.reference,
      actor: 'admin',
      details: { sent_to: order.buyer_email },
    });

    return res.json({ success: true, message: 'Delivery email resent successfully with fresh token.' });
  } catch {
    return res.status(500).json({ error: 'Failed to resend email.' });
  }
});

/**
 * POST /api/admin/reconcile
 * Parses pasted statement lines or CSV, returns auto-suggested matches.
 */
router.post('/admin/reconcile', (req: Request, res: Response) => {
  const { statementText } = req.body;

  if (!statementText || typeof statementText !== 'string') {
    return res.status(400).json({ error: 'Please provide bank statement text or CSV rows.' });
  }

  const matches = BankStatementReconciler.reconcile(statementText);

  db.createAudit({
    action: 'RUN_RECONCILIATION_SCAN',
    actor: 'admin',
    details: {
      candidateMatchesFound: matches.length,
    },
  });

  return res.json({
    matches,
    totalMatches: matches.length,
  });
});

/**
 * GET /api/admin/export
 * Exports orders and purchases as CSV for accounting.
 */
router.get('/admin/export', (_req: Request, res: Response) => {
  const orders = db.getAllOrders();

  const headers = [
    'Reference',
    'Plan',
    'Amount_INR',
    'Status',
    'Buyer_Email',
    'Buyer_Name',
    'Created_At',
    'Approved_At',
    'UTR',
    'License_Key',
  ];

  const rows = orders.map((o) => {
    const payment = db.getPaymentByOrderId(o.id);
    const purchase = db.getPurchaseByOrderId(o.id);
    return [
      o.reference,
      o.plan,
      (o.total_amount_cents / 100).toFixed(2),
      o.status,
      `"${o.buyer_email}"`,
      `"${o.buyer_name || ''}"`,
      o.created_at,
      o.approved_at || '',
      payment?.utr || '',
      purchase?.license_key || '',
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="spidydashboard-orders-${Date.now()}.csv"`);
  return res.send(csvContent);
});

/**
 * GET /api/admin/audit
 */
router.get('/admin/audit', (req: Request, res: Response) => {
  const limit = Math.min(parseInt((req.query.limit as string) || '100', 10), 500);
  const logs = db.getAuditLogs(limit);
  return res.json({ auditLogs: logs });
});

export default router;
