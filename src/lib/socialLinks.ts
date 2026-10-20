export interface SocialLink {
  id: string;
  name: string;
  url: string;
  label: string;
  ariaLabel: string;
  descriptor: string;
  actionText: string;
  iconType: 'portfolio' | 'linkedin' | 'facebook' | 'email';
}

export const socialLinks: SocialLink[] = [
  {
    id: 'email',
    name: 'Email',
    url: 'mailto:parthxcore@gmail.com',
    label: 'parthxcore@gmail.com',
    ariaLabel: 'Email Parth Arora directly at parthxcore@gmail.com',
    descriptor: 'Direct inquiries, purchase verification, and technical support.',
    actionText: 'Email Parth',
    iconType: 'email',
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    url: 'https://partharora-soc.vercel.app/',
    label: 'Portfolio',
    ariaLabel: "Parth's Portfolio website",
    descriptor: 'Explore SOC Analyst projects, automated OSINT workflows, and security tools.',
    actionText: 'View Portfolio',
    iconType: 'portfolio',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/parth-arora-1343b5368/',
    label: 'LinkedIn',
    ariaLabel: "Parth's LinkedIn profile",
    descriptor: 'Connect for threat intelligence research, SOC engineering, and cybersecurity updates.',
    actionText: 'Connect on LinkedIn',
    iconType: 'linkedin',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    url: 'https://www.facebook.com/share/1KE3Mhk7cf/',
    label: 'Facebook',
    ariaLabel: "Parth's Facebook profile",
    descriptor: 'Personal updates, cybersecurity community discussions, and industry networking.',
    actionText: 'Follow on Facebook',
    iconType: 'facebook',
  },
];
