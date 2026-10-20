import { app } from '../../server/src/server';

/**
 * Wraps Express application into a Vercel Serverless Function handler.
 * Returns a Promise that resolves when response finishes or closes.
 */
export function createServerlessHandler() {
  return function handler(req: any, res: any) {
    return new Promise<void>((resolve, reject) => {
      res.on('finish', resolve);
      res.on('close', resolve);
      res.on('error', reject);
      app(req, res);
    });
  };
}
