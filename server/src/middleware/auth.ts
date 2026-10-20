/**
 * Admin Authentication & Authorization Middleware
 * Uses constant-time string comparison (timingSafeEqual) to prevent timing attacks.
 * Supports cookie-based session and X-Admin-Token Bearer header with IP allowlist validation.
 */

import crypto from 'crypto';
import { type Request, type Response, type NextFunction } from 'express';
import { env } from '../config/env';

/**
 * Constant-time string equality check
 */
export function safeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) {
    // Constant time dummy comparison
    crypto.timingSafeEqual(aBuf, aBuf);
    return false;
  }
  return crypto.timingSafeEqual(aBuf, bBuf);
}

/**
 * Validates whether the incoming IP address is on the optional allowlist
 */
function isIpAllowed(clientIp: string): boolean {
  if (!env.ADMIN_ALLOWED_IPS) return true; // No restriction configured
  const allowed = env.ADMIN_ALLOWED_IPS.split(',').map((ip) => ip.trim());
  return allowed.includes(clientIp) || allowed.includes('127.0.0.1') || allowed.includes('::1');
}

export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const clientIp =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';

  if (!isIpAllowed(clientIp)) {
    console.warn(`[Security] Blocked unauthorized IP attempting admin access: ${clientIp}`);
    return res.status(403).json({ error: 'Access forbidden: IP address not on authorized allowlist.' });
  }

  // 1. Check Bearer or Custom Header (X-Admin-Token)
  const headerToken = req.headers['x-admin-token'] as string;
  const authHeader = req.headers['authorization'];
  let bearerToken: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    bearerToken = authHeader.slice(7).trim();
  }

  const tokenCandidate = headerToken || bearerToken || req.cookies?.spidy_admin_session;

  if (!tokenCandidate) {
    return res.status(401).json({ error: 'Unauthorized: Admin authentication token required.' });
  }

  // Timing-safe comparison against ADMIN_SECRET
  if (safeCompare(tokenCandidate, env.ADMIN_SECRET)) {
    // Attach actor metadata to request
    (req as any).adminUser = {
      role: 'admin',
      ip: clientIp,
    };
    return next();
  }

  console.warn(`[Security] Invalid admin token attempt from IP ${clientIp}`);
  return res.status(401).json({ error: 'Unauthorized: Invalid admin secret or expired session.' });
}
