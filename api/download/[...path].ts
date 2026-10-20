/**
 * Vercel Serverless Function: /api/download/*
 * Handles:
 * - GET /api/download/info/:token
 * - GET /api/download/:token
 */

import crypto from 'crypto';
import { db } from '../../server/src/db';
import { SERVER_PLANS, PLAN_ID } from '../../server/src/config/plans';
import { storage } from '../../server/src/services/storage/StorageProvider';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status ? res.status(200).end() : res.end();
  }

  const pathParam = req.query?.path;
  const pathSegments: string[] = Array.isArray(pathParam)
    ? pathParam
    : (req.url?.split('/api/download/')[1] || '').split('?')[0].split('/');

  const isInfo = pathSegments[0]?.toLowerCase() === 'info';
  const token = isInfo ? pathSegments[1]?.trim() : pathSegments[0]?.trim();

  if (!token || token.length < 32) {
    const err = { error: 'Invalid download token format.' };
    if (res.status && res.json) return res.status(400).json(err);
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(err));
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const tokenRow = db.getDownloadTokenByHash(tokenHash);

  if (!tokenRow) {
    const err = { error: 'Download token not found or has already expired.' };
    if (res.status && res.json) return res.status(404).json(err);
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(err));
  }

  if (tokenRow.revoked) {
    const err = { error: `Download link revoked: ${tokenRow.revoked_reason || 'Contact support'}` };
    if (res.status && res.json) return res.status(403).json(err);
    res.statusCode = 403;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(err));
  }

  if (new Date(tokenRow.expires_at) < new Date()) {
    const err = { error: 'Download token has expired. Request a fresh link via the Recovery Portal.' };
    if (res.status && res.json) return res.status(410).json(err);
    res.statusCode = 410;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(err));
  }

  if (tokenRow.download_count >= tokenRow.max_downloads) {
    const err = {
      error: `Download limit of ${tokenRow.max_downloads} reached. Use the Recovery Portal to issue a new link.`,
    };
    if (res.status && res.json) return res.status(403).json(err);
    res.statusCode = 403;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(err));
  }

  const order = db.getOrderById(tokenRow.order_id);
  if (!order) {
    const err = { error: 'Associated order not found.' };
    if (res.status && res.json) return res.status(404).json(err);
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(err));
  }

  const planConfig = SERVER_PLANS[PLAN_ID];

  // Info request:
  if (isInfo) {
    const checksum = await storage.getFileChecksum(planConfig.releaseFileName);
    const payload = {
      valid: true,
      fileName: planConfig.releaseFileName,
      planName: planConfig.name,
      orderReference: order.reference,
      downloadsRemaining: tokenRow.max_downloads - tokenRow.download_count,
      maxDownloads: tokenRow.max_downloads,
      expiresAt: tokenRow.expires_at,
      sha256Checksum: checksum,
    };
    if (res.status && res.json) return res.status(200).json(payload);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(payload));
  }

  // Stream release
  try {
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';

    const signedUrl = await storage.getSignedDownloadUrl(planConfig.releaseFileName, 60);
    if (signedUrl) {
      db.incrementDownloadCount(tokenRow.id, clientIp);
      if (res.redirect) return res.redirect(signedUrl);
      res.writeHead(302, { Location: signedUrl });
      return res.end();
    }

    const { stream, sizeBytes, mimeType } = await storage.getFileStream(planConfig.releaseFileName);
    db.incrementDownloadCount(tokenRow.id, clientIp);

    res.setHeader('Content-Disposition', `attachment; filename="${planConfig.releaseFileName}"`);
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', sizeBytes);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');

    return stream.pipe(res);
  } catch (err: any) {
    console.error('[Download API] File streaming failed:', err);
    const errPayload = { error: 'Failed to stream release file.' };
    if (res.status && res.json) return res.status(500).json(errPayload);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(errPayload));
  }
}
