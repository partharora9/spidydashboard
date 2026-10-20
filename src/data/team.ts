import { socialLinks } from '../lib/socialLinks';

export interface TeamMemberLink {
  label: string;
  url: string;
  ariaLabel: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  linkedin: string;
  links: TeamMemberLink[];
}

export const teamMembers: TeamMember[] = [
  {
    id: 'parth-arora',
    name: 'Parth Arora',
    role: 'SOC ANALYST',
    linkedin: 'https://www.linkedin.com/in/parth-arora-1343b5368/',
    links: socialLinks.map((s) => ({
      label: s.label,
      url: s.url,
      ariaLabel: s.ariaLabel,
    })),
  },
];
