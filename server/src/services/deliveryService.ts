/**
 * Delivery Service
 * Manages order approval, license issuance, cryptographic download tokens,
 * and per-buyer license generation.
 * IDEMPOTENT: Approving an already-approved order is safe and does not double-deliver.
 */

import crypto from 'crypto';
import { db, type OrderRow, type PurchaseRow, type DownloadTokenRow } from '../db';
import { SERVER_PLANS } from '../config/plans';
import { storage } from './storage/StorageProvider';
import { emailService, EmailTemplates } from './email/EmailProvider';
import { env } from '../config/env';

export interface ApprovalResult {
  success: boolean;
  order: OrderRow;
  purchase: PurchaseRow;
  downloadToken: string; // Raw 256-bit token (returned only once during generation)
  downloadUrl: string;
  checksum: string;
  message: string;
}

export class DeliveryService {
  /**
   * Generates a 256-bit cryptographically secure token and stores its SHA-256 hash.
   */
  static createDownloadToken(orderId: string): { rawToken: string; tokenRow: DownloadTokenRow } {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const expiresAt = new Date(Date.now() + env.DOWNLOAD_TOKEN_EXPIRY_MINUTES * 60 * 1000).toISOString();

    const tokenRow = db.createDownloadToken({
      order_id: orderId,
      token_hash: tokenHash,
      max_downloads: env.MAX_DOWNLOADS_PER_TOKEN,
      expires_at: expiresAt,
    });

    return { rawToken, tokenRow };
  }

  /**
   * Generates formatted text for LICENSE-BUYER.txt embedded for this order.
   */
  static generateBuyerLicenseText(order: OrderRow, licenseKey: string): string {
    const planConfig = SERVER_PLANS[order.plan];
    return `================================================================================
SPIDYDASHBOARD END USER SOFTWARE LICENSE (PERSONAL & EDUCATIONAL USE)
================================================================================

ORDER REFERENCE:   ${order.reference}
LICENSE KEY:       ${licenseKey}
LICENSEE EMAIL:    ${order.buyer_email}
NAME:              ${order.buyer_name || 'Authorized Buyer'}
PRODUCT:           ${planConfig.name}
PURCHASE DATE:     ${new Date().toUTCString()}
CREATOR & AUTHOR:  Parth Arora (SOC Analyst)

1. GRANT OF LICENSE:
Subject to the terms of this Agreement, the author grants you a non-exclusive,
non-transferable license to inspect, execute, modify, and run the SpidyDashboard
source code solely for personal, research, and educational purposes.

2. RESTRICTIONS:
- NO REDISTRIBUTION: You may not sell, rent, lease, sub-license, host publicly,
  or redistribute the source code or derivatives thereof in whole or in part.
- AUTHORIZED SCANNING ONLY: You agree to execute reconnaissance and intelligence
  scans only against domains, systems, and assets you own or have explicit,
  written authorization to test.

3. OPEN SOURCE ATTRIBUTION:
This software is built upon and incorporates components of the SpiderFoot OSINT
engine, licensed under the MIT License:
Copyright (c) SpiderFoot Contributors (MIT License).

4. WARRANTY DISCLAIMER:
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM OR DAMAGES.

================================================================================
Verification Hash: ${crypto.createHash('sha256').update(order.reference + licenseKey).digest('hex')}
================================================================================
`;
  }

  /**
   * Approves an order idempotently, issues a license, creates download tokens,
   * and sends the delivery email.
   */
  static async approveOrder(orderId: string, actor: string = 'admin'): Promise<ApprovalResult> {
    const order = db.getOrderById(orderId);
    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }

    const planConfig = SERVER_PLANS[order.plan];
    const releaseFileName = planConfig.releaseFileName;

    // Check idempotency: if already approved, return existing purchase and issue a fresh download token
    let purchase = db.getPurchaseByOrderId(order.id);

    if (order.status === 'approved' && purchase) {
      console.log(`[Delivery] Order ${order.reference} is already approved. Issuing fresh download link.`);
      const { rawToken } = this.createDownloadToken(order.id);
      const downloadUrl = planConfig.directAccessUrl || `${env.CLIENT_ORIGIN}/download?token=${rawToken}`;
      const checksum = await storage.getFileChecksum(releaseFileName);

      return {
        success: true,
        order,
        purchase,
        downloadToken: rawToken,
        downloadUrl,
        checksum,
        message: 'Order was already approved. A fresh download link has been created.',
      };
    }

    // Generate unique license key
    const licPart1 = crypto.randomBytes(3).toString('hex').toUpperCase();
    const licPart2 = crypto.randomBytes(3).toString('hex').toUpperCase();
    const licPart3 = crypto.randomBytes(3).toString('hex').toUpperCase();
    const licenseKey = `SPIDY-${order.plan.toUpperCase()}-${licPart1}-${licPart2}-${licPart3}`;

    // Create purchase record
    purchase = db.createPurchase({
      order_id: order.id,
      order_reference: order.reference,
      plan: order.plan,
      buyer_email: order.buyer_email,
      buyer_name: order.buyer_name,
      amount_paid_cents: order.total_amount_cents,
      currency: order.currency,
      license_key: licenseKey,
    });

    // Mark order approved
    const updatedOrder = db.updateOrderStatus(order.id, 'approved', { approved_by: actor });

    // Mark payment verified
    const payment = db.getPaymentByOrderId(order.id);
    if (payment) {
      payment.is_verified = true;
      payment.verified_at = new Date().toISOString();
      payment.verified_by = actor;
    }

    // Generate download token
    const { rawToken } = this.createDownloadToken(order.id);
    const downloadUrl = planConfig.directAccessUrl || `${env.CLIENT_ORIGIN}/download?token=${rawToken}`;
    const checksum = await storage.getFileChecksum(releaseFileName);

    // Audit log
    db.createAudit({
      action: 'APPROVE_ORDER',
      order_reference: order.reference,
      actor,
      details: {
        order_id: order.id,
        plan: order.plan,
        amount_cents: order.total_amount_cents,
        buyer_email: `${order.buyer_email.slice(0, 3)}***@***`, // Masked in audit
        license_key: licenseKey,
      },
    });

    // Send transactional delivery email
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

    return {
      success: true,
      order: updatedOrder || order,
      purchase,
      downloadToken: rawToken,
      downloadUrl,
      checksum,
      message: 'Order approved successfully and delivery email dispatched.',
    };
  }

  /**
   * Rejects an order with a specific reason.
   */
  static async rejectOrder(orderId: string, reason: string, actor: string = 'admin'): Promise<OrderRow> {
    const order = db.getOrderById(orderId);
    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }

    const updated = db.updateOrderStatus(order.id, 'rejected', { rejection_reason: reason });

    // Revoke any pending tokens
    db.revokeDownloadTokensForOrder(order.id, `Order rejected by ${actor}: ${reason}`);

    db.createAudit({
      action: 'REJECT_ORDER',
      order_reference: order.reference,
      actor,
      details: { reason },
    });

    // Send rejection email
    const emailMsg = EmailTemplates.orderRejected(order.reference, reason);
    await emailService.sendEmail({
      to: order.buyer_email,
      ...emailMsg,
    });

    return updated || order;
  }
}
