/**
 * Payment and checkout configuration for SpidyDashboard.
 * Checkout uses direct manual UPI verification (no external payment gateways).
 */
import { PLAN_ID, PRICE, UPI_ID, UPI_PAYEE_NAME } from './pricing';

export const paymentConfig = {
  planId: PLAN_ID,
  price: PRICE,
  upiId: UPI_ID,
  payeeName: UPI_PAYEE_NAME,
} as const;

export type PaymentPlanKey = typeof PLAN_ID;
