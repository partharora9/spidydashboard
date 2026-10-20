/**
 * Build Script: scripts/buildModules.ts
 * Reads SpiderFoot module metadata from the engine catalog / module files
 * and outputs an optimized src/data/modules.json for the ModuleTable and documentation.
 *
 * Usage:
 *   npx tsx scripts/buildModules.ts
 */

import * as fs from 'fs';
import * as path from 'path';

export interface RawModule {
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

export interface FormattedModule {
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
  isPopular?: boolean;
}

const CANDIDATE_SOURCES = [
  path.resolve(process.cwd(), '../New ONe/docs/api/modules-apis.json'),
  path.resolve(process.cwd(), 'src/data/modules.json'),
];

const POPULAR_MODULE_IDS = new Set([
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

function buildModules() {
  let sourcePath: string | null = null;
  for (const candidate of CANDIDATE_SOURCES) {
    if (fs.existsSync(candidate)) {
      sourcePath = candidate;
      break;
    }
  }

  if (!sourcePath) {
    console.error('Error: Could not locate modules-apis.json in candidate locations.');
    process.exit(1);
  }

  console.log(`Reading module catalog from: ${sourcePath}`);
  const rawData: RawModule[] = JSON.parse(fs.readFileSync(sourcePath, 'utf-8'));

  const formatted: FormattedModule[] = rawData.map((m) => {
    const needsKey = m.needs_key === true || m.needs_key === 'true';
    const categories = Array.isArray(m.categories) && m.categories.length > 0
      ? m.categories
      : ['General Recon'];
    const primaryCategory = categories[0];
    const isPopular = POPULAR_MODULE_IDS.has(m.module);

    return {
      id: m.module,
      name: m.name || m.module.replace(/^sfp_/, ''),
      description: m.description || 'SpiderFoot reconnaissance and intelligence module.',
      category: primaryCategory,
      categories,
      needsKey,
      keyOption: m.key_option && m.key_option !== 'none' ? m.key_option : undefined,
      useCases: Array.isArray(m.use_cases) ? m.use_cases : ['Investigate'],
      eventsIn: Array.isArray(m.events_in) ? m.events_in : [],
      eventsOut: Array.isArray(m.events_out) ? m.events_out : [],
      baseUrl: m.base_url && !m.base_url.includes('free / no external') ? m.base_url : undefined,
      isPopular,
    };
  });

  const outputPath = path.resolve(process.cwd(), 'src/data/modules.json');
  fs.writeFileSync(outputPath, JSON.stringify(rawData, null, 2), 'utf-8');

  console.log(`Successfully validated and formatted ${formatted.length} modules!`);
  console.log(`- API Key Required: ${formatted.filter((m) => m.needsKey).length}`);
  console.log(`- Free / No Key: ${formatted.filter((m) => !m.needsKey).length}`);
  console.log(`Output written to: ${outputPath}`);
}

buildModules();
