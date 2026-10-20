/**
 * AUTHORITATIVE PRICING CONFIGURATION
 * Single source of truth for plan pricing and deliverables.
 * Change the price in ONE place: PRICE = 999.
 */

export const PRICE = 999;
export const BASE_PRICE_PAISE = 99900; // 999 * 100 paise
export const PLAN_ID = 'student_edition' as const;
export const PLAN_NAME = 'SpidyDashboard, Student Edition';
export const PLAN_DESCRIPTOR = 'Standalone Windows installer, complete project documentation, walkthrough video, and viva defense pack.';
export const STUDENT_PRICE_BADGE = 'Student price';
export const PAYMENT_TYPE = 'One-time payment';
export const PRICE_SUFFIX = 'one-time';

export const UPI_ID = '8700383626@axl';
export const UPI_PAYEE_NAME = 'Parth Arora';

export const formatINR = (value: number = PRICE): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

export const FORMATTED_PRICE = formatINR(PRICE); // e.g. "₹999"

/**
 * Deliverables included with SpidyDashboard, Student Edition.
 * Note: Strictly standalone compiled application and student academic assets.
 * NO source code is included or offered.
 */
export const STUDENT_DELIVERABLES: string[] = [
  'Windows Setup.exe installer of the dashboard (standalone, nothing extra to install)',
  'Setup and usage guide (PDF)',
  'Walkthrough video link',
  'Project report, PPT and viva Q&A pack',
  'Lifetime use of the installed version',
];
