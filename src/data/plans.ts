import {
  PRICE,
  PLAN_ID,
  PLAN_NAME,
  PLAN_DESCRIPTOR,
  STUDENT_PRICE_BADGE,
  PRICE_SUFFIX,
  formatINR,
  STUDENT_DELIVERABLES,
} from '../config/pricing';

export interface Plan {
  id: typeof PLAN_ID;
  name: string;
  price: number;
  formattedPrice: string;
  priceSuffix: string;
  descriptor: string;
  badge: string;
  features: string[];
  ctaText: string;
  paymentKey: typeof PLAN_ID;
  isPopular?: boolean;
  hasGradientGlow?: boolean;
}

export { formatINR };

export const studentPlan: Plan = {
  id: PLAN_ID,
  name: PLAN_NAME,
  price: PRICE,
  formattedPrice: formatINR(PRICE),
  priceSuffix: PRICE_SUFFIX,
  descriptor: PLAN_DESCRIPTOR,
  badge: STUDENT_PRICE_BADGE,
  features: STUDENT_DELIVERABLES,
  ctaText: 'Buy Now',
  paymentKey: PLAN_ID,
  isPopular: true,
  hasGradientGlow: true,
};

export const plansData: Plan[] = [studentPlan];
