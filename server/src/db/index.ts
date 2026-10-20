import crypto from 'crypto';

const uuidv4 = () => crypto.randomUUID();

export interface OrderRow {
  id: string;
  reference: string;
  plan: 'student_edition' | string;
  base_amount_cents: number;
  paise_offset: number;
  total_amount_cents: number;
  currency: string;
  buyer_email: string;
  buyer_name?: string | null;
  buyer_phone?: string | null;
  buyer_college?: string | null;
  consent_given: boolean;
  consent_timestamp: string;
  privacy_policy_version: string;
  marketing_opt_in: boolean;
  status: 'created' | 'pending_verification' | 'approved' | 'rejected' | 'expired' | 'refunded';
  rejection_reason?: string | null;
  created_at: string;
  expires_at: string;
  approved_at?: string | null;
  approved_by?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
}

export interface PaymentRow {
  id: string;
  order_id: string;
  provider: string;
  utr?: string | null;
  utr_submitted_at?: string | null;
  receipt_key?: string | null;
  receipt_mime_type?: string | null;
  screenshot_data?: string | null;
  is_verified: boolean;
  verified_at?: string | null;
  verified_by?: string | null;
}

export interface PurchaseRow {
  id: string;
  order_id: string;
  order_reference: string;
  plan: string;
  buyer_email: string;
  buyer_name?: string | null;
  amount_paid_cents: number;
  currency: string;
  license_key: string;
  created_at: string;
}

export interface DownloadTokenRow {
  id: string;
  order_id: string;
  token_hash: string;
  max_downloads: number;
  download_count: number;
  created_at: string;
  expires_at: string;
  revoked: boolean;
  revoked_reason?: string | null;
  last_downloaded_at?: string | null;
  last_download_ip?: string | null;
}

export interface OtpCodeRow {
  id: string;
  target_email: string;
  order_reference?: string | null;
  purpose: 'file_recovery' | 'privacy_deletion' | 'admin_2fa';
  code_hash: string;
  attempts: number;
  max_attempts: number;
  created_at: string;
  expires_at: string;
  consumed: boolean;
}

export interface AdminAuditRow {
  id: string;
  action: string;
  order_reference?: string | null;
  actor: string;
  ip_address?: string | null;
  details: Record<string, unknown>;
  timestamp: string;
}

class InMemoryDatabase {
  orders: Map<string, OrderRow> = new Map();
  payments: Map<string, PaymentRow> = new Map();
  purchases: Map<string, PurchaseRow> = new Map();
  downloadTokens: Map<string, DownloadTokenRow> = new Map();
  otpCodes: Map<string, OtpCodeRow> = new Map();
  adminAudits: AdminAuditRow[] = [];

  // Orders
  createOrder(data: Omit<OrderRow, 'id' | 'created_at'>): OrderRow {
    const id = uuidv4();
    const created_at = new Date().toISOString();
    const order: OrderRow = { ...data, id, created_at };
    this.orders.set(id, order);
    return order;
  }

  getOrderById(id: string): OrderRow | null {
    return this.orders.get(id) || null;
  }

  getOrderByReference(reference: string): OrderRow | null {
    for (const order of this.orders.values()) {
      if (order.reference.toUpperCase() === reference.toUpperCase()) {
        return order;
      }
    }
    return null;
  }

  getOrdersByEmail(email: string): OrderRow[] {
    const norm = email.toLowerCase().trim();
    return Array.from(this.orders.values()).filter((o) => o.buyer_email.toLowerCase().trim() === norm);
  }

  getOpenOrders(): OrderRow[] {
    const now = new Date();
    return Array.from(this.orders.values()).filter(
      (o) => (o.status === 'created' || o.status === 'pending_verification') && new Date(o.expires_at) > now
    );
  }

  getAllOrders(): OrderRow[] {
    return Array.from(this.orders.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  updateOrderStatus(
    orderId: string,
    status: OrderRow['status'],
    extras?: { approved_by?: string; rejection_reason?: string }
  ): OrderRow | null {
    const order = this.orders.get(orderId);
    if (!order) return null;
    order.status = status;
    if (status === 'approved') {
      order.approved_at = new Date().toISOString();
      order.approved_by = extras?.approved_by || 'admin';
    }
    if (status === 'rejected') {
      order.rejection_reason = extras?.rejection_reason || 'Rejected by administrator';
    }
    this.orders.set(orderId, order);
    return order;
  }

  // Payments
  createPayment(data: Omit<PaymentRow, 'id'>): PaymentRow {
    const id = uuidv4();
    const payment: PaymentRow = { ...data, id };
    this.payments.set(id, payment);
    return payment;
  }

  getPaymentByOrderId(orderId: string): PaymentRow | null {
    for (const payment of this.payments.values()) {
      if (payment.order_id === orderId) {
        return payment;
      }
    }
    return null;
  }

  getPaymentByUtr(utr: string): PaymentRow | null {
    const cleanUtr = utr.trim();
    for (const payment of this.payments.values()) {
      if (payment.utr && payment.utr.trim() === cleanUtr) {
        return payment;
      }
    }
    return null;
  }

  updatePaymentUtr(orderId: string, utr: string, receiptKey?: string, mimeType?: string, screenshotData?: string): PaymentRow {
    let payment = this.getPaymentByOrderId(orderId);
    if (!payment) {
      payment = this.createPayment({
        order_id: orderId,
        provider: 'manual_upi',
        utr,
        utr_submitted_at: new Date().toISOString(),
        receipt_key: receiptKey,
        receipt_mime_type: mimeType,
        screenshot_data: screenshotData || null,
        is_verified: false,
      });
    } else {
      payment.utr = utr;
      payment.utr_submitted_at = new Date().toISOString();
      if (receiptKey) payment.receipt_key = receiptKey;
      if (mimeType) payment.receipt_mime_type = mimeType;
      if (screenshotData) payment.screenshot_data = screenshotData;
      this.payments.set(payment.id, payment);
    }
    return payment;
  }

  // Purchases
  createPurchase(data: Omit<PurchaseRow, 'id' | 'created_at'>): PurchaseRow {
    const id = uuidv4();
    const created_at = new Date().toISOString();
    const purchase: PurchaseRow = { ...data, id, created_at };
    this.purchases.set(id, purchase);
    return purchase;
  }

  getPurchaseByOrderId(orderId: string): PurchaseRow | null {
    for (const p of this.purchases.values()) {
      if (p.order_id === orderId) return p;
    }
    return null;
  }

  // Download Tokens
  createDownloadToken(data: Omit<DownloadTokenRow, 'id' | 'created_at' | 'download_count' | 'revoked'>): DownloadTokenRow {
    const id = uuidv4();
    const created_at = new Date().toISOString();
    const token: DownloadTokenRow = {
      ...data,
      id,
      download_count: 0,
      revoked: false,
      created_at,
    };
    this.downloadTokens.set(id, token);
    return token;
  }

  getDownloadTokenByHash(tokenHash: string): DownloadTokenRow | null {
    for (const t of this.downloadTokens.values()) {
      if (t.token_hash === tokenHash) return t;
    }
    return null;
  }

  incrementDownloadCount(tokenId: string, ipAddress?: string): DownloadTokenRow | null {
    const token = this.downloadTokens.get(tokenId);
    if (!token) return null;
    token.download_count += 1;
    token.last_downloaded_at = new Date().toISOString();
    if (ipAddress) token.last_download_ip = ipAddress;
    this.downloadTokens.set(tokenId, token);
    return token;
  }

  revokeDownloadTokensForOrder(orderId: string, reason: string): void {
    for (const t of this.downloadTokens.values()) {
      if (t.order_id === orderId) {
        t.revoked = true;
        t.revoked_reason = reason;
        this.downloadTokens.set(t.id, t);
      }
    }
  }

  // OTP Codes
  createOtp(data: Omit<OtpCodeRow, 'id' | 'created_at' | 'attempts' | 'consumed' | 'max_attempts'> & { max_attempts?: number }): OtpCodeRow {
    const id = uuidv4();
    const created_at = new Date().toISOString();
    const row: OtpCodeRow = {
      max_attempts: data.max_attempts ?? 5,
      ...data,
      id,
      attempts: 0,
      consumed: false,
      created_at,
    };
    this.otpCodes.set(id, row);
    return row;
  }

  getLatestValidOtp(targetEmail: string, purpose: OtpCodeRow['purpose']): OtpCodeRow | null {
    const now = new Date();
    const matches: OtpCodeRow[] = [];
    for (const o of this.otpCodes.values()) {
      if (
        o.target_email.toLowerCase() === targetEmail.toLowerCase() &&
        o.purpose === purpose &&
        !o.consumed &&
        new Date(o.expires_at) > now
      ) {
        matches.push(o);
      }
    }
    matches.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return matches[0] || null;
  }

  consumeOtp(id: string): void {
    const row = this.otpCodes.get(id);
    if (row) {
      row.consumed = true;
      this.otpCodes.set(id, row);
    }
  }

  incrementOtpAttempt(id: string): void {
    const row = this.otpCodes.get(id);
    if (row) {
      row.attempts += 1;
      this.otpCodes.set(id, row);
    }
  }

  // Admin Audit
  createAudit(data: Omit<AdminAuditRow, 'id' | 'timestamp'>): AdminAuditRow {
    const id = uuidv4();
    const timestamp = new Date().toISOString();
    const audit: AdminAuditRow = { ...data, id, timestamp };
    this.adminAudits.unshift(audit); // Most recent first
    return audit;
  }

  getAuditLogs(limit = 100): AdminAuditRow[] {
    return this.adminAudits.slice(0, limit);
  }

  // GDPR Anonymization
  anonymizeUserData(email: string): { ordersAnonymized: number } {
    const norm = email.toLowerCase().trim();
    let count = 0;
    const anonEmail = `anonymized-${crypto.randomBytes(6).toString('hex')}@privacy.local`;

    for (const order of this.orders.values()) {
      if (order.buyer_email.toLowerCase().trim() === norm) {
        order.buyer_email = anonEmail;
        order.buyer_name = 'Redacted (GDPR/DPDP Right to Erasure)';
        order.ip_address = '0.0.0.0';
        order.user_agent = 'Redacted';
        this.orders.set(order.id, order);
        count++;
      }
    }

    for (const purchase of this.purchases.values()) {
      if (purchase.buyer_email.toLowerCase().trim() === norm) {
        purchase.buyer_email = anonEmail;
        purchase.buyer_name = 'Redacted';
        this.purchases.set(purchase.id, purchase);
      }
    }

    return { ordersAnonymized: count };
  }
}

export const db = new InMemoryDatabase();
