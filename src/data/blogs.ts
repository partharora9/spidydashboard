export interface BlogPost {
  id: string;
  category: 'PRODUCTIVITY' | 'NEWSLETTER' | 'TECHNOLOGY';
  categoryBg: string;
  title: string;
  excerpt: string;
  author: {
    name: string;
    avatarId: 'rudra' | 'mahmud' | 'david' | 'veronika';
    date: string;
    readTime: string;
  };
  coverType: 'wires' | 'wave' | 'ribbons' | 'droplet' | 'sphere' | 'golden';
}

export const blogsData: BlogPost[] = [
  {
    id: 'blog-1',
    category: 'TECHNOLOGY',
    categoryBg: '#E6E4F8',
    title: 'How to map your attack surface with OSINT',
    excerpt: 'Discover every exposed subdomain, public service, and open port before threat actors take advantage.',
    author: {
      name: 'Rudra Gosh',
      avatarId: 'rudra',
      date: 'October 12, 2026',
      readTime: '6 min read',
    },
    coverType: 'wires',
  },
  {
    id: 'blog-2',
    category: 'NEWSLETTER',
    categoryBg: '#FBE3DA',
    title: '10 data sources every investigator should use',
    excerpt: 'From passive DNS and certificate transparency to threat feeds and leak dumps—the essential OSINT sources.',
    author: {
      name: 'Mahmud Niloy',
      avatarId: 'mahmud',
      date: 'October 8, 2026',
      readTime: '7 min read',
    },
    coverType: 'wave',
  },
  {
    id: 'blog-3',
    category: 'PRODUCTIVITY',
    categoryBg: '#DDE6F8',
    title: 'Automating reconnaissance with SpidyDashboard',
    excerpt: 'How automated module correlation turns raw network footprints into prioritized security findings in minutes.',
    author: {
      name: 'David Henricks',
      avatarId: 'david',
      date: 'September 29, 2026',
      readTime: '8 min read',
    },
    coverType: 'ribbons',
  },
  {
    id: 'blog-4',
    category: 'TECHNOLOGY',
    categoryBg: '#E6E4F8',
    title: 'Passive DNS vs Active Scanning: Which is Safer?',
    excerpt: 'Understand how to gather complete intelligence without triggering perimeter alerts or firewall defenses.',
    author: {
      name: 'David Henricks',
      avatarId: 'david',
      date: 'September 22, 2026',
      readTime: '5 min read',
    },
    coverType: 'droplet',
  },
  {
    id: 'blog-5',
    category: 'PRODUCTIVITY',
    categoryBg: '#DDE6F8',
    title: 'Detecting Leaked Credentials Before Breach Notifications',
    excerpt: 'How automated credential monitoring safeguards employee identities across dark web dump forums.',
    author: {
      name: 'Veronika Belova',
      avatarId: 'veronika',
      date: 'September 15, 2026',
      readTime: '6 min read',
    },
    coverType: 'sphere',
  },
  {
    id: 'blog-6',
    category: 'NEWSLETTER',
    categoryBg: '#FBE3DA',
    title: 'Correlating Threat Intelligence Across 200+ Modules',
    excerpt: 'A deep dive into cross-module entity graph resolution and automated false-positive reduction.',
    author: {
      name: 'Rudra Gosh',
      avatarId: 'rudra',
      date: 'September 4, 2026',
      readTime: '9 min read',
    },
    coverType: 'golden',
  },
];
