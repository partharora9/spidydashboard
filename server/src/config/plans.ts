/**
 * SERVER-SIDE AUTHORITATIVE PLANS CONFIGURATION
 * Never trust prices sent from the client or browser!
 */

export interface PlanConfig {
  id: 'standard' | 'complete';
  name: string;
  basePriceCents: number; // Stored in paise (INR 1 = 100 paise)
  currency: 'INR';
  description: string;
  features: string[];
  releaseFileName: string;
  directAccessUrl?: string;
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
  },
};

export function getPlanOrThrow(planId: string): PlanConfig {
  if (planId === 'standard' || planId === 'complete') {
    return SERVER_PLANS[planId];
  }
  throw new Error(`Invalid plan identifier: ${planId}. Allowed plans are 'standard' or 'complete'.`);
}
