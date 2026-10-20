import rawModules from './modules.json';

export interface ModuleItem {
  module: string;
  name: string;
  description: string;
  service?: string;
  base_url?: string;
  needs_key: string | boolean;
  key_option?: string;
  all_key_options?: string[];
  events_in?: string[];
  events_out?: string[];
  endpoints_called?: string[];
  rate_limits?: string;
  categories?: string[];
  use_cases?: string[];
}

export interface ModuleRecord {
  id: string;
  name: string;
  description: string;
  category: string;
  categories: string[];
  needsKey: boolean;
  keyOption?: string;
  useCases: string[];
  eventsIn: string[];
  eventsOut: string[];
  baseUrl?: string;
  isPopular: boolean;
}

const POPULAR_IDS = new Set([
  'sfp_shodan',
  'sfp_virustotal',
  'sfp_haveibeenpwned',
  'sfp_censys',
  'sfp_greynoise',
  'sfp_hunter',
  'sfp_dnsresolve',
  'sfp_whois',
  'sfp_sublist3r',
  'sfp_securitytrails',
  'sfp_abuseipdb',
  'sfp_otx',
]);

export const modulesList: ModuleRecord[] = (rawModules as ModuleItem[]).map((m) => {
  const needsKey = m.needs_key === true || m.needs_key === 'true';
  const categories = Array.isArray(m.categories) && m.categories.length > 0
    ? m.categories
    : ['General Recon'];
  const category = categories[0];
  const isPopular = POPULAR_IDS.has(m.module);

  return {
    id: m.module,
    name: m.name || m.module.replace(/^sfp_/, ''),
    description: m.description || 'Automated reconnaissance and threat intelligence data module.',
    category,
    categories,
    needsKey,
    keyOption: m.key_option && m.key_option !== 'none' ? m.key_option : undefined,
    useCases: Array.isArray(m.use_cases) && m.use_cases.length > 0 ? m.use_cases : ['Investigate'],
    eventsIn: Array.isArray(m.events_in) ? m.events_in : [],
    eventsOut: Array.isArray(m.events_out) ? m.events_out : [],
    baseUrl: m.base_url && !m.base_url.includes('free / no external') ? m.base_url : undefined,
    isPopular,
  };
});

export const TOTAL_MODULES_COUNT = modulesList.length; // 233
export const KEY_REQUIRED_COUNT = modulesList.filter((m) => m.needsKey).length; // 84
export const FREE_MODULES_COUNT = modulesList.filter((m) => !m.needsKey).length; // 149

export const ALL_CATEGORIES = Array.from(
  new Set(modulesList.flatMap((m) => m.categories))
).sort();
