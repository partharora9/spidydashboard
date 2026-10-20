export interface BioBlock {
  id: string;
  title: string;
  iconType: 'offense' | 'defense';
  description: string;
  tags: string[];
}

export interface DeveloperBioData {
  sectionTitle: string;
  sectionSubtitle: string;
  name: string;
  role: string;
  monogram: string;
  quote: string;
  intro: string;
  blocks: BioBlock[];
  closing: string;
}

export const developerBioData: DeveloperBioData = {
  sectionTitle: 'Meet the Developer',
  sectionSubtitle: 'Behind the Dashboard',
  name: 'Parth Arora',
  role: 'Cybersecurity Practitioner',
  monogram: 'PA',
  quote:
    'Parth Arora, cybersecurity practitioner and creator of spidydashboard, an OSINT and attack surface dashboard.',
  intro:
    "I'm a cybersecurity practitioner focused on both sides of the problem: how attackers get in, and how defenders see them coming.",
  blocks: [
    {
      id: 'offense',
      title: 'Offense: How Attackers Get In',
      iconType: 'offense',
      description:
        'My offensive work covers adversary emulation, attack surface discovery and exploit validation. I reproduce real attacker techniques, map what an outsider can see, and prove which weaknesses can actually be exploited, so teams fix what matters first.',
      tags: ['Adversary Emulation', 'Attack Surface Discovery', 'Exploit Validation'],
    },
    {
      id: 'defense',
      title: 'Defense: How Defenders See Them Coming',
      iconType: 'defense',
      description:
        'On the defensive side, I work in detection engineering, threat intelligence, SIEM correlation and DFIR. I turn what I find into detections that fire on attacker behavior, link scattered events into one clear story, and reconstruct incidents from the evidence.',
      tags: ['Detection Engineering', 'Threat Intelligence', 'SIEM Correlation', 'DFIR'],
    },
  ],
  closing: 'I keep my skills sharp through hands-on labs and challenges on TryHackMe.',
};
