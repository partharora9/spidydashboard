/**
 * AUTHORITATIVE DELIVERY REPOSITORY LINKS
 * Configure direct access links for approved orders and digital fulfillment.
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

export const DELIVERY_LINKS: Record<'standard' | 'complete', PlanDeliveryConfig> = {
  standard: {
    planId: 'standard',
    planName: 'SpidyDashboard Standard (₹499)',
    primaryUrl: 'https://mega.nz/file/mC5HVarR#ZAwdE8l-icMVq7rrXy5UdKFVvilEFYbRM1QEQRqe25Q',
    links: [
      {
        id: 'standard-mega',
        label: 'MEGA Dashboard Repository Download',
        url: 'https://mega.nz/file/mC5HVarR#ZAwdE8l-icMVq7rrXy5UdKFVvilEFYbRM1QEQRqe25Q',
        description: 'Complete step-by-step setup guide, architecture documentation, and walkthrough video tour archive.',
        badge: 'MEGA Cloud',
        iconType: 'mega',
      },
    ],
  },
  complete: {
    planId: 'complete',
    planName: 'SpidyDashboard Complete Kit (₹799)',
    primaryUrl: 'https://drive.google.com/drive/folders/11yYiGjmPlh5phJyrMYwq-OAimypkZbj_?usp=sharing',
    links: [
      {
        id: 'complete-drive-folder',
        label: 'Complete Kit (Source Code, Reports, PPTX, Viva)',
        url: 'https://drive.google.com/drive/folders/11yYiGjmPlh5phJyrMYwq-OAimypkZbj_?usp=sharing',
        description: 'Full SpiderFoot engine source code, academic IEEE project report (PDF & DOCX), PPT presentation, and viva defense questions & answers.',
        badge: 'Google Drive Folder',
        iconType: 'drive_folder',
      },
      {
        id: 'complete-video-tour',
        label: 'Video Walkthrough & Architecture Tour',
        url: 'https://drive.google.com/file/d/1OU27pCr2AnxcfoLeazLZbWOiysxakZok/view?usp=sharing',
        description: 'In-depth demonstration video covering local environment setup, OSINT engine architecture, and live reconnaissance scans (MP4).',
        badge: 'Google Drive Video',
        iconType: 'video',
      },
      {
        id: 'complete-mega',
        label: 'MEGA Dashboard Repository Archive',
        url: 'https://mega.nz/file/mC5HVarR#ZAwdE8l-icMVq7rrXy5UdKFVvilEFYbRM1QEQRqe25Q',
        description: 'Direct high-speed mirror of the SpidyDashboard repository, modules, and standalone release package.',
        badge: 'MEGA Mirror',
        iconType: 'mega',
      },
    ],
  },
};

export const getDeliveryLinksForPlan = (plan: 'standard' | 'complete' | string): PlanDeliveryConfig => {
  if (plan === 'complete') {
    return DELIVERY_LINKS.complete;
  }
  return DELIVERY_LINKS.standard;
};
