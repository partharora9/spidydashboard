export interface ComparisonRow {
  label: string;
  tooltip: string;
  standard: boolean | string;
  complete: boolean | string;
}

export interface ComparisonGroup {
  title: string;
  rows: ComparisonRow[];
}

export const comparisonGroups: ComparisonGroup[] = [
  {
    title: 'Dashboard',
    rows: [
      {
        label: 'Source code',
        tooltip: 'The full SpidyDashboard project files.',
        standard: false,
        complete: true,
      },
      {
        label: 'Setup guide',
        tooltip: 'Step-by-step instructions to run it on your computer.',
        standard: true,
        complete: true,
      },
      {
        label: 'Walkthrough video',
        tooltip: 'A recorded tour of the dashboard and its modules.',
        standard: true,
        complete: true,
      },
      {
        label: 'Instant download',
        tooltip: 'Direct download link delivered upon connecting.',
        standard: true,
        complete: true,
      },
    ],
  },
  {
    title: 'Submission kit',
    rows: [
      {
        label: 'Project report',
        tooltip: 'A ready-to-edit report for your submission.',
        standard: false,
        complete: true,
      },
      {
        label: 'PPT presentation',
        tooltip: 'A presentation for your project review.',
        standard: false,
        complete: true,
      },
      {
        label: 'Viva questions and answers',
        tooltip: 'Common questions and answers for your viva.',
        standard: false,
        complete: true,
      },
    ],
  },
  {
    title: 'Price',
    rows: [
      {
        label: 'One-time price',
        tooltip: 'Single payment with lifetime access to downloaded files.',
        standard: '₹499',
        complete: '₹799',
      },
      {
        label: 'Subscription',
        tooltip: 'Zero recurring charges, renewals, or lock-in.',
        standard: 'None',
        complete: 'None',
      },
    ],
  },
];
