export interface Plan {
  id: 'standard' | 'complete';
  name: string;
  price: number;
  formattedPrice: string;
  priceSuffix: string;
  descriptor: string;
  features: string[];
  ctaText: string;
  paymentKey: 'standard' | 'complete';
  isPopular?: boolean;
  hasGradientGlow?: boolean;
}

export const formatINR = (value: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

export const plansData: Plan[] = [
  {
    id: 'standard',
    name: 'Standard',
    price: 499,
    formattedPrice: formatINR(499),
    priceSuffix: 'one-time',
    descriptor: 'Setup guide, walkthrough video & documentation',
    features: [
      'Step-by-step setup guide',
      'Full walkthrough video',
      'Module catalog & docs',
      'Instant download',
    ],
    ctaText: 'connect on parthxcore@gmail.com to buy',
    paymentKey: 'standard',
    isPopular: false,
    hasGradientGlow: false,
  },
  {
    id: 'complete',
    name: 'Complete kit',
    price: 799,
    formattedPrice: formatINR(799),
    priceSuffix: 'one-time',
    descriptor: 'Full source code, report, PPT and viva kit',
    features: [
      'Full dashboard source code',
      'Step-by-step setup guide',
      'Full walkthrough video',
      'Project report (PDF & DOCX)',
      'PPT presentation',
      'Viva questions and answers',
      'Instant download',
    ],
    ctaText: 'connect on parthxcore@gmail.com to buy',
    paymentKey: 'complete',
    isPopular: true,
    hasGradientGlow: true,
  },
];
