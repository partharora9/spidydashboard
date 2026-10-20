import { useEffect } from 'react';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';
import { CtaBanner } from '../CtaBanner';
import { PageHero } from '../product/PageHero';
import { VisualProof } from '../product/VisualProof';
import { ModuleTable } from '../product/signatures/ModuleTable';
import { Callout } from '../product/Callout';
import { RelatedPages, type RelatedPageItem } from '../product/RelatedPages';
import { TechnicalGridPattern } from '../product/TechnicalGridPattern';
import { TOTAL_MODULES_COUNT, KEY_REQUIRED_COUNT, FREE_MODULES_COUNT } from '../../data/modulesData';

export const ModulesPage = () => {
  useEffect(() => {
    document.title = `All ${TOTAL_MODULES_COUNT} Modules — SpidyDashboard | Shodan, VirusTotal, HaveIBeenPwned & More`;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const featuredChips = [
    { name: 'SHODAN', desc: 'Port, banner & service discovery', id: 'sfp_shodan' },
    { name: 'VirusTotal', desc: 'Multi-engine malware & URL scores', id: 'sfp_virustotal' },
    { name: 'HaveIBeenPwned', desc: 'Leaked credential dump lookups', id: 'sfp_haveibeenpwned' },
    { name: 'Censys', desc: 'Internet-wide TLS & host certificates', id: 'sfp_censys' },
    { name: 'GreyNoise', desc: 'Internet scanner & noise filtering', id: 'sfp_greynoise' },
    { name: 'AlienVault OTX', desc: 'Collaborative threat telemetry indicators', id: 'sfp_alienvault' },
  ];

  const relatedPages: RelatedPageItem[] = [
    {
      title: 'Custom Modules & SDK',
      category: 'EXTEND',
      description: 'Write your own private 30-line Python intelligence plugins and plug into the scan event pipeline.',
      href: '/modules/custom-sdk',
    },
    {
      title: 'Attack Surface Mapping',
      category: 'FEATURE',
      description: 'See how DNS, port scan, and certificate modules chain together into an attack surface topology.',
      href: '/features/attack-surface-mapping',
    },
    {
      title: 'REST API & CLI',
      category: 'DOCS',
      description: 'Enable, disable, and configure module API keys programmatically via the REST bridge.',
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
          category={`RECONNAISSANCE MODULE REGISTRY (${TOTAL_MODULES_COUNT} TOTAL)`}
          title="Every data source in one place"
          subtitle={`Shodan, VirusTotal, HaveIBeenPwned & over ${TOTAL_MODULES_COUNT} automated OSINT reconnaissance modules. Query search engines, dark web indexes, certificate transparency logs, and threat intelligence feeds.`}
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Modules' },
            { label: `All ${TOTAL_MODULES_COUNT} Modules` },
          ]}
          primaryCtaText="Get the source code"
          primaryCtaHref="/pricing"
          secondaryCtaText="Explore modules table"
          onWatchWalkthrough={() => {
            const el = document.getElementById('modules-table');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Featured Source Chips Bar */}
        <section className="w-full max-w-[1200px] mx-auto px-6 mt-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {featuredChips.map((c) => (
              <div
                key={c.id}
                className="p-3.5 rounded-2xl bg-[#F8F9FD] border border-black/[0.06] flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-headline font-semibold text-[14px] text-[#0B0B14]">
                    {c.name}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4F8FF7]" />
                </div>
                <span className="text-[11px] text-gray-500 font-sans leading-tight">
                  {c.desc}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Visual Proof Section */}
        <div id="visual-proof" className="w-full">
          <VisualProof
            title="Module Registry & Live Execution Pipeline"
            caption="Direct telemetry from SpiderFoot module execution showing multi-threaded query workers."
            videoSrc="/videos/center.mp4"
            posterSrc="/videos/center-poster.jpg"
            imageSrc="/photos/about-hero.webp"
            metrics={[
              { label: 'Total Modules', value: `${TOTAL_MODULES_COUNT} Modules` },
              { label: 'Free / No Key', value: `${FREE_MODULES_COUNT} Modules (64%)` },
              { label: 'Key Required', value: `${KEY_REQUIRED_COUNT} Modules (36%)` },
              { label: 'Data Categories', value: '11 OSINT Domains' },
            ]}
          />
        </div>

        {/* Signature Element: Interactive Module Search & Filter Table */}
        <div id="modules-table" className="w-full">
          <ModuleTable />
        </div>

        {/* Key Management Callout */}
        <div className="w-full max-w-[1240px] mx-auto px-6 mt-14">
          <Callout type="note" title="Zero-Knowledge API Key Storage">
            SpidyDashboard stores your private API keys locally inside the backend SQLite database. Keys are never transmitted to external cloud servers, and community free tiers exist for the vast majority of commercial providers (Shodan, VirusTotal, AlienVault, etc.).
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

export default ModulesPage;
