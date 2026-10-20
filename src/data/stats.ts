import type { LucideIcon } from 'lucide-react';
import { Layers, FolderGit2, Wrench } from 'lucide-react';

export interface StatItem {
  id: string;
  icon: LucideIcon;
  iconName: string;
  label: string;
  value: number;
}

export const statsData: StatItem[] = [
  {
    id: 'security-disciplines',
    icon: Layers,
    iconName: 'Layers',
    label: 'Security disciplines',
    value: 7,
  },
  {
    id: 'security-projects',
    icon: FolderGit2,
    iconName: 'FolderGit2',
    label: 'Security projects',
    value: 4,
  },
  {
    id: 'stack-tools',
    icon: Wrench,
    iconName: 'Wrench',
    label: 'Tools in my stack',
    value: 12,
  },
];
