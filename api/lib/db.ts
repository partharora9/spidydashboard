/**
 * RESILIENT DATA ACCESS LAYER
 * Handles request storage, email delivery logs, and suppression lists.
 * Supports serverless execution with /tmp persistent fallback and in-memory cache.
 */

import fs from 'fs';
import path from 'path';

export interface RequestRecord {
  id: string;
  reference: string;
  plan: string;
  planName: string;
  amountFormatted: string;
  email: string;
  name: string;
  message?: string;
  status: 'new' | 'verified' | 'delivered' | 'rejected';
  email_status: 'pending' | 'sent' | 'failed' | 'partial';
  owner_email_status: 'pending' | 'sent' | 'failed';
  buyer_email_status: 'pending' | 'sent' | 'failed' | 'suppressed';
  owner_resend_id?: string;
  buyer_resend_id?: string;
  retry_count: number;
  last_retry_at?: string;
  created_at: string;
  ip?: string;
  user_agent?: string;
}

export interface EmailLogRecord {
  id: string;
  resend_id?: string;
  request_reference: string;
  recipient: string;
  type: 'owner_notification' | 'buyer_confirmation' | 'test';
  status: 'pending' | 'sent' | 'delivered' | 'bounced' | 'complained' | 'failed';
  idempotency_key: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface SuppressionRecord {
  email: string;
  reason: 'bounce' | 'complaint' | 'manual';
  created_at: string;
}

interface DbState {
  requests: Record<string, RequestRecord>;
  emailLogs: Record<string, EmailLogRecord>;
  suppressionList: Record<string, SuppressionRecord>;
}

const STORAGE_FILE = path.join(process.platform === 'win32' ? process.cwd() : '/tmp', '.spidy_requests_cache.json');

class StorageManager {
  private state: DbState = {
    requests: {},
    emailLogs: {},
    suppressionList: {},
  };

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(STORAGE_FILE)) {
        const raw = fs.readFileSync(STORAGE_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.state = {
          requests: parsed.requests || {},
          emailLogs: parsed.emailLogs || {},
          suppressionList: parsed.suppressionList || {},
        };
      }
    } catch {
      // Fall back to clean state
    }
  }

  private persist() {
    try {
      fs.writeFileSync(STORAGE_FILE, JSON.stringify(this.state), 'utf-8');
    } catch {
      // Best-effort in constrained environments
    }
  }

  // --- Requests ---
  saveRequest(record: RequestRecord): RequestRecord {
    this.state.requests[record.reference] = record;
    this.persist();
    return record;
  }

  getRequest(reference: string): RequestRecord | undefined {
    return this.state.requests[reference];
  }

  getAllRequests(): RequestRecord[] {
    return Object.values(this.state.requests).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  getFailedRequests(): RequestRecord[] {
    return Object.values(this.state.requests).filter(
      (r) => r.email_status === 'failed' || r.email_status === 'pending'
    );
  }

  updateRequest(reference: string, patch: Partial<RequestRecord>): RequestRecord | undefined {
    const existing = this.state.requests[reference];
    if (!existing) return undefined;
    const updated = { ...existing, ...patch };
    this.state.requests[reference] = updated;
    this.persist();
    return updated;
  }

  // --- Email Logs ---
  logEmail(log: EmailLogRecord): EmailLogRecord {
    this.state.emailLogs[log.id] = log;
    this.persist();
    return log;
  }

  updateEmailByResendId(resendId: string, patch: Partial<EmailLogRecord>): EmailLogRecord | undefined {
    const entry = Object.values(this.state.emailLogs).find((l) => l.resend_id === resendId);
    if (!entry) return undefined;
    const updated = { ...entry, ...patch, updated_at: new Date().toISOString() };
    this.state.emailLogs[entry.id] = updated;
    this.persist();
    return updated;
  }

  getAllEmailLogs(): EmailLogRecord[] {
    return Object.values(this.state.emailLogs).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  // --- Suppression List ---
  isSuppressed(email: string): boolean {
    const normalized = email.trim().toLowerCase();
    return !!this.state.suppressionList[normalized];
  }

  suppress(email: string, reason: 'bounce' | 'complaint' | 'manual'): SuppressionRecord {
    const normalized = email.trim().toLowerCase();
    const record: SuppressionRecord = {
      email: normalized,
      reason,
      created_at: new Date().toISOString(),
    };
    this.state.suppressionList[normalized] = record;
    this.persist();
    return record;
  }

  unsuppress(email: string): boolean {
    const normalized = email.trim().toLowerCase();
    if (this.state.suppressionList[normalized]) {
      delete this.state.suppressionList[normalized];
      this.persist();
      return true;
    }
    return false;
  }

  getSuppressionList(): SuppressionRecord[] {
    return Object.values(this.state.suppressionList);
  }
}

export const dbStore = new StorageManager();
