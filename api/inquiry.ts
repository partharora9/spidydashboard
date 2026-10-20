/**
 * SPIDYDASHBOARD INQUIRY ROUTE (Backward compatibility alias)
 *
 * Directs all legacy and card-based inquiries to the resilient,
 * deliverability-optimized api/request.ts handler.
 */

import requestHandler from './request';

export default async function handler(req: any, res: any) {
  return requestHandler(req, res);
}
