import { useEffect } from 'react';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';
import { CtaBanner } from '../CtaBanner';
import { PageHero } from '../product/PageHero';
import { VisualProof } from '../product/VisualProof';
import { StepList, type WorkflowStep } from '../product/StepList';
import { FeatureGrid, type CapabilityItem } from '../product/FeatureGrid';
import { CorrelationBoard } from '../product/signatures/CorrelationBoard';
import { Callout } from '../product/Callout';
import { RelatedPages, type RelatedPageItem } from '../product/RelatedPages';
import { TechnicalGridPattern } from '../product/TechnicalGridPattern';
import { TerminalDemo, type TerminalOutputLine } from '../product/TerminalDemo';
import { Shield, ShieldAlert, Cpu, Database, AlertTriangle, FileText } from 'lucide-react';

export const ThreatIntelligencePage = () => {
  useEffect(() => {
    document.title = 'Threat Intelligence — SpidyDashboard | Correlate Findings from 200+ Sources';
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const steps: WorkflowStep[] = [
    {
      step: '01',
      title: 'Multi-Source Telemetry Ingestion',
      description: 'Over 80 security modules query global reputation feeds, threat lists, and malware trackers in parallel.',
      badge: 'sfp_abuseipdb / sfp_virustotal',
      codeSnippet: '[sfp_abuseipdb] Ingesting reputation telemetry for 198.51.100.44',
      details: ['VirusTotal & AlienVault OTX feeds', 'Spamhaus, Blocklist.de & CleanTalk', 'Shodan & Censys vulnerability banners'],
    },
    {
      step: '02',
      title: 'Consensus Evaluation',
      description: 'SpiderFoot evaluates findings across multiple independent data feeds. When multiple sources corroborate an anomaly, confidence spikes.',
      badge: 'Correlation Engine',
      codeSnippet: '[Correlation] 3 independent feeds confirm malicious host behavior',
      details: ['False-positive suppression algorithms', 'Cross-provider verification rules', 'Temporal event clustering'],
    },
    {
      step: '03',
      title: 'Automated Risk Rating',
      description: 'Each correlated event is assigned an objective severity score (Critical, High, Medium, Low, Info) based on verifiable impact.',
      badge: 'Severity Tiers',
      codeSnippet: '[Score] Rating elevated to HIGH (Threat Score: 88/100)',
      details: ['Known exploitable CVEs', 'Confirmed C2 communications', 'Credential breach exposure'],
    },
    {
      step: '04',
      title: 'Evidence-Linked Incident Cards',
      description: 'Every finding retains immutable links to its source evidence, HTTP raw responses, and exact timestamps for fast triage.',
      badge: 'Audit & DFIR',
      codeSnippet: '[Evidence] Saved 3 raw responses to SQLite database',
      details: ['Full HTTP payload logs', 'Actionable remediation notes', 'JSON export for SIEM ingestion'],
    },
  ];

  const capabilities: CapabilityItem[] = [
    {
      icon: <ShieldAlert className="w-6 h-6" />,
      title: 'Reputation Lookups',
      description: 'Check IP addresses and hostnames against global abuse databases including AbuseIPDB, VirusTotal, and AlienVault OTX.',
      tag: 'MALICIOUS_IP',
      specs: ['Abuse Confidence Score', 'Historical Attack Reports', 'Blacklist Cross-Checks'],
    },
    {
      icon: <AlertTriangle className="w-6 h-6" />,
      title: 'Blacklist Correlation',
      description: 'Scan netblocks against live DNSBL feeds, spam lists, and malicious botnet command-and-control lists.',
      tag: 'BLACKLISTED',
      specs: ['Spamhaus Zen', 'Blocklist.de Feeds', 'Emerging Threats Rules'],
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'Breach & Credential Lookups',
      description: 'Detect corporate email addresses and employee credentials leaked in public data breach dumps.',
      tag: 'LEAKED_CREDENTIAL',
      specs: ['HaveIBeenPwned API', 'Dehashed Integration', 'Compromised Password Alerts'],
    },
    {
      icon: <Cpu className="w-6 h-6" />,
      title: 'Vulnerability Detection',
      description: 'Match discovered software banners and headers against NIST NVD and CIRCL CVE vulnerability catalogs.',
      tag: 'VULNERABILITY_CVE',
      specs: ['CVSS Severity Scores', 'ExploitDB Cross-References', 'Unpatched Daemon Alerts'],
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: 'Dark Web Mentions',
      description: 'Monitor Tor hidden service search indexes (Ahmia) and public paste repositories for targeted credential leaks.',
      tag: 'DARKNET_MENTION',
      specs: ['Ahmia Tor Indexer', 'Pastebin / Ghostbin Scraping', 'Raw Text Threat Matching'],
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Defensive SIEM Export',
      description: 'Export all high-confidence correlated findings directly into SIEM formats or pipeline scripts via the REST API.',
      tag: 'SIEM_INTEGRATION',
      specs: ['JSON Event Stream', 'CSV Format Export', 'Automated CI/CD Gates'],
    },
  ];

  const terminalOutput: TerminalOutputLine[] = [
    { type: 'dim', text: '[*] Starting threat correlation against scan results...' },
    { type: 'info', text: '[*] Running correlation rules from spiderfoot/correlations.py' },
    { type: 'warn', text: '[!] RULE TRIGGERED: Multiple Threat Feeds Confirm Malicious IP' },
    { type: 'dim', text: '    - Target: vpn.target.com (198.51.100.44)' },
    { type: 'dim', text: '    - Source 1: sfp_virustotal (14 malicious detections)' },
    { type: 'dim', text: '    - Source 2: sfp_abuseipdb (84% abuse confidence score)' },
    { type: 'dim', text: '    - Source 3: sfp_shodan (Port 22 OpenSSH 7.4p1 CVE-2018-15473)' },
    { type: 'accent', text: '[+] CORRELATED INCIDENT CREATED: Severity: HIGH | ID: CORR-9042' },
    { type: 'success', text: '[+] Suggested mitigation logged: Restrict inbound access & patch OpenSSH daemon.' },
  ];

  const relatedPages: RelatedPageItem[] = [
    {
      title: 'Attack Surface Mapping',
      category: 'FEATURE',
      description: 'Map exposed subdomains, IP ranges, and open services across your entire perimeter.',
      href: '/features/attack-surface-mapping',
    },
    {
      title: 'All 233 Modules',
      category: 'CATALOG',
      description: 'Inspect the complete list of 233 SpiderFoot modules with API key requirements.',
      href: '/modules',
    },
    {
      title: 'REST API & CLI',
      category: 'DOCS',
      description: 'Query scan correlation endpoints programmatically and gate your deployment pipelines.',
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
          category="THREAT INTELLIGENCE CORRELATION"
          title="Turn raw findings into one clear story"
          subtitle="Combine telemetry from over 200 public sources, correlate findings across independent threat feeds, and prioritize real security risks with verified evidence."
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Features' },
            { label: 'Threat Intelligence' },
          ]}
          primaryCtaText="Get Student Edition"
          primaryCtaHref="/pricing"
          secondaryCtaText="Watch correlation demo"
          onWatchWalkthrough={() => {
            const el = document.getElementById('visual-proof');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Visual Proof Section */}
        <div id="visual-proof" className="w-full">
          <VisualProof
            title="Threat Intelligence & Correlation Matrix"
            caption="Verified SpiderFoot multi-source correlation engine consolidating threat alerts."
            videoSrc="/videos/threat-map.mp4"
            posterSrc="/videos/threat-map-poster.jpg"
            imageSrc="/photos/about-hero.webp"
            metrics={[
              { label: 'Threat Feeds', value: '80+ Intelligence APIs' },
              { label: 'Consensus Engine', value: 'Multi-Source Correlated' },
              { label: 'Risk Ratings', value: 'Critical · High · Med · Low' },
              { label: 'Evidence Audit', value: 'Full Payload Logs' },
            ]}
          />
        </div>

        {/* Signature Element: Interactive Correlation Board */}
        <CorrelationBoard />

        {/* 4-Step Methodology */}
        <StepList
          sectionTag="CORRELATION METHODOLOGY"
          sectionTitle="How Consensus Eliminates False Positives"
          sectionSubtitle="Single-source alerts often mislead. SpiderFoot correlates signals across multiple independent providers before alerting your security team."
          steps={steps}
        />

        {/* Capability Grid */}
        <FeatureGrid
          sectionTag="INTELLIGENCE STACK"
          sectionTitle="Threat Intelligence Sources Built In"
          sectionSubtitle="Direct integrations with leading reputation providers, blacklist distributors, and leak catalogs."
          features={capabilities}
          columns={3}
        />

        {/* Real CLI Output */}
        <section className="w-full max-w-[1200px] mx-auto px-6 mt-20 sm:mt-28">
          <div className="flex flex-col items-center text-center max-w-[760px] mx-auto mb-8">
            <span className="text-[12px] font-mono uppercase tracking-wider text-[#4F8FF7] font-semibold">
              CORRELATION LOGS
            </span>
            <h3 className="font-headline font-semibold text-[28px] sm:text-[36px] text-[#0B0B14] mt-2">
              Transparent Evidence Trails
            </h3>
            <p className="mt-2 text-[15px] text-[#555555] font-sans">
              Every correlated finding documents exactly which modules fired, what raw response was received, and why the risk score was calculated.
            </p>
          </div>

          <TerminalDemo
            title="spiderfoot-correlate — rule runner"
            command="python sf.py -C SF_SCAN_8941 -o json"
            outputLines={terminalOutput}
          />
        </section>

        {/* Authorized Use Callout */}
        <div className="w-full max-w-[1200px] mx-auto px-6 mt-12">
          <Callout type="authorized">
            Threat intelligence lookups against third-party blocklists, leaked credential records, and reputation feeds are non-intrusive. Always handle discovered credentials with appropriate confidentiality and follow your organizational security policies.
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

export default ThreatIntelligencePage;
