/**
 * SpidyDashboard Orders API (Vercel Serverless Function)
 * Route: /api/orders and /api/orders/:ref/*
 * 
 * Handles:
 * - POST /api/orders                    -> Creates student edition (Rs 999) order + UPI QR
 * - POST /api/orders/:reference/utr     -> Submits 12-digit UTR payment proof
 * - GET  /api/orders/:reference/status  -> Polls real-time verification status
 * - GET  /api/orders/:reference/invoice -> Returns invoice receipt data
 * - GET  /api/orders                    -> Health check
 * 
 * Storage:
 * - Hosted PostgreSQL (DATABASE_URL / POSTGRES_URL)
 * - Upstash / Vercel KV (KV_REST_API_URL & KV_REST_API_TOKEN)
 * - In-memory Map fallback with safe /tmp cache (never crashes on read-only disk)
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import pg from 'pg';

export interface OrderRecord {
  id: string;
  reference: string;
  plan: string;
  plan_name: string;
  base_amount_cents: number;
  total_amount_cents: number;
  currency: string;
  buyer_email: string;
  buyer_name: string;
  buyer_phone: string;
  buyer_college: string;
  consent_given: boolean;
  status: 'created' | 'pending_verification' | 'approved' | 'rejected' | 'expired';
  utr?: string | null;
  utr_submitted_at?: string | null;
  created_at: string;
  expires_at: string;
  approved_at?: string | null;
  download_token?: string | null;
  download_token_expires_at?: string | null;
  download_count?: number;
}

// ---------------------------------------------------------------------------
// 1. DATABASE & STORAGE LAYER (HOSTED DB + MEMORY FALLBACK)
// ---------------------------------------------------------------------------

const globalRef = globalThis as unknown as {
  __spidy_orders_map?: Map<string, OrderRecord>;
  __spidy_pg_pool?: pg.Pool | null;
  __spidy_pg_initialized?: boolean;
};

if (!globalRef.__spidy_orders_map) {
  globalRef.__spidy_orders_map = new Map<string, OrderRecord>();
}

// Optional ephemeral /tmp cache for warm lambdas
const CACHE_FILE = path.join(process.platform === 'win32' ? process.cwd() : '/tmp', '.spidy_orders_cache.json');

function loadMemoryCache(): void {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const raw = fs.readFileSync(CACHE_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (data && typeof data === 'object') {
        for (const [k, v] of Object.entries(data)) {
          globalRef.__spidy_orders_map!.set(k, v as OrderRecord);
        }
      }
    }
  } catch {
    // Read-only filesystem or parse failure is safely ignored
  }
}

function saveMemoryCache(): void {
  try {
    const obj = Object.fromEntries(globalRef.__spidy_orders_map!);
    fs.writeFileSync(CACHE_FILE, JSON.stringify(obj), 'utf-8');
  } catch {
    // Read-only filesystem is safely ignored
  }
}

// Initialize memory cache on startup
loadMemoryCache();

// PostgreSQL connection helper
function getPgPool(): pg.Pool | null {
  const connStr = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL;
  if (!connStr) return null;

  if (!globalRef.__spidy_pg_pool) {
    try {
      globalRef.__spidy_pg_pool = new pg.Pool({
        connectionString: connStr,
        ssl: connStr.includes('localhost') ? false : { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000,
      });
    } catch (e) {
      console.warn('[Orders DB] Failed to create PostgreSQL pool, falling back to memory store:', e);
      globalRef.__spidy_pg_pool = null;
    }
  }
  return globalRef.__spidy_pg_pool;
}

async function ensurePgTables(pool: pg.Pool): Promise<void> {
  if (globalRef.__spidy_pg_initialized) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS spidy_orders (
        id VARCHAR(64) PRIMARY KEY,
        reference VARCHAR(32) UNIQUE NOT NULL,
        data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_spidy_orders_ref ON spidy_orders(reference);
    `);
    globalRef.__spidy_pg_initialized = true;
  } catch (err) {
    console.warn('[Orders DB] Table initialization error (using fallback):', err);
  }
}

// KV Helper (Upstash / Vercel KV)
function hasKv(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function kvGet(key: string): Promise<OrderRecord | null> {
  try {
    const res = await fetch(`${process.env.KV_REST_API_URL}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.result) return null;
    return typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
  } catch {
    return null;
  }
}

async function kvSet(key: string, value: OrderRecord): Promise<void> {
  try {
    await fetch(`${process.env.KV_REST_API_URL}/set/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(JSON.stringify(value)),
    });
  } catch {
    // Fallback handled in memory
  }
}

// Unified Store Methods
async function dbSaveOrder(order: OrderRecord): Promise<void> {
  // 1. Always update memory Map + cache
  globalRef.__spidy_orders_map!.set(order.reference.toUpperCase(), order);
  saveMemoryCache();

  // 2. Persist to PostgreSQL if configured
  const pool = getPgPool();
  if (pool) {
    try {
      await ensurePgTables(pool);
      await pool.query(
        `INSERT INTO spidy_orders (id, reference, data, updated_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (reference) DO UPDATE SET data = $3, updated_at = NOW()`,
        [order.id, order.reference.toUpperCase(), JSON.stringify(order)]
      );
      return;
    } catch (err) {
      console.warn('[Orders DB] PostgreSQL save failed, preserved in memory:', err);
    }
  }

  // 3. Persist to Upstash / Vercel KV if configured
  if (hasKv()) {
    await kvSet(`order:${order.reference.toUpperCase()}`, order);
  }
}

async function dbGetOrder(reference: string): Promise<OrderRecord | null> {
  const cleanRef = reference.trim().toUpperCase();

  // 1. Check memory Map first (fastest)
  const mem = globalRef.__spidy_orders_map!.get(cleanRef);
  if (mem) return mem;

  // 2. Query PostgreSQL if configured
  const pool = getPgPool();
  if (pool) {
    try {
      await ensurePgTables(pool);
      const res = await pool.query('SELECT data FROM spidy_orders WHERE reference = $1 LIMIT 1', [cleanRef]);
      if (res.rows.length > 0) {
        const order = res.rows[0].data as OrderRecord;
        globalRef.__spidy_orders_map!.set(cleanRef, order);
        return order;
      }
    } catch (err) {
      console.warn('[Orders DB] PostgreSQL query failed:', err);
    }
  }

  // 3. Query Upstash / Vercel KV if configured
  if (hasKv()) {
    const kvOrder = await kvGet(`order:${cleanRef}`);
    if (kvOrder) {
      globalRef.__spidy_orders_map!.set(cleanRef, kvOrder);
      return kvOrder;
    }
  }

  // 4. Try loading disk cache as last resort
  loadMemoryCache();
  return globalRef.__spidy_orders_map!.get(cleanRef) || null;
}

async function dbCheckDuplicateUtr(utr: string, currentRef: string): Promise<boolean> {
  const cleanUtr = utr.trim();

  // 1. Check memory
  for (const order of globalRef.__spidy_orders_map!.values()) {
    if (order.utr === cleanUtr && order.reference.toUpperCase() !== currentRef.toUpperCase() && order.status !== 'rejected') {
      return true;
    }
  }

  // 2. Check PostgreSQL
  const pool = getPgPool();
  if (pool) {
    try {
      await ensurePgTables(pool);
      const res = await pool.query(
        `SELECT reference FROM spidy_orders 
         WHERE data->>'utr' = $1 AND reference != $2 AND data->>'status' != 'rejected' LIMIT 1`,
        [cleanUtr, currentRef.toUpperCase()]
      );
      if (res.rows.length > 0) return true;
    } catch {
      // Fallback
    }
  }

  return false;
}

// ---------------------------------------------------------------------------
// 2. DISPATCH & HELPER UTILITIES
// ---------------------------------------------------------------------------

function jsonResponse(res: any, status: number, data: any) {
  res.setHeader('Content-Type', 'application/json');
  if (typeof res.status === 'function') {
    const chain = res.status(status);
    if (chain && typeof chain.json === 'function') {
      return chain.json(data);
    }
    if (typeof res.json === 'function') {
      return res.json(data);
    }
  }
  if (typeof res.json === 'function') {
    res.statusCode = status;
    return res.json(data);
  }
  res.statusCode = status;
  return res.end(JSON.stringify(data));
}

// ---------------------------------------------------------------------------
// 3. MAIN SERVERLESS REQUEST HANDLER
// ---------------------------------------------------------------------------

export default async function handler(req: any, res: any) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Turnstile-Token');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  try {
    // Normalize path and segments
    const rawUrl = req.url || '';
    const pathname = rawUrl.split('?')[0];
    const pathSuffix = pathname.replace(/^\/api\/orders\/?/i, '');
    const segments = pathSuffix.split('/').filter(Boolean);

    // Route: GET /api/orders (Health check)
    if (segments.length === 0 && req.method === 'GET') {
      return jsonResponse(res, 200, {
        status: 'ok',
        service: 'SpidyDashboard Orders API',
        plan: 'student_edition',
        priceFormatted: '₹999',
        storage: getPgPool() ? 'postgresql' : hasKv() ? 'vercel_kv' : 'memory',
        timestamp: new Date().toISOString(),
      });
    }

    // Route: POST /api/orders (Create Order)
    if (segments.length === 0 && req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch {
          body = {};
        }
      }

      const { email, name, phone, college, consent } = body || {};

      if (!email || typeof email !== 'string' || !email.includes('@')) {
        return jsonResponse(res, 400, { error: 'Please provide a valid delivery email address.' });
      }
      if (!name || typeof name !== 'string' || name.trim().length < 2) {
        return jsonResponse(res, 400, { error: 'Please enter your full name.' });
      }
      if (!phone || typeof phone !== 'string' || phone.trim().length < 10) {
        return jsonResponse(res, 400, { error: 'Please enter a valid 10-digit mobile number.' });
      }
      if (!college || typeof college !== 'string' || college.trim().length < 2) {
        return jsonResponse(res, 400, { error: 'Please enter your college or university name.' });
      }
      if (!consent) {
        return jsonResponse(res, 400, {
          error: 'You must accept the Terms of Service and acknowledge the strict No Refund Policy to proceed.',
        });
      }

      const reference = `SPIDY-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      const orderId = `ord_${crypto.randomUUID()}`;
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 min validity

      const order: OrderRecord = {
        id: orderId,
        reference,
        plan: 'student_edition',
        plan_name: 'SpidyDashboard, Student Edition',
        base_amount_cents: 99900,
        total_amount_cents: 99900,
        currency: 'INR',
        buyer_email: email.trim().toLowerCase(),
        buyer_name: name.trim(),
        buyer_phone: phone.trim(),
        buyer_college: college.trim(),
        consent_given: true,
        status: 'created',
        created_at: new Date().toISOString(),
        expires_at: expiresAt,
      };

      await dbSaveOrder(order);

      const vpa = (process.env.MERCHANT_UPI_ID || '8700383626@axl').trim();
      const payeeName = (process.env.MERCHANT_NAME || 'Parth Arora').trim();
      const upiUri = `upi://pay?pa=${vpa}&pn=${encodeURIComponent(payeeName)}&am=999.00&cu=INR&tn=${encodeURIComponent(reference)}`;

      let qrCodeDataUrl = '';
      try {
        qrCodeDataUrl = await QRCode.toDataURL(upiUri, {
          errorCorrectionLevel: 'M',
          margin: 2,
          width: 320,
          color: { dark: '#000000', light: '#FFFFFF' },
        });
      } catch (qrErr) {
        console.warn('[Orders API] QR generation warning:', qrErr);
      }

      return jsonResponse(res, 201, {
        orderId: order.id,
        reference: order.reference,
        plan: order.plan,
        planName: order.plan_name,
        baseAmountFormatted: '₹999',
        exactAmountFormatted: '₹999',
        totalAmountCents: order.total_amount_cents,
        currency: order.currency,
        expiresAt: order.expires_at,
        upiUri,
        vpa,
        qrCodeDataUrl,
        instructions: `Scan with Google Pay, PhonePe, Paytm, or BHIM. Transfer exactly ₹999 with note ${reference}.`,
      });
    }

    // Segmented Routes: /api/orders/:reference/*
    const reference = segments[0]?.trim();
    const action = segments[1]?.toLowerCase();

    if (!reference) {
      return jsonResponse(res, 400, { error: 'Order reference is required.' });
    }

    const order = await dbGetOrder(reference);
    if (!order) {
      return jsonResponse(res, 404, { error: `Order ${reference} not found. Please initiate a new order.` });
    }

    // Route: POST /api/orders/:reference/utr (Submit Payment UTR)
    if (action === 'utr' && req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch {
          body = {};
        }
      }

      const { utr, email } = body || {};
      const cleanUtr = String(utr || '').trim();

      if (!/^[0-9]{12}$/.test(cleanUtr)) {
        return jsonResponse(res, 400, { error: 'UTR / Transaction ID must be exactly 12 numeric digits.' });
      }

      if (!email || email.trim().toLowerCase() !== order.buyer_email.toLowerCase()) {
        return jsonResponse(res, 403, { error: 'Email address does not match order record.' });
      }

      // Check for expiry
      if (new Date(order.expires_at) < new Date() && order.status === 'created') {
        order.status = 'expired';
        await dbSaveOrder(order);
        return jsonResponse(res, 400, { error: 'This order session has expired. Please initiate a fresh order.' });
      }

      // Check for duplicate UTR
      const isDuplicate = await dbCheckDuplicateUtr(cleanUtr, order.reference);
      if (isDuplicate) {
        return jsonResponse(res, 400, {
          error: 'This UPI Transaction ID (UTR) has already been submitted for another order. Fraudulent submissions are blocked.',
        });
      }

      // Update order
      order.status = 'pending_verification';
      order.utr = cleanUtr;
      order.utr_submitted_at = new Date().toISOString();
      await dbSaveOrder(order);

      // Optional: Send operational alert to owner via Resend if configured
      if (process.env.RESEND_API_KEY) {
        try {
          const ownerEmail = process.env.OWNER_EMAIL || 'parthxcore@gmail.com';
          const mailDomain = process.env.MAIL_DOMAIN || 'spidydashboard.com';
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: `SpidyDashboard Orders <orders@mail.${mailDomain}>`,
              to: [ownerEmail],
              subject: `💳 Payment Submitted: ${order.reference} (UTR: ${cleanUtr})`,
              html: `
                <div style="font-family: sans-serif; padding: 20px;">
                  <h2>New Payment Verification Needed</h2>
                  <p><strong>Order Reference:</strong> ${order.reference}</p>
                  <p><strong>Customer:</strong> ${order.buyer_name} (${order.buyer_email})</p>
                  <p><strong>College:</strong> ${order.buyer_college}</p>
                  <p><strong>Amount:</strong> ₹999</p>
                  <p><strong>12-digit UTR:</strong> <span style="font-size: 18px; font-weight: bold; background: #FEF3C7; padding: 4px 8px;">${cleanUtr}</span></p>
                  <p>Check your bank statement or UPI app to verify, then approve in your Admin Panel.</p>
                </div>
              `,
            }),
          });
        } catch (e) {
          console.warn('[Orders API] Non-critical owner alert email failed:', e);
        }
      }

      return jsonResponse(res, 200, {
        success: true,
        status: 'pending_verification',
        message: 'Payment proof submitted successfully! Verification usually takes 5-15 minutes.',
        reference: order.reference,
      });
    }

    // Route: GET /api/orders/:reference/status (Poll Status)
    if (action === 'status' && req.method === 'GET') {
      return jsonResponse(res, 200, {
        reference: order.reference,
        plan: order.plan,
        planName: order.plan_name,
        status: order.status,
        totalAmountFormatted: '₹999',
        totalAmountCents: order.total_amount_cents,
        utr: order.utr || null,
        createdAt: order.created_at,
        expiresAt: order.expires_at,
        downloadToken: order.download_token || null,
        downloadUrl: order.download_token ? `/api/download/${order.download_token}` : null,
        downloadTokenExpiresAt: order.download_token_expires_at || null,
        downloadsRemaining: Math.max(0, 3 - (order.download_count || 0)),
      });
    }

    // Route: GET /api/orders/:reference/invoice (Invoice View)
    if (action === 'invoice' && req.method === 'GET') {
      return jsonResponse(res, 200, {
        invoiceNumber: `INV-${order.reference}`,
        reference: order.reference,
        date: order.created_at,
        customer: {
          name: order.buyer_name,
          email: order.buyer_email,
          phone: order.buyer_phone,
          college: order.buyer_college,
        },
        merchant: {
          name: process.env.MERCHANT_NAME || 'Parth Arora',
          upiId: process.env.MERCHANT_UPI_ID || '8700383626@axl',
          email: 'parthxcore@gmail.com',
        },
        plan: {
          name: order.plan_name,
          amountFormatted: '₹999',
          amountPaise: order.total_amount_cents,
        },
        payment: {
          status: order.status,
          utr: order.utr || null,
          submittedAt: order.utr_submitted_at || null,
        },
      });
    }

    // Unmatched action
    return jsonResponse(res, 404, { error: `Endpoint /api/orders/${reference}/${action || ''} not found.` });
  } catch (err: any) {
    console.error('[Orders API Critical Handler Exception]:', err);
    return jsonResponse(res, 500, {
      error: err?.message || 'Internal server error processing checkout request.',
      code: 'CHECKOUT_INTERNAL_ERROR',
    });
  }
}
