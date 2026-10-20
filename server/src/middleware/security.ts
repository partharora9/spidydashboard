/**
 * Security Middleware: Helmet, CSP, CORS, and Sanitization
 */

import helmet from 'helmet';
import cors from 'cors';
import { env } from '../config/env';

export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://challenges.cloudflare.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      frameSrc: ['https://challenges.cloudflare.com'],
      frameAncestors: ["'none'"],
      connectSrc: ["'self'", env.CLIENT_ORIGIN],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },
  noSniff: true,
});

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, or same-origin in dev)
    if (!origin) return callback(null, true);

    const allowed = [env.CLIENT_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'];
    if (
      allowed.includes(origin) ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      origin.endsWith('.vercel.app') ||
      origin.includes('spidydashboard.com')
    ) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for unauthorized origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Token', 'X-Turnstile-Token'],
  maxAge: 86400,
});

/**
 * Validates Cloudflare Turnstile CAPTCHA token if configured.
 */
export async function verifyTurnstileToken(token?: string, remoteIp?: string): Promise<boolean> {
  if (!env.TURNSTILE_SECRET_KEY) {
    // If not configured (dev mode), bypass check
    return true;
  }

  if (!token) {
    return false;
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', env.TURNSTILE_SECRET_KEY);
    formData.append('response', token);
    if (remoteIp) formData.append('remoteip', remoteIp);

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch (err) {
    console.error('[Turnstile] Verification failed:', err);
    return false;
  }
}
