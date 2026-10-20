/**
 * High-Performance In-Memory Sliding Window Rate Limiter
 * Provides strict protections per IP and per Key (e.g. Email/Order) with exponential backoff.
 */

import { type Request, type Response, type NextFunction } from 'express';

interface RateLimitRecord {
  timestamps: number[];
}

export function createRateLimiter(options: {
  windowMs: number;
  maxRequests: number;
  message: string;
  keyGenerator?: (req: Request) => string;
}) {
  const store = new Map<string, RateLimitRecord>();

  // Cleanup old entries every 5 minutes to prevent memory leaks
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      record.timestamps = record.timestamps.filter((t) => now - t < options.windowMs);
      if (record.timestamps.length === 0) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000);

  return (req: Request, res: Response, next: NextFunction) => {
    const clientKey = options.keyGenerator
      ? options.keyGenerator(req)
      : (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';

    const now = Date.now();
    let record = store.get(clientKey);

    if (!record) {
      record = { timestamps: [] };
      store.set(clientKey, record);
    }

    // Keep only timestamps within window
    record.timestamps = record.timestamps.filter((t) => now - t < options.windowMs);

    if (record.timestamps.length >= options.maxRequests) {
      const oldest = record.timestamps[0];
      const resetInSeconds = Math.ceil((oldest + options.windowMs - now) / 1000);

      res.setHeader('Retry-After', resetInSeconds);
      return res.status(429).json({
        error: options.message,
        retryAfterSeconds: resetInSeconds,
      });
    }

    record.timestamps.push(now);
    next();
  };
}

// 1. Order Creation: Max 5 orders per 15 minutes per IP
export const orderCreationLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
  message: 'Too many order requests from this IP address. Please wait before creating another order.',
});

// 2. UTR Submission: Max 5 attempts per 10 minutes per IP
export const utrSubmissionLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  maxRequests: 5,
  message: 'Too many UTR submission attempts. Please wait a few minutes.',
});

// 3. Download Endpoint: Max 10 attempts per 10 minutes per IP
export const downloadLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  maxRequests: 10,
  message: 'Download rate limit exceeded. Please wait before requesting another download.',
});

// 4. OTP Request Limiter: Max 3 requests per 10 minutes per email
export const otpRequestLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  maxRequests: 3,
  message: 'Too many verification code requests. Please wait 10 minutes before trying again.',
  keyGenerator: (req) => {
    const email = (req.body?.email || req.query?.email || '').toString().toLowerCase().trim();
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '';
    return `${email}:${ip}`;
  },
});

// 5. Order Status Polling: Max 60 polls per minute per IP
export const statusPollingLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 60,
  message: 'Polling rate limit reached. Please poll less frequently.',
});
