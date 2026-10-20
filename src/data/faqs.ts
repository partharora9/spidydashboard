export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const faqsData: FaqItem[] = [
  {
    id: 'subscription',
    question: 'Is this a subscription?',
    answer: 'No. You pay once and download the files. There are no monthly or yearly fees.',
  },
  {
    id: 'delivery',
    question: 'How do I buy and receive the files?',
    answer: 'Simply connect on parthxcore@gmail.com. Parth Arora will provide direct payment details and share immediate access to your package and walkthrough video.',
  },
  {
    id: 'hosting',
    question: 'Do I need to host it myself?',
    answer: 'Yes. The setup guide and walkthrough video show you how to run SpidyDashboard on your own computer.',
  },
  {
    id: 'difference',
    question: 'What is the difference between Standard and Complete kit?',
    answer: 'Standard includes the step-by-step setup guide, walkthrough video, and documentation. Complete kit includes the full dashboard source code, project report, PPT presentation, and viva questions and answers.',
  },
  {
    id: 'scanning-policy',
    question: 'Can I scan any website or IP address?',
    answer: 'No. Scan only systems you own or have written permission to test. The code is for learning and authorized security testing.',
  },
  {
    id: 'refunds',
    question: 'Can I get a refund?',
    answer: 'No. All sales are strictly final and non-refundable due to the digital nature of software source code and immediate delivery. Please review the plan features and documentation before purchasing.',
  },
];
