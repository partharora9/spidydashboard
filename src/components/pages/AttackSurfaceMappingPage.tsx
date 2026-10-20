import { useEffect } from 'react';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';
import { CtaBanner } from '../CtaBanner';
import { PageHero } from '../product/PageHero';
import { VisualProof } from '../product/VisualProof';
import { StepList, type WorkflowStep } from '../product/StepList';
import { FeatureGrid, type CapabilityItem } from '../product/FeatureGrid';
import { AttackSurfaceGraph } from '../product/signatures/AttackSurfaceGraph';
import { Callout } from '../product/Callout';
import { RelatedPages, type RelatedPageItem } from '../product/RelatedPages';
import { TechnicalGridPattern } from '../product/TechnicalGridPattern';
import { TerminalDemo, type TerminalOutputLine } from '../product/TerminalDemo';
import { Globe, Server, ShieldCheck, Database, Layers, Lock } from 'lucide-react';

export const AttackSurfaceMappingPage = () => {
  useEffect(() => {
    document.title = 'Attack Surface Mapping — SpidyDashboard | Discover Exposed Assets & Subdomains';
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const steps: WorkflowStep[] = [
    {
      step: '01',
      title: 'Seed Domain Registration',
      description: 'Input any domain, hostname, or IP netblock. SpidyDashboard automatically resolves DNS authorities, registrars, and CIDRs.',
      badge: 'sfp_dnsresolve',
      codeSnippet: '$ python sf.py -s targetcorp.com -u footprint',
      details: ['Validates Public Suffix List', 'Extracts root SOA & NS records', 'Detects DNS wildcard responses'],
    },
    {
      step: '02',
      title: 'Subdomain Enumeration',
      description: 'Queries Certificate Transparency logs, passive DNS databases, search dorks, and brute-force lists simultaneously.',
      badge: 'sfp_crt / sfp_sublist3r',
      codeSnippet: '[sfp_crt] Found: api.targetcorp.com (SAN: *.targetcorp.com)',
      details: ['crt.sh & Censys CT query', 'Baidu, Bing, Google & Yahoo dorks', 'Subdomain permuting & mutation'],
    },
    {
      step: '03',
      title: 'Infrastructure & Port Mapping',
      description: 'Resolves all identified hostnames to IPv4/IPv6 addresses, traces Autonomous Systems (ASNs), and discovers open ports.',
      badge: 'sfp_portscan / sfp_shodan',
      codeSnippet: '[sfp_portscan] 198.51.100.24:443 (HTTPS), 8443 (Alt-Admin)',
      details: ['GeoIP & ASN attribution', 'SSL/TLS certificate inspection', 'Banner & header fingerprinting'],
    },
    {
      step: '04',
      title: 'Unified Asset Inventory',
      description: 'Groups raw events into a structured graph database with deduplication, change tracking, and exportable inventory views.',
      badge: 'SQLite + WAL Engine',
      codeSnippet: '[sfp__stor_db] 1,420 events aggregated across 14 asset classes',
      details: ['CSV and JSON export formats', 'Entity relationship graph', 'Automated false-positive filtering'],
    },
  ];

  const capabilities: CapabilityItem[] = [
    {
      icon: <Globe className="w-6 h-6" />,
      title: 'Subdomain Discovery',
      description: 'Exhaustive horizontal and vertical enumeration across public search indexes, Certificate Transparency, and passive DNS.',
      tag: 'DNS_RECORD',
      specs: ['Wildcard Detection', 'SAN Certificate Parsing', 'DNSSEC Validation'],
    },
    {
      icon: <Server className="w-6 h-6" />,
      title: 'IP & ASN Attribution',
      description: 'Map subdomains to live hosting providers, cloud infrastructures (AWS, Azure, GCP), and dedicated origin servers.',
      tag: 'BGP_AS_OWNER',
      specs: ['CIDR Netblock Grouping', 'Historical PTR Lookups', 'ISP & ASN Tracking'],
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: 'Port & Service Fingerprinting',
      description: 'Identify exposed admin dashboards, API gateways, SSH servers, and unencrypted legacy endpoints across perimeters.',
      tag: 'TCP_PORT_OPEN',
      specs: ['Banner Grabbing', 'Web Application Profiling', 'Service Version Checks'],
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: 'SSL/TLS Health & Expiry',
      description: 'Inspect certificate chains, check validity dates, identify expiring certificates, and catch weak cipher configurations.',
      tag: 'SSL_CERTIFICATE',
      specs: ['Expiring Certificate Alerts', 'Self-Signed Detection', 'Subject Alt Names'],
    },
    {
      icon: <Layers className="w-6 h-6" />,
      title: 'Technology Stack Detection',
      description: 'Detect underlying web frameworks, content management systems, analytics tags, and web servers from public responses.',
      tag: 'WEB_ANALYTICS_ID',
      specs: ['WhatWeb Module', 'Wappalyzer Signatures', 'HTTP Response Headers'],
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: 'Continuous Asset Inventory',
      description: 'Track asset sprawl over time. Compare historical scans to instantly spot newly exposed subdomains or decommissioned hosts.',
      tag: 'ASSET_INVENTORY',
      specs: ['Scan Comparison Diff', 'Historical Graph Tracking', 'JSON / CSV Export'],
    },
  ];

  const terminalOutput: TerminalOutputLine[] = [
    { type: 'dim', text: '[*] SpiderFoot 4.0.0 initializing scan [SF_SCAN_8941] against target.com...' },
    { type: 'info', text: '[*] Module sfp_dnsresolve loaded: 23 DNS records identified' },
    { type: 'accent', text: '[+] DISCOVERED SUBDOMAIN: api.target.com (A: 104.21.55.19)' },
    { type: 'accent', text: '[+] DISCOVERED SUBDOMAIN: auth.target.com (A: 198.51.100.44)' },
    { type: 'accent', text: '[+] DISCOVERED SUBDOMAIN: vpn.target.com (A: 198.51.100.44)' },
    { type: 'info', text: '[*] Module sfp_sslcert parsing PEM certificates for api.target.com...' },
    { type: 'warn', text: '[!] SSL CERTIFICATE EXPIRING: vpn.target.com cert expires in 14 days (issuer: Let\'s Encrypt)' },
    { type: 'accent', text: '[+] OPEN PORT DETECTED: 198.51.100.44:8443 (Management Console)' },
    { type: 'success', text: '[+] Scan finished: 1,420 events, 42 unique assets cataloged into asset inventory.' },
  ];

  const relatedPages: RelatedPageItem[] = [
    {
      title: 'Threat Intelligence',
      category: 'FEATURE',
      description: 'Correlate perimeter assets against 200+ threat feeds, blocklists, and vulnerability databases.',
      href: '/features/threat-intelligence',
    },
    {
      title: 'All 233 Modules',
      category: 'CATALOG',
      description: 'Explore the full list of 233 SpiderFoot modules for DNS, WHOIS, search dorks, and network recon.',
      href: '/modules',
    },
    {
      title: 'Getting Started Guide',
      category: 'DOCS',
      description: 'Launch your first automated attack surface scan in under two minutes with python run.py.',
      href: '/docs/getting-started',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-[#0B0B14] font-sans antialiased selection:bg-blue-100 selection:text-blue-900 relative overflow-x-clip">
      <Navbar />

      <main className="relative flex flex-col items-center justify-start overflow-visible w-full">
        <TechnicalGridPattern />

        {/* Hero Section */}
        <PageHero
          category="ATTACK SURFACE MAPPING"
          title="Map everything an outsider can see"
          subtitle="Discover exposed subdomains, IP ranges, open management ports, SSL certificates, and shadow IT infrastructure before adversaries do."
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Features' },
            { label: 'Attack Surface Mapping' },
          ]}
          primaryCtaText="Get Student Edition"
          primaryCtaHref="/pricing"
          secondaryCtaText="Watch the walkthrough"
          onWatchWalkthrough={() => {
            const el = document.getElementById('visual-proof');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Visual Proof Section */}
        <div id="visual-proof" className="w-full">
          <VisualProof
            title="Attack Surface Mapping & Topology"
            caption="Verified dashboard telemetry from active SpiderFoot attack surface reconnaissance."
            videoSrc="/videos/dashboard.mp4"
            posterSrc="/videos/dashboard-poster.jpg"
            imageSrc="/photos/about-hero.webp"
            metrics={[
              { label: 'Discovered Assets', value: '1,420 Assets' },
              { label: 'Discovery Depth', value: 'Subdomains -> IPs -> Ports' },
              { label: 'Modules Running', value: 'sfp_crt, sfp_dns, sfp_shodan' },
              { label: 'Storage', value: 'SQLite / JSON / CSV' },
            ]}
          />
        </div>

        {/* Signature Element: Interactive Node Graph */}
        <AttackSurfaceGraph />

        {/* How It Works: 4 Step Pipeline */}
        <StepList
          sectionTag="RECONNAISSANCE PIPELINE"
          sectionTitle="From Seed Target to Asset Inventory"
          sectionSubtitle="How SpidyDashboard turns a single domain into an exhaustive, structured inventory of exposed infrastructure."
          steps={steps}
        />

        {/* Capability Grid */}
        <FeatureGrid
          sectionTag="CAPABILITIES"
          sectionTitle="What Gets Discovered on Your Perimeter"
          sectionSubtitle="Automated intelligence gathering across every layer of public and internet-facing infrastructure."
          features={capabilities}
          columns={3}
        />

        {/* Terminal Real Output Demo */}
        <section className="w-full max-w-[1200px] mx-auto px-6 mt-20 sm:mt-28">
          <div className="flex flex-col items-center text-center max-w-[760px] mx-auto mb-8">
            <span className="text-[12px] font-mono uppercase tracking-wider text-[#4F8FF7] font-semibold">
              REAL CLI EXECUTION
            </span>
            <h3 className="font-headline font-semibold text-[28px] sm:text-[36px] text-[#0B0B14] mt-2">
              Verifiable Reconnaissance Output
            </h3>
            <p className="mt-2 text-[15px] text-[#555555] font-sans">
              Every finding originates from transparent Python modules with direct references to underlying network evidence.
            </p>
          </div>

          <TerminalDemo
            title="spidydashboard-cli — scan execution"
            command="python sf.py -s target.com -u footprint -o json"
            outputLines={terminalOutput}
          />
        </section>

        {/* Authorized Use Callout */}
        <div className="w-full max-w-[1200px] mx-auto px-6 mt-12">
          <Callout type="authorized">
            Only perform reconnaissance scans against domains, netblocks, and assets that you own or have explicit written authorization to evaluate. Passive scanning queries public records; active scanning sends probes directly to target hosts.
          </Callout>
        </div>

        {/* Related Pages */}
        <RelatedPages pages={relatedPages} />

        {/* Shared CTA Banner */}
        <CtaBanner />

        {/* Shared Footer */}
        <Footer />
      </main>
    </div>
  );
};

export default AttackSurfaceMappingPage;
