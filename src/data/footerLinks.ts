export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumnData {
  title: string;
  links: FooterLink[];
}

export const footerColumnsData: FooterColumnData[] = [
  {
    title: 'PRODUCT',
    links: [
      { label: 'Attack Surface Mapping', href: '/features/attack-surface-mapping' },
      { label: 'Threat Intelligence', href: '/features/threat-intelligence' },
      { label: 'Automated Footprinting', href: '/features/automated-footprinting' },
      { label: 'All 233 Modules', href: '/modules' },
      { label: 'Pricing & Source Code', href: '/pricing' },
    ],
  },
  {
    title: 'DOCS',
    links: [
      { label: 'Getting Started Guide', href: '/docs/getting-started' },
      { label: 'REST API & CLI', href: '/docs/rest-api-cli' },
      { label: 'Custom Modules & SDK', href: '/modules/custom-sdk' },
      { label: 'Troubleshooting', href: '/docs/getting-started#troubleshooting' },
    ],
  },
  {
    title: 'ABOUT US',
    links: [
      { label: 'About SpidyDashboard', href: '/about' },
      { label: 'Meet the Developer', href: '/about#developer' },
      { label: 'Security & Privacy', href: '/about#security' },
    ],
  },
  {
    title: 'LEGAL & OPEN SOURCE',
    links: [
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Privacy Policy (DPDP 2023)', href: '/privacy' },
      { label: 'Software License', href: '/license' },
      { label: 'Authorized Testing Notice', href: '/docs/getting-started#authorized-use' },
    ],
  },
];

