export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const faqsData: FaqItem[] = [
  {
    id: 'subscription',
    question: 'Is this a subscription or recurring fee?',
    answer: 'No. SpidyDashboard Student Edition is a one-time payment of ₹999. There are no monthly or recurring subscription fees, and you receive lifetime use of the installed software.',
  },
  {
    id: 'what-included',
    question: 'What do I get after purchasing?',
    answer: 'You receive the standalone Windows Setup.exe installer (which runs without installing anything extra), a comprehensive setup & usage guide PDF, a walkthrough video link, and the complete academic defense pack including project report, presentation PPT, and viva Q&A.',
  },
  {
    id: 'dependencies',
    question: 'Do I need to install Python, Git, or complex dependencies?',
    answer: 'No. The Student Edition comes packaged as a standalone Windows Setup.exe installer that includes everything needed to launch and run locally.',
  },
  {
    id: 'checkout-flow',
    question: 'How does the checkout and delivery work?',
    answer: 'Click "Buy Now", enter your name, email, phone, and college, and complete the ₹999 payment using the provided UPI ID or QR code. Submit your 12-digit UPI Transaction ID (and optional screenshot). Once verified, you will receive secure, tokenized download links directly to your email.',
  },
  {
    id: 'scanning-policy',
    question: 'Can I scan any website or IP address?',
    answer: 'No. Reconnaissance scans must be executed only against targets, domains, or infrastructure you own or have explicit written permission to test. Use is strictly limited to personal research and academic education.',
  },
  {
    id: 'refunds',
    question: 'Can I get a refund?',
    answer: 'No. All sales are strictly final and non-refundable due to the digital nature of instant software delivery and downloadable academic materials. Please review the plan features before purchasing.',
  },
];
