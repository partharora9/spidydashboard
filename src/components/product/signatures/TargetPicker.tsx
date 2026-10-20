import { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Server, Mail, User, Terminal, CheckCircle } from 'lucide-react';

type TargetType = 'domain' | 'ip' | 'email' | 'username';

interface TargetPreset {
  type: TargetType;
  label: string;
  icon: typeof Globe;
  placeholder: string;
  sampleInput: string;
  cliCommand: string;
  passiveArtifacts: string[];
  activeArtifacts: string[];
}

const PRESETS: Record<TargetType, TargetPreset> = {
  domain: {
    type: 'domain',
    label: 'Domain Name',
    icon: Globe,
    placeholder: 'example.com',
    sampleInput: 'targetsecurity.com',
    cliCommand: 'python sf.py -s targetsecurity.com -u passive -o json',
    passiveArtifacts: [
      'DNS records (A, AAAA, MX, TXT, NS, SOA, CAA)',
      'Subdomains from Certificate Transparency (crt.sh, Censys)',
      'WHOIS registrar, registrant organization, expiry dates',
      'Leaked employee credentials in public dump records',
      'Associated cloud buckets (S3, Azure Blob, GCS)',
      'Associated netblocks & Autonomous System Numbers (ASN)',
    ],
    activeArtifacts: [
      'Port scan of common TCP/UDP perimeter ports',
      'Web server HTTP banner grabbing & software fingerprinting',
      'DNS zone transfer verification (AXFR queries)',
      'Active TLS cipher evaluation & certificate expiration tests',
    ],
  },
  ip: {
    type: 'ip',
    label: 'IP / CIDR Netblock',
    icon: Server,
    placeholder: '198.51.100.0/24 or 203.0.113.15',
    sampleInput: '198.51.100.0/24',
    cliCommand: 'python sf.py -s 198.51.100.0/24 -u footprint -o csv',
    passiveArtifacts: [
      'BGP prefix routing origin & ISP organization',
      'Reverse PTR DNS hostnames for every allocated IP',
      'Historical Shodan and Censys telemetry records',
      'Spamhaus & AbuseIPDB blocklist checks',
      'GeoIP coordinates, country code, and city location',
    ],
    activeArtifacts: [
      'Live ping / ICMP echo host reachability sweep',
      'SYN packet inspection across standard perimeter ports',
      'SNMP community string probe and service banner fetch',
    ],
  },
  email: {
    type: 'email',
    label: 'Email Address',
    icon: Mail,
    placeholder: 'analyst@domain.com',
    sampleInput: 'ciso@targetcorp.io',
    cliCommand: 'python sf.py -s ciso@targetcorp.io -u investigate -o json',
    passiveArtifacts: [
      'HaveIBeenPwned & Dehashed breach event timestamps',
      'Public PGP keys and S/MIME key servers',
      'Affiliated social profile identifiers across 30+ networks',
      'Gravatar photo hashes and associated usernames',
      'Email domain SPF, DMARC, and DKIM configuration records',
    ],
    activeArtifacts: [
      'SMTP RCPT TO validation verifying active mailbox existence',
      'Catch-all server behavior verification',
    ],
  },
  username: {
    type: 'username',
    label: 'Username / Handle',
    icon: User,
    placeholder: 'partharora_soc',
    sampleInput: 'security_analyst',
    cliCommand: 'python sf.py -s security_analyst -u passive -o json',
    passiveArtifacts: [
      'Account existence across GitHub, GitLab, Docker Hub, Twitter',
      'Public code repositories, forks, and commit history',
      'Associated profile avatar image URLs & bio descriptions',
      'Historical pastebin posts referencing the username handle',
    ],
    activeArtifacts: [
      'HTTP status check on target profile endpoints',
    ],
  },
};

export const TargetPicker = () => {
  const [selectedType, setSelectedType] = useState<TargetType>('domain');
  const [mode, setMode] = useState<'passive' | 'active'>('passive');

  const current = PRESETS[selectedType];
  const displayedArtifacts =
    mode === 'passive'
      ? current.passiveArtifacts
      : [...current.passiveArtifacts, ...current.activeArtifacts];

  return (
    <section className="relative w-full max-w-[1200px] mx-auto px-6 mt-20 sm:mt-28 overflow-visible select-none">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center max-w-[800px] mx-auto mb-12">
        <div className="inline-flex items-center gap-2 border border-[#0B0B14] rounded-full px-3.5 py-1 mb-4 bg-transparent">
          <span className="font-sans text-[12px] font-medium tracking-[0.06em] uppercase text-[#0B0B14]">
            TARGET ARTIFACT DISCOVERY
          </span>
        </div>
        <h2 className="font-headline font-semibold text-[32px] sm:text-[44px] text-[#0B0B14] tracking-[-0.03em] leading-tight">
          One Target In, Every Footprint Out
        </h2>
        <p className="mt-3 font-sans text-[16px] text-[#555555]">
          Select an entity target type below to see how SpidyDashboard automatically expands single seed inputs into exhaustive asset footprints.
        </p>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-8 p-1.5 rounded-full bg-[#F5F5F7] border border-black/[0.06]">
          {(['domain', 'ip', 'email', 'username'] as TargetType[]).map((t) => {
            const Icon = PRESETS[t].icon;
            const isSelected = selectedType === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setSelectedType(t)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-sans text-[13px] sm:text-[14px] font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white text-[#4F8FF7] shadow-[0_2px_10px_rgba(0,0,0,0.08)]'
                    : 'text-[#555555] hover:text-[#0B0B14]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{PRESETS[t].label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full bg-[#0B0F19] rounded-[24px] border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.3)] p-6 sm:p-9 text-white">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Seed Input & Mode Controls */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div>
              {/* Seed Target Input Card */}
              <div className="p-5 rounded-2xl bg-[#141824] border border-white/[0.08]">
                <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400 block mb-2">
                  Seed Target Identifier
                </span>
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#0B0F19] border border-white/[0.1] text-white font-mono text-[15px]">
                  <span className="text-[#4F8FF7]">&gt;</span>
                  <input
                    type="text"
                    readOnly
                    value={current.sampleInput}
                    className="bg-transparent text-white outline-none w-full font-mono cursor-default"
                  />
                </div>
              </div>

              {/* Passive vs Active Toggle */}
              <div className="mt-5 p-5 rounded-2xl bg-[#141824] border border-white/[0.08]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[12px] font-mono uppercase tracking-wider text-gray-300 font-semibold">
                    Scan Methodology
                  </span>
                  <span className="text-[11px] font-mono text-[#38BDF8]">
                    {mode === 'passive' ? 'Passive Only (Stealth)' : 'Active (Direct Contact)'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#0B0F19]">
                  <button
                    type="button"
                    onClick={() => setMode('passive')}
                    className={`py-2 rounded-lg font-mono text-[12px] font-medium transition-all cursor-pointer ${
                      mode === 'passive'
                        ? 'bg-[#4F8FF7] text-white shadow-sm'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Passive Mode
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('active')}
                    className={`py-2 rounded-lg font-mono text-[12px] font-medium transition-all cursor-pointer ${
                      mode === 'active'
                        ? 'bg-[#F59E0B] text-white shadow-sm'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Active Mode
                  </button>
                </div>

                <p className="mt-3 text-[12px] text-gray-400 font-sans leading-relaxed">
                  {mode === 'passive'
                    ? 'Passive mode queries only public registries, search engines, and third-party threat feeds. Never touches the target system.'
                    : 'Active mode directly interacts with target IPs/ports (banners, certificates, probes). Requires written authorization before scanning.'}
                </p>
              </div>
            </div>

            {/* CLI Command Generator */}
            <div className="p-4 rounded-xl bg-[#07090E] border border-white/[0.06] text-[12px] font-mono">
              <span className="text-gray-500 block mb-1">CLI Execution:</span>
              <code className="text-[#10B981] break-all">{current.cliCommand}</code>
            </div>
          </div>

          {/* Right Column: Discovered Artifact Output Tree */}
          <div className="lg:col-span-7 bg-[#141824] p-6 sm:p-7 rounded-2xl border border-white/[0.08]">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#4F8FF7]" />
                <span className="font-headline font-semibold text-[16px] text-white">
                  Discovered Digital Artifacts
                </span>
              </div>
              <span className="text-[12px] font-mono text-emerald-400">
                {displayedArtifacts.length} Artifact Classes
              </span>
            </div>

            {/* List */}
            <div className="mt-5 space-y-3">
              {displayedArtifacts.map((artifact, i) => (
                <motion.div
                  key={artifact}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-[#0B0F19] border border-white/[0.05] text-[13px] sm:text-[14px]"
                >
                  <CheckCircle className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                  <span className="font-sans text-gray-200">{artifact}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
