/**
 * DELIVERY LINK TYPES & SCHEMAS
 * Note: Raw download links are strictly secured server-side and only provided
 * upon manual verification and approval by Parth Arora. No fulfillment links
 * are bundled into public client assets.
 */

export interface DeliveryLinkItem {
  id: string;
  label: string;
  url: string;
  description: string;
  badge: string;
  iconType: 'drive_folder' | 'video' | 'mega';
}

export interface PlanDeliveryConfig {
  planId: 'standard' | 'complete';
  planName: string;
  primaryUrl: string;
  links: DeliveryLinkItem[];
}
