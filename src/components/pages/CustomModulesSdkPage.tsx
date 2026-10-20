import { useEffect } from 'react';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';
import { CtaBanner } from '../CtaBanner';
import { PageHero } from '../product/PageHero';
import { VisualProof } from '../product/VisualProof';
import { StepList, type WorkflowStep } from '../product/StepList';
import { FeatureGrid, type CapabilityItem } from '../product/FeatureGrid';
import { ModuleWalkthrough } from '../product/signatures/ModuleWalkthrough';
import { Callout } from '../product/Callout';
import { RelatedPages, type RelatedPageItem } from '../product/RelatedPages';
import { TechnicalGridPattern } from '../product/TechnicalGridPattern';
import { TerminalDemo, type TerminalOutputLine } from '../product/TerminalDemo';
import { Code, Shield, Zap } from 'lucide-react';

export const CustomModulesSdkPage = () => {
  useEffect(() => {
    document.title = 'Custom Modules & SDK — SpidyDashboard | Build Private OSINT Intelligence Plugins';
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const steps: WorkflowStep[] = [
    {
      step: '01',
      title: 'Create Your Module File',
      description: 'Create a new Python file inside spiderfoot/modules/ prefixed with sfp_, for example sfp_internal_threats.py.',
      badge: 'spiderfoot/modules/',
      codeSnippet: '$ touch spiderfoot/modules/sfp_internal_threats.py',
      details: ['Must inherit SpiderFootPlugin', 'Declare meta dict with useCases & categories', 'Define default options in opts dict'],
    },
    {
      step: '02',
      title: 'Declare Event Subscriptions',
      description: 'Implement watchedEvents() and producedEvents() so the SpiderFoot event bus automatically routes data to your module.',
      badge: 'Event Bus Hook',
      codeSnippet: 'def watchedEvents(self): return ["IP_ADDRESS", "INTERNET_NAME"]',
      details: ['Subscribes to upstream discoveries', 'Declares output event classifications', 'Enables automated multi-module chaining'],
    },
    {
      step: '03',
      title: 'Execute Intelligence Lookups',
      description: 'Process incoming events in handleEvent(). Query private APIs, internal SIEMs, or local threat feeds using self.sf.fetchUrl().',
      badge: 'handleEvent(self, event)',
      codeSnippet: 'res = self.sf.fetchUrl("https://threat-feed.internal/v1/...")',
      details: ['Built-in caching with self.sf.cacheGet()', 'Built-in proxy & SOCKS5 support', 'Thread-safe deduplication via tempStorage()'],
    },
    {
      step: '04',
      title: 'Emit Findings & Run Scans',
      description: 'Instantiate SpiderFootEvent and call self.notifyListeners(evt). Your findings instantly appear in the web graph and JSON reports.',
      badge: 'self.notifyListeners(evt)',
      codeSnippet: '$ python sf.py -s target.com -m sfp_internal_threats -o json',
      details: ['Automatic database persistence', 'Correlated by downstream rules', 'Visible in web graph explorer'],
    },
  ];

  const rules: CapabilityItem[] = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Respect Terms & Rate Limits',
      description: 'Always implement polite throttling and respect upstream data provider quotas. Never overload public endpoints.',
      tag: 'BEST_PRACTICE',
      specs: ['Use self.sf.cachePut()', 'Implement timeout parameters', 'Handle 429 backoff gracefully'],
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: 'Never Hardcode API Keys',
      description: 'Declare API credentials in the opts dictionary so users can securely configure keys through the web dashboard or CLI.',
      tag: 'OPTS_DICTIONARY',
      specs: ['Declare in opts["api_key"]', 'Provide description in optdescs', 'Never commit raw secrets'],
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Thread-Safe State',
      description: 'SpiderFoot executes modules concurrently across thread pools. Use self.tempStorage() for module-local state.',
      tag: 'CONCURRENCY',
      specs: ['Thread-safe storage dictionary', 'Avoid global variables', 'Check for scan stop flags'],
    },
  ];

  const commonEventTypes = [
    { type: 'INTERNET_NAME', desc: 'Hostnames and subdomains (e.g. api.target.com)' },
    { type: 'IP_ADDRESS', desc: 'Public IPv4 addresses (e.g. 198.51.100.44)' },
    { type: 'IPV6_ADDRESS', desc: 'Public IPv6 addresses' },
    { type: 'EMAILADDR', desc: 'Discovered email addresses (e.g. user@target.com)' },
    { type: 'TCP_PORT_OPEN', desc: 'Confirmed open TCP network port and protocol' },
    { type: 'LEAKED_CREDENTIAL', desc: 'Compromised password, dump mention, or hash' },
    { type: 'MALICIOUS_IP', desc: 'IP flagged by threat intelligence providers' },
    { type: 'VULNERABILITY_CVE', desc: 'Software version with known CVE vulnerability' },
  ];

  const terminalOutput: TerminalOutputLine[] = [
    { type: 'dim', text: '[*] Registering local custom plugin sfp_custom_intel.py...' },
    { type: 'info', text: '[*] Validating SpiderFootPlugin inheritance and event declarations...' },
    { type: 'success', text: '[+] Plugin registered: sfp_custom_intel (Name: Custom Threat Intel)' },
    { type: 'info', text: '[*] Executing test scan against sample target 198.51.100.44...' },
    { type: 'accent', text: '[+] Incoming event routed: IP_ADDRESS -> sfp_custom_intel' },
    { type: 'warn', text: '[!] Threat feed score threshold exceeded (Score: 84 >= 75)' },
    { type: 'success', text: '[+] SpiderFootEvent emitted: MALICIOUS_IP -> Dispatched to listeners!' },
  ];

  const relatedPages: RelatedPageItem[] = [
    {
      title: 'All 233 Modules',
      category: 'CATALOG',
      description: 'Inspect real implementation patterns from all 233 modules in the SpiderFoot registry.',
      href: '/modules',
    },
    {
      title: 'REST API & CLI',
      category: 'DOCS',
      description: 'Invoke your custom modules via REST API endpoints and command-line automation.',
      href: '/docs/rest-api-cli',
    },
    {
      title: 'Getting Started Guide',
      category: 'DOCS',
      description: 'Set up your local Python development environment with venv, requirements, and run.py.',
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
          category="DEVELOPER SDK & EXTENSIBILITY"
          title="Build your own intelligence plugins"
          subtitle="Extend SpidyDashboard with custom Python plugins. Query private threat databases, integrate proprietary SIEMs, or ingest bespoke feeds in under 30 lines of code."
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Modules' },
            { label: 'Custom Modules & SDK' },
          ]}
          primaryCtaText="Get Student Edition"
          primaryCtaHref="/pricing"
          secondaryCtaText="Inspect SDK code"
          onWatchWalkthrough={() => {
            const el = document.getElementById('sdk-walkthrough');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Visual Proof Section */}
        <div id="visual-proof" className="w-full">
          <VisualProof
            title="Custom Plugin Architecture & Event Dispatch"
            caption="Synchronized event propagation flowing between core SpiderFoot modules and custom plugins."
            videoSrc="/videos/right.mp4"
            posterSrc="/videos/right-poster.jpg"
            imageSrc="/photos/about-hero.webp"
            metrics={[
              { label: 'SDK Base Class', value: 'SpiderFootPlugin' },
              { label: 'Event Bus', value: 'SpiderFootEvent' },
              { label: 'Lines of Code', value: '~30 Lines' },
              { label: 'Language', value: 'Python 3.9+' },
            ]}
          />
        </div>

        {/* Signature Element: Synchronized Code Walkthrough */}
        <div id="sdk-walkthrough" className="w-full">
          <ModuleWalkthrough />
        </div>

        {/* Step-by-step implementation guide */}
        <StepList
          sectionTag="DEVELOPMENT WORKFLOW"
          sectionTitle="Four Steps to Your First OSINT Plugin"
          sectionSubtitle="Follow the exact conventions used across all 233 official SpiderFoot modules to register and test your plugin."
          steps={steps}
        />

        {/* Common Event Types Table */}
        <section className="w-full max-w-[1200px] mx-auto px-6 mt-20 sm:mt-28">
          <div className="flex flex-col items-center text-center max-w-[760px] mx-auto mb-10">
            <span className="text-[12px] font-mono uppercase tracking-wider text-[#4F8FF7] font-semibold">
              EVENT CATALOG
            </span>
            <h3 className="font-headline font-semibold text-[28px] sm:text-[36px] text-[#0B0B14] mt-2">
              Common SpiderFoot Event Types
            </h3>
            <p className="mt-2 text-[15px] text-[#555555] font-sans">
              Subscribe to or emit these standard data classifications in <code>watchedEvents()</code> and <code>producedEvents()</code>.
            </p>
          </div>

          <div className="bg-white rounded-[22px] border border-black/[0.08] shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse text-[14px]">
              <thead>
                <tr className="bg-[#F8F9FD] border-b border-black/[0.06] text-[12px] font-mono uppercase text-gray-500">
                  <th className="py-3.5 px-6">Event Type String</th>
                  <th className="py-3.5 px-6">Description &amp; Typical Producers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {commonEventTypes.map((e) => (
                  <tr key={e.type} className="hover:bg-gray-50/60">
                    <td className="py-3.5 px-6 whitespace-nowrap">
                      <code className="px-2 py-0.5 rounded bg-[#0B0F19] text-[#38BDF8] font-mono text-[12px]">
                        {e.type}
                      </code>
                    </td>
                    <td className="py-3.5 px-6 text-[#444444] font-sans">
                      {e.desc}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Development Rules & Best Practices */}
        <FeatureGrid
          sectionTag="PLUGIN ARCHITECTURE"
          sectionTitle="Developer Best Practices"
          sectionSubtitle="Ensure your modules are performant, thread-safe, and secure."
          features={rules}
          columns={3}
        />

        {/* Real CLI Test Execution */}
        <section className="w-full max-w-[1200px] mx-auto px-6 mt-20 sm:mt-28">
          <div className="flex flex-col items-center text-center max-w-[760px] mx-auto mb-8">
            <span className="text-[12px] font-mono uppercase tracking-wider text-[#4F8FF7] font-semibold">
              LOCAL TEST VERIFICATION
            </span>
            <h3 className="font-headline font-semibold text-[28px] sm:text-[36px] text-[#0B0B14] mt-2">
              Running a Scan With Your New Module
            </h3>
            <p className="mt-2 text-[15px] text-[#555555] font-sans">
              Test your plugin directly from the terminal before committing to your internal reconnaissance pipeline.
            </p>
          </div>

          <TerminalDemo
            title="spiderfoot-plugin-test — sfp_custom_intel"
            command="python sf.py -s 198.51.100.44 -m sfp_custom_intel -o json"
            outputLines={terminalOutput}
          />
        </section>

        {/* Security Warning */}
        <div className="w-full max-w-[1200px] mx-auto px-6 mt-12">
          <Callout type="warning" title="Secure Credential Handling in Custom Code">
            Never embed hardcoded API keys, private tokens, or proprietary database passwords inside module scripts. Always declare key options in <code>opts</code> and configure them via local environment variables or the SpiderFoot settings store.
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

export default CustomModulesSdkPage;
