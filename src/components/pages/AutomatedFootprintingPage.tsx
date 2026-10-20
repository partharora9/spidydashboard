import { useEffect } from 'react';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';
import { CtaBanner } from '../CtaBanner';
import { PageHero } from '../product/PageHero';
import { VisualProof } from '../product/VisualProof';
import { StepList, type WorkflowStep } from '../product/StepList';
import { FeatureGrid, type CapabilityItem } from '../product/FeatureGrid';
import { TargetPicker } from '../product/signatures/TargetPicker';
import { Callout } from '../product/Callout';
import { RelatedPages, type RelatedPageItem } from '../product/RelatedPages';
import { TechnicalGridPattern } from '../product/TechnicalGridPattern';
import { TerminalDemo, type TerminalOutputLine } from '../product/TerminalDemo';
import { Search, Globe, Server, Mail, User, Compass } from 'lucide-react';

export const AutomatedFootprintingPage = () => {
  useEffect(() => {
    document.title = 'Automated Footprinting — SpidyDashboard | Scan IPs, Emails, Usernames & CIDRs';
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const steps: WorkflowStep[] = [
    {
      step: '01',
      title: 'Target Validation & Profile Selection',
      description: 'Choose your seed target and scan profile. SpidyDashboard supports four verified engine profiles: All, Footprint, Investigate, and Passive.',
      badge: 'Profile Options',
      codeSnippet: '$ python sf.py -s targetcorp.com -u passive',
      details: ['Footprint: Perimeter asset expansion', 'Investigate: Deep threat & breach lookups', 'Passive: Stealth queries without target contact'],
    },
    {
      step: '02',
      title: 'Event-Driven Module Execution',
      description: 'The engine registers all modules matching your profile. Each discovered finding automatically triggers downstream modules that consume that data type.',
      badge: 'Event Streaming',
      codeSnippet: '[Event] DOMAIN_NAME -> sfp_dnsresolve -> IP_ADDRESS',
      details: ['Dynamic event queue processing', 'Monotonically increasing event sequence', 'Per-module rate-limit throttling'],
    },
    {
      step: '03',
      title: 'Active vs Passive Enforcement',
      description: 'When running in Passive mode, SpiderFoot strictly guarantees zero outbound packets touch the target infrastructure. Active mode is gated behind user consent.',
      badge: 'Safety Controls',
      codeSnippet: '[Safety] Passive mode active: 0 direct packets dispatched',
      details: ['Third-party API aggregation only', 'DNS cache & passive DNS querying', 'No SYN packets or HTTP crawler requests'],
    },
    {
      step: '04',
      title: 'Consolidated Footprint Export',
      description: 'Review the complete digital footprint in the interactive UI graph, search by entity type, or export structured datasets in CSV and JSON format.',
      badge: 'Report & API',
      codeSnippet: '$ python sf.py -s targetcorp.com -o json > footprint.json',
      details: ['Direct CSV, GEXF, and JSON exports', 'Automated summary breakdown by event class', 'Historical scan comparison diffs'],
    },
  ];

  const profiles: CapabilityItem[] = [
    {
      icon: <Compass className="w-6 h-6" />,
      title: 'Profile: Passive (Stealth)',
      description: 'Collects intelligence without sending a single packet to the target system. Queries search engines, public registries, and threat feeds only.',
      tag: '-u passive',
      specs: ['Zero target touch', 'Third-party queries only', 'No authorization required'],
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: 'Profile: Footprint',
      description: 'Comprehensive perimeter reconnaissance designed to identify network boundaries, owned IP blocks, subdomains, and cloud assets.',
      tag: '-u footprint',
      specs: ['DNS & BGP discovery', 'Certificate Transparency', 'Subdomain mapping'],
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: 'Profile: Investigate',
      description: 'Targeted investigations designed for threat hunting and incident response. Focuses on blacklists, leak dumps, and malicious activity.',
      tag: '-u investigate',
      specs: ['Abuse feeds & malware lists', 'Leaked credential lookups', 'Pastebin & dark web scrapers'],
    },
    {
      icon: <Server className="w-6 h-6" />,
      title: 'Profile: All Modules',
      description: 'Launches all 233 modules simultaneously for maximum intelligence gathering across every supported data category.',
      tag: '-u all',
      specs: ['233 active modules', 'Deep multi-layer chaining', 'Exhaustive data dump'],
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: 'Email & Identity Recon',
      description: 'Identify public email addresses, organizational contact records, PGP keys, and breach notifications associated with target domains.',
      tag: 'EMAILADDR',
      specs: ['Hunter & Clearbit lookups', 'Breach dump correlations', 'PGP key server search'],
    },
    {
      icon: <User className="w-6 h-6" />,
      title: 'Username Footprinting',
      description: 'Check username presence across 30+ developer communities, code repositories, and social platforms in seconds.',
      tag: 'USERNAME',
      specs: ['GitHub & GitLab profiles', 'Account presence validation', 'Cross-platform attribution'],
    },
  ];

  const terminalOutput: TerminalOutputLine[] = [
    { type: 'dim', text: '[*] Launching automated footprint scan against: targetcorp.com' },
    { type: 'info', text: '[*] Profile: passive | Total modules activated: 149 modules' },
    { type: 'accent', text: '[+] Target identified as INTERNET_NAME: targetcorp.com' },
    { type: 'info', text: '[*] Chaining events through passive DNS and Certificate Transparency...' },
    { type: 'accent', text: '[+] DISCOVERED: 38 subdomains, 4 mail exchangers, 12 nameservers' },
    { type: 'accent', text: '[+] DISCOVERED NETBLOCK: 198.51.100.0/24 (ASN 13335 Cloudflare)' },
    { type: 'info', text: '[*] Querying HaveIBeenPwned API for employee addresses on targetcorp.com...' },
    { type: 'warn', text: '[!] 3 corporate email addresses identified in historic third-party breach records' },
    { type: 'success', text: '[+] Footprint complete in 42.4s. 892 total events written to database.' },
  ];

  const relatedPages: RelatedPageItem[] = [
    {
      title: 'All 233 Modules',
      category: 'CATALOG',
      description: 'Browse all 233 data sources including Shodan, VirusTotal, HaveIBeenPwned, and Censys.',
      href: '/modules',
    },
    {
      title: 'Attack Surface Mapping',
      category: 'FEATURE',
      description: 'Visualize your footprint topology in interactive node graphs and export structured inventories.',
      href: '/features/attack-surface-mapping',
    },
    {
      title: 'REST API & CLI',
      category: 'DOCS',
      description: 'Automate footprint scans from scripts, cron jobs, and CI/CD security validation pipelines.',
      href: '/docs/rest-api-cli',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-[#0B0B14] font-sans antialiased selection:bg-blue-100 selection:text-blue-900 relative overflow-x-clip">
      <Navbar />

      <main className="relative flex flex-col items-center justify-start overflow-visible w-full">
        <TechnicalGridPattern />

        {/* Hero Section */}
        <PageHero
          category="AUTOMATED FOOTPRINTING"
          title="One target in, every digital footprint out"
          subtitle="Input domains, IP subnets, email addresses, usernames, or phone numbers. SpidyDashboard automates open source intelligence gathering across all public footprints."
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Features' },
            { label: 'Automated Footprinting' },
          ]}
          primaryCtaText="Get the source code"
          primaryCtaHref="/pricing"
          secondaryCtaText="Watch recon demo"
          onWatchWalkthrough={() => {
            const el = document.getElementById('visual-proof');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Visual Proof Section */}
        <div id="visual-proof" className="w-full">
          <VisualProof
            title="Automated Reconnaissance & Asset Footprinting"
            caption="Real-time multi-target footprinting pipeline executing across live OSINT modules."
            videoSrc="/videos/recon.mp4"
            posterSrc="/videos/recon-poster.jpg"
            imageSrc="/photos/about-hero.webp"
            metrics={[
              { label: 'Supported Targets', value: 'IP, CIDR, Email, Domain' },
              { label: 'Scan Profiles', value: 'Footprint, Investigate, Passive' },
              { label: 'Autonomous Chaining', value: 'Event -> Output -> Trigger' },
              { label: 'Execution Speed', value: 'Concurrent Thread Pool' },
            ]}
          />
        </div>

        {/* Signature Element: Interactive Target Picker */}
        <TargetPicker />

        {/* Honest Paragraph: Passive vs Active Modes */}
        <div className="w-full max-w-[1200px] mx-auto px-6 mt-16 sm:mt-20">
          <div className="p-8 sm:p-10 rounded-[24px] bg-[#F8F9FD] border border-black/[0.06] shadow-sm">
            <span className="text-[12px] font-mono font-semibold uppercase tracking-wider text-[#4F8FF7] block mb-2">
              ETHICAL SCANNING ARCHITECTURE
            </span>
            <h3 className="font-headline font-semibold text-[24px] sm:text-[30px] text-[#0B0B14]">
              Passive Stealth vs. Active Probing: Our Honest Distinction
            </h3>
            <p className="mt-4 font-sans text-[16px] sm:text-[17px] leading-[28px] text-[#444444]">
              SpiderFoot clearly segregates modules into <strong>Passive</strong> and <strong>Active</strong> modes. In <em>Passive mode</em>, the engine solely queries third-party servers, public registries, and search databases—sending exactly zero packets to your target. In <em>Active mode</em>, the engine directly contacts target IPs and hostnames to retrieve banner headers, test SSL handshakes, and verify open ports. Active scans create log entries on target firewalls and strictly require written permission before execution.
            </p>
          </div>
        </div>

        {/* Scan Profiles & Capabilities */}
        <FeatureGrid
          sectionTag="PROFILES & MODES"
          sectionTitle="Pre-Configured Reconnaissance Profiles"
          sectionSubtitle="Choose exactly how deep your scan reaches using SpiderFoot's real built-in execution use cases."
          features={profiles}
          columns={3}
        />

        {/* 4-Step Methodology */}
        <StepList
          sectionTag="PIPELINE EXECUTION"
          sectionTitle="How Seed Inputs Expand Into Footprints"
          sectionSubtitle="From validation to recursive event triggering, see how SpiderFoot orchestrates complex OSINT scans."
          steps={steps}
        />

        {/* Real CLI Output */}
        <section className="w-full max-w-[1200px] mx-auto px-6 mt-20 sm:mt-28">
          <div className="flex flex-col items-center text-center max-w-[760px] mx-auto mb-8">
            <span className="text-[12px] font-mono uppercase tracking-wider text-[#4F8FF7] font-semibold">
              TERMINAL CLI EXECUTION
            </span>
            <h3 className="font-headline font-semibold text-[28px] sm:text-[36px] text-[#0B0B14] mt-2">
              Lightweight Command-Line Footprinting
            </h3>
            <p className="mt-2 text-[15px] text-[#555555] font-sans">
              Run scans headless in automated scripts using SpiderFoot’s native <code>sf.py</code> CLI tool.
            </p>
          </div>

          <TerminalDemo
            title="spiderfoot-cli — passive footprint"
            command="python sf.py -s targetcorp.com -u passive -o json"
            outputLines={terminalOutput}
          />
        </section>

        {/* Authorized Use Callout */}
        <div className="w-full max-w-[1200px] mx-auto px-6 mt-12">
          <Callout type="authorized">
            Always obtain explicit written permission before running active footprint scans against networks or systems you do not own. Passive footprinting does not contact target infrastructure, but must always comply with local regulations and terms of service.
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

export default AutomatedFootprintingPage;
