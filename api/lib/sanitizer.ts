/**
 * INPUT SANITIZATION & SECURITY UTILITIES
 * Protects against header injection, link manipulation, and disposable email abusers.
 */

// Common disposable/temporary email provider domains
export const DISPOSABLE_DOMAINS = new Set([
  '10minutemail.com',
  '10minutemail.net',
  'tempmail.com',
  'tempmail.net',
  'temp-mail.org',
  'guerrillamail.com',
  'guerrillamailblock.com',
  'sharklasers.com',
  'mailinator.com',
  'trashmail.com',
  'trashmail.net',
  'yopmail.com',
  'yopmail.net',
  'dispostable.com',
  'fakeinbox.com',
  'getairmail.com',
  'throwawaymail.com',
  'mohmal.com',
  'burnermail.io',
  'maildrop.cc',
  'getnada.com',
  'inboxkitten.com',
  'crazymailing.com',
  'mytemp.email',
  'emailondeck.com',
]);

/**
 * Strips carriage returns and newlines to prevent SMTP header injection
 */
export function stripHeaderInjection(value: string): string {
  if (!value) return '';
  return value.replace(/[\r\n\t\f\v]/g, ' ').trim();
}

/**
 * Validates and normalizes buyer email address.
 * Rejects invalid format, header injection attempts, and disposable providers.
 */
export function validateAndNormalizeEmail(email: string): {
  valid: boolean;
  email: string;
  error?: string;
} {
  if (!email || typeof email !== 'string') {
    return { valid: false, email: '', error: 'Email address is required.' };
  }

  // Check for header injection characters
  if (/[\r\n\t\f\v]/.test(email)) {
    return { valid: false, email: '', error: 'Invalid characters detected in email address.' };
  }

  const normalized = email.trim().toLowerCase();

  // RFC 5322 standard email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(normalized) || normalized.length > 120) {
    return { valid: false, email: normalized, error: 'Please enter a valid email address.' };
  }

  const domain = normalized.split('@')[1];
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      valid: false,
      email: normalized,
      error: 'Disposable and temporary email addresses are not accepted for delivery.',
    };
  }

  return { valid: true, email: normalized };
}

/**
 * HTML entity escaping for untrusted content
 */
export function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Defangs URLs in untrusted user text (hxxps://example[.]com)
 * and flags if any links were present.
 */
export function defangUrls(text: string): {
  defanged: string;
  hasLinks: boolean;
} {
  if (!text) return { defanged: '', hasLinks: false };

  let hasLinks = false;

  // Detect URL schemes or web patterns
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/gi;

  if (urlRegex.test(text)) {
    hasLinks = true;
  }

  const defanged = text
    .replace(/https:\/\//gi, 'hxxps://')
    .replace(/http:\/\//gi, 'hxxp://')
    .replace(/www\./gi, 'www[.]')
    .replace(/(\.[a-zA-Z]{2,6}(\/|$))/g, (m) => `[.]${m.slice(1)}`);

  return { defanged, hasLinks };
}

/**
 * Masks an email for safe logging without exposing PII
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return '***@***';
  const [local, domain] = email.split('@');
  const visible = local.length > 2 ? local.slice(0, 2) : local.slice(0, 1);
  return `${visible}***@${domain}`;
}
