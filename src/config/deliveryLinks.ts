/**
 * DELIVERY LINK TYPES & SCHEMAS
 * Note: Download links are strictly secured server-side and only provided
 * upon manual verification and approval by Parth Arora. No fulfillment links
 * are bundled into public client assets.
 */

import { PLAN_ID } from './pricing';

export interface DeliveryLinkItem {
  id: string;
  label: string;
  url: string;
  description: string;
  badge: string;
  iconType: 'installer' | 'pdf' | 'video' | 'pack';
}

export interface PlanDeliveryConfig {
  planId: typeof PLAN_ID;
  planName: string;
  primaryUrl: string;
  links: DeliveryLinkItem[];
}
