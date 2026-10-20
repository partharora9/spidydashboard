/**
 * SERVER-SIDE AUTHORITATIVE PLANS CONFIGURATION
 * Single source of truth for pricing on the server.
 * Never trust prices sent from the client or browser!
 */

export const PRICE = 999;
export const BASE_PRICE_PAISE = 99900; // Rs 999.00 in paise
export const PLAN_ID = 'student_edition' as const;
export const PLAN_NAME = 'SpidyDashboard, Student Edition';

export interface DeliveryLink {
  label: string;
  url: string;
  description: string;
  type: 'installer' | 'guide_pdf' | 'video' | 'academic_pack';
}

export interface PlanConfig {
  id: typeof PLAN_ID;
  name: string;
  basePriceCents: number; // Stored in paise (INR 1 = 100 paise)
  currency: 'INR';
  description: string;
  features: string[];
  releaseFileName: string;
  secondaryReleaseFileName?: string;
  directAccessUrl?: string;
  directAccessUrls?: DeliveryLink[];
}

export const SERVER_PLANS: Record<typeof PLAN_ID, PlanConfig> = {
  [PLAN_ID]: {
    id: PLAN_ID,
    name: PLAN_NAME,
    basePriceCents: BASE_PRICE_PAISE,
    currency: 'INR',
    description: 'Windows Setup.exe standalone installer, setup & usage guide, video tour, and academic report/PPT/viva pack.',
    features: [
      'Windows Setup.exe installer of the dashboard (standalone, nothing extra to install)',
      'Setup and usage guide (PDF)',
      'Walkthrough video link',
      'Project report, PPT and viva Q&A pack',
      'Lifetime use of the installed version',
    ],
    releaseFileName: 'SpidyDashboard-Setup.exe',
    secondaryReleaseFileName: 'SpidyDashboard-Student-Pack.zip',
    directAccessUrl: 'https://drive.google.com/drive/folders/11yYiGjmPlh5phJyrMYwq-OAimypkZbj_?usp=sharing',
    directAccessUrls: [
      {
        label: 'Windows Standalone Installer (Setup.exe)',
        url: 'https://mega.nz/file/mC5HVarR#ZAwdE8l-icMVq7rrXy5UdKFVvilEFYbRM1QEQRqe25Q',
        description: 'Standalone Windows Setup.exe desktop installer — runs with nothing extra to install.',
        type: 'installer',
      },
      {
        label: 'Setup & Usage Guide (PDF) & Academic Defense Pack',
        url: 'https://drive.google.com/drive/folders/11yYiGjmPlh5phJyrMYwq-OAimypkZbj_?usp=sharing',
        description: 'Comprehensive setup guide PDF, project report (PDF & DOCX), PPT presentation, and viva Q&A pack.',
        type: 'academic_pack',
      },
      {
        label: 'Dashboard Walkthrough & Feature Tour Video (MP4)',
        url: 'https://drive.google.com/file/d/1OU27pCr2AnxcfoLeazLZbWOiysxakZok/view?usp=sharing',
        description: 'Video walkthrough demonstrating installation, footprinting, graph analysis, and scanning modules.',
        type: 'video',
      },
    ],
  },
};

export function getPlanOrThrow(planId: string): PlanConfig {
  if (planId === PLAN_ID || planId === 'student' || planId === 'student_edition') {
    // Normalizes student edition plan
    return SERVER_PLANS[PLAN_ID];
  }
  throw new Error(`Invalid plan identifier: ${planId}. Allowed plan is '${PLAN_ID}'.`);
}
