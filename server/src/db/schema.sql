-- =========================================================================
-- SPIDYDASHBOARD SECURE CHECKOUT & DELIVERY SCHEMA (PostgreSQL / Supabase)
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ORDERS TABLE
-- Tracks each checkout session. Amount is determined strictly on the server.
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference VARCHAR(16) UNIQUE NOT NULL,                 -- e.g. 'SPIDY-7K3Q9'
    plan VARCHAR(32) NOT NULL DEFAULT 'student_edition',   -- 'student_edition'
    base_amount_cents INTEGER NOT NULL DEFAULT 99900,      -- 99900 (paise = Rs 999)
    paise_offset INTEGER NOT NULL DEFAULT 0,               -- paise offset for exact matching
    total_amount_cents INTEGER NOT NULL DEFAULT 99900,     -- base_amount_cents + paise_offset
    currency VARCHAR(8) NOT NULL DEFAULT 'INR',
    buyer_email VARCHAR(255) NOT NULL,
    buyer_name VARCHAR(255),
    buyer_phone VARCHAR(32),
    buyer_college VARCHAR(255),
    consent_given BOOLEAN NOT NULL DEFAULT true,
    consent_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    privacy_policy_version VARCHAR(16) NOT NULL DEFAULT 'v1.0',
    marketing_opt_in BOOLEAN NOT NULL DEFAULT false,
    status VARCHAR(32) NOT NULL DEFAULT 'created',         -- 'created' | 'pending_verification' | 'approved' | 'rejected' | 'expired' | 'refunded'
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,                       -- created_at + 30 mins
    approved_at TIMESTAMPTZ,
    approved_by VARCHAR(128),
    ip_address VARCHAR(64),
    user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_orders_reference ON orders(reference);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_email ON orders(buyer_email);
CREATE INDEX IF NOT EXISTS idx_orders_amount_status ON orders(total_amount_cents, status);

-- 2. PAYMENTS TABLE
-- Stores UTR submissions, receipt references, screenshot data, and verification timestamps.
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    provider VARCHAR(32) NOT NULL DEFAULT 'manual_upi',
    utr VARCHAR(32),                                       -- 12-digit bank reference (unique)
    utr_submitted_at TIMESTAMPTZ,
    receipt_key TEXT,                                      -- Private bucket key for uploaded screenshot
    receipt_mime_type VARCHAR(64),
    screenshot_data TEXT,                                  -- Base64 encoded screenshot data
    is_verified BOOLEAN NOT NULL DEFAULT false,
    verified_at TIMESTAMPTZ,
    verified_by VARCHAR(128)
);

CREATE INDEX IF NOT EXISTS idx_payments_utr ON payments(utr);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);

-- 3. PURCHASES TABLE
-- Immutable purchase record created upon admin approval.
CREATE TABLE IF NOT EXISTS purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    order_reference VARCHAR(16) NOT NULL,
    plan VARCHAR(32) NOT NULL,
    buyer_email VARCHAR(255) NOT NULL,
    buyer_name VARCHAR(255),
    amount_paid_cents INTEGER NOT NULL,
    currency VARCHAR(8) NOT NULL DEFAULT 'INR',
    license_key VARCHAR(64) UNIQUE NOT NULL,              -- e.g. 'SPIDY-LIC-XXXX-YYYY-ZZZZ'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_purchases_buyer_email ON purchases(buyer_email);
CREATE INDEX IF NOT EXISTS idx_purchases_order_reference ON purchases(order_reference);

-- 4. DOWNLOAD TOKENS TABLE
-- Single/limited-use 256-bit download tokens. Stored hashed with SHA-256.
CREATE TABLE IF NOT EXISTS download_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL UNIQUE,                -- SHA-256 of 256-bit random hex
    max_downloads INTEGER NOT NULL DEFAULT 3,
    download_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,                       -- created_at + 15 mins
    revoked BOOLEAN NOT NULL DEFAULT false,
    revoked_reason TEXT,
    last_downloaded_at TIMESTAMPTZ,
    last_download_ip VARCHAR(64)
);

CREATE INDEX IF NOT EXISTS idx_download_tokens_hash ON download_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_download_tokens_order_id ON download_tokens(order_id);

-- 5. OTP CODES TABLE
-- Ephemeral 6-digit verification codes for file recovery and GDPR privacy deletion.
CREATE TABLE IF NOT EXISTS otp_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_email VARCHAR(255) NOT NULL,
    order_reference VARCHAR(16),
    purpose VARCHAR(32) NOT NULL,                          -- 'file_recovery' | 'privacy_deletion' | 'admin_2fa'
    code_hash VARCHAR(64) NOT NULL,                        -- SHA-256 of 6-digit OTP
    attempts INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 3,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,                       -- created_at + 10 mins
    consumed BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_otp_target ON otp_codes(target_email, purpose);

-- 6. ADMIN AUDIT LOG TABLE
-- Immutable append-only audit trail for all admin actions.
CREATE TABLE IF NOT EXISTS admin_audit (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action VARCHAR(64) NOT NULL,                           -- 'APPROVE_ORDER', 'REJECT_ORDER', 'REVOKE_TOKEN', 'RECONCILE_BATCH', etc.
    order_reference VARCHAR(16),
    actor VARCHAR(128) NOT NULL,
    ip_address VARCHAR(64),
    details JSONB,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_order_ref ON admin_audit(order_reference);
CREATE INDEX IF NOT EXISTS idx_admin_audit_timestamp ON admin_audit(timestamp DESC);
