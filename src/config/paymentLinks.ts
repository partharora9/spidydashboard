/**
 * Payment and checkout URLs for SpidyDashboard source code packages.
 * Configure your Stripe, LemonSqueezy, or Razorpay checkout links here.
 */
export const paymentLinks = {
  standard: 'https://buy.stripe.com/spidydashboard-standard',
  complete: 'https://buy.stripe.com/spidydashboard-complete-kit',
} as const;

export type PaymentPlanKey = keyof typeof paymentLinks;
