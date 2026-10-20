/**
 * SERVER-SIDE AUTHORITATIVE PLANS CONFIGURATION
 * Never trust prices sent from the client or browser!
 */

export interface DeliveryLink {
  label: string;
  url: string;
  description: string;
  type: 'mega' | 'gdrive_folder' | 'gdrive_video';
}

export interface PlanConfig {
  id: 'standard' | 'complete';
  name: string;
  basePriceCents: number; // Stored in paise (INR 1 = 100 paise)
  currency: 'INR';
  description: string;
  features: string[];
  releaseFileName: string;
  directAccessUrl?: string;
  directAccessUrls?: DeliveryLink[];
}

export const SERVER_PLANS: Record<'standard' | 'complete', PlanConfig> = {
  standard: {
    id: 'standard',
    name: 'SpidyDashboard Standard',
    basePriceCents: 49900, // Rs 499.00
    currency: 'INR',
    description: 'Step-by-step setup guide, walkthrough video, architecture docs',
    features: [
      'Step-by-step installation and setup guide',
      'Architecture and walkthrough video tour link',
      'Module catalog and documentation',
      'Personal & educational license',
    ],
    releaseFileName: 'spidydashboard-standard-v1.0.0.zip',
    directAccessUrl: 'https://mega.nz/file/mC5HVarR#ZAwdE8l-icMVq7rrXy5UdKFVvilEFYbRM1QEQRqe25Q',
    directAccessUrls: [
      {
        label: 'MEGA Dashboard Repository Download',
        url: 'https://mega.nz/file/mC5HVarR#ZAwdE8l-icMVq7rrXy5UdKFVvilEFYbRM1QEQRqe25Q',
        description: 'Complete step-by-step setup guide, architecture documentation, and video tour archive',
        type: 'mega',
      },
    ],
  },
  complete: {
    id: 'complete',
    name: 'SpidyDashboard Complete Kit',
    basePriceCents: 79900, // Rs 799.00
    currency: 'INR',
    description: 'Full dashboard source code, project report, PPT presentation, viva Q&A',
    features: [
      'Full SpiderFoot-based reconnaissance engine & dashboard source code',
      'Full academic / technical project report (PDF & DOCX)',
      'Professional PowerPoint presentation (PPTX)',
      'Viva defense questions & detailed answers',
      'Step-by-step installation and setup guide',
      'Architecture and walkthrough video tour link',
      'Personal & educational license',
    ],
    releaseFileName: 'spidydashboard-complete-v1.0.0.zip',
    directAccessUrl: 'https://drive.google.com/drive/folders/11yYiGjmPlh5phJyrMYwq-OAimypkZbj_?usp=sharing',
    directAccessUrls: [
      {
        label: 'Google Drive Complete Package (Source Code, Reports, PPTX, Viva)',
        url: 'https://drive.google.com/drive/folders/11yYiGjmPlh5phJyrMYwq-OAimypkZbj_?usp=sharing',
        description: 'Full SpiderFoot engine source code, academic IEEE report (PDF & DOCX), PPT presentation, and viva defense Q&A',
        type: 'gdrive_folder',
      },
      {
        label: 'Video Walkthrough & Architecture Tour (MP4)',
        url: 'https://drive.google.com/file/d/1OU27pCr2AnxcfoLeazLZbWOiysxakZok/view?usp=sharing',
        description: 'Comprehensive engine walkthrough and component architecture video tour',
        type: 'gdrive_video',
      },
      {
        label: 'MEGA Dashboard Repository Archive',
        url: 'https://mega.nz/file/mC5HVarR#ZAwdE8l-icMVq7rrXy5UdKFVvilEFYbRM1QEQRqe25Q',
        description: 'High-speed mirror of the complete dashboard repository archive and standalone release',
        type: 'mega',
      },
    ],
  },
};

export function getPlanOrThrow(planId: string): PlanConfig {
  if (planId === 'standard' || planId === 'complete') {
    return SERVER_PLANS[planId];
  }
  throw new Error(`Invalid plan identifier: ${planId}. Allowed plans are 'standard' or 'complete'.`);
}
