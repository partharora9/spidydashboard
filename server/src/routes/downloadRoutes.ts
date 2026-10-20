/**
 * Secure File Streaming & Download Routes
 * GET /api/download/:token - Validates cryptographic token and streams private ZIP release.
 * GET /api/download/info/:token - Returns file metadata & checksum without consuming a download count.
 */

import { Router, type Request, type Response } from 'express';
import crypto from 'crypto';
import { db } from '../db';
import { SERVER_PLANS, PLAN_ID } from '../config/plans';
import { storage } from '../services/storage/StorageProvider';
import { downloadLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * GET /api/download/info/:token
 * Pre-download verification to show filename, size, and SHA-256 checksum in UI.
 */
router.get('/download/info/:token', downloadLimiter, async (req: Request, res: Response) => {
  const { token } = req.params;

  if (!token || token.length < 32) {
    return res.status(400).json({ error: 'Invalid download token format.' });
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const tokenRow = db.getDownloadTokenByHash(tokenHash);

  if (!tokenRow) {
    return res.status(404).json({ error: 'Download token not found or has already expired.' });
  }

  if (tokenRow.revoked) {
    return res.status(403).json({ error: `Download link revoked: ${tokenRow.revoked_reason || 'Contact support'}` });
  }

  if (new Date(tokenRow.expires_at) < new Date()) {
    return res.status(410).json({ error: 'Download token has expired. Request a fresh link via the Recovery Portal.' });
  }

  if (tokenRow.download_count >= tokenRow.max_downloads) {
    return res.status(403).json({
      error: `Download limit of ${tokenRow.max_downloads} reached. Use the Recovery Portal to issue a new link.`,
    });
  }

  const order = db.getOrderById(tokenRow.order_id);
  if (!order) {
    return res.status(404).json({ error: 'Associated order not found.' });
  }

  const planConfig = SERVER_PLANS[order.plan as keyof typeof SERVER_PLANS] || SERVER_PLANS[PLAN_ID];
  const checksum = await storage.getFileChecksum(planConfig.releaseFileName);

  return res.json({
    valid: true,
    fileName: planConfig.releaseFileName,
    planName: planConfig.name,
    orderReference: order.reference,
    downloadsRemaining: tokenRow.max_downloads - tokenRow.download_count,
    maxDownloads: tokenRow.max_downloads,
    expiresAt: tokenRow.expires_at,
    sha256Checksum: checksum,
  });
});

/**
 * GET /api/download/:token
 * Streams the release archive directly. Consumes 1 download count.
 */
router.get('/download/:token', downloadLimiter, async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    if (!token || token.length < 32) {
      return res.status(400).json({ error: 'Invalid token' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const tokenRow = db.getDownloadTokenByHash(tokenHash);

    if (!tokenRow) {
      return res.status(404).json({ error: 'Download token not found or invalid.' });
    }

    if (tokenRow.revoked) {
      return res.status(403).json({ error: 'This download link has been revoked.' });
    }

    if (new Date(tokenRow.expires_at) < new Date()) {
      return res.status(410).json({ error: 'This download token has expired.' });
    }

    if (tokenRow.download_count >= tokenRow.max_downloads) {
      return res.status(403).json({ error: 'Maximum download limit reached for this token.' });
    }

    const order = db.getOrderById(tokenRow.order_id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const planConfig = SERVER_PLANS[order.plan as keyof typeof SERVER_PLANS] || SERVER_PLANS[PLAN_ID];
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';

    // Check if cloud storage provides a 60-second presigned URL
    const signedUrl = await storage.getSignedDownloadUrl(planConfig.releaseFileName, 60);
    if (signedUrl) {
      db.incrementDownloadCount(tokenRow.id, clientIp);
      return res.redirect(signedUrl);
    }

    // Direct streaming from storage provider
    const { stream, sizeBytes, mimeType } = await storage.getFileStream(planConfig.releaseFileName);

    // Atomically increment download count
    db.incrementDownloadCount(tokenRow.id, clientIp);

    // Create audit log
    db.createAudit({
      action: 'FILE_DOWNLOADED',
      order_reference: order.reference,
      actor: `buyer:${order.buyer_email}`,
      ip_address: clientIp,
      details: {
        fileName: planConfig.releaseFileName,
        downloadIndex: tokenRow.download_count + 1,
      },
    });

    res.setHeader('Content-Disposition', `attachment; filename="${planConfig.releaseFileName}"`);
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', sizeBytes);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');

    return stream.pipe(res);
  } catch (err) {
    console.error('[Download] File streaming failed:', err);
    return res.status(500).json({ error: 'Failed to stream release file.' });
  }
});

export default router;
