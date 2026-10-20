import { useEffect, type ReactNode } from 'react';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';
import { DocsSidebar, type NavSection } from './DocsSidebar';
import { DocsTableOfContents, type TocItem } from './DocsTableOfContents';
import { DocsFeedback } from './DocsFeedback';
import { TechnicalGridPattern } from '../product/TechnicalGridPattern';
import { ChevronRight, Clock, ShieldCheck } from 'lucide-react';

interface DocsLayoutProps {
  title: string;
  subtitle: string;
  readingTime?: string;
  breadcrumbs: { label: string; href?: string }[];
  sidebarSections: NavSection[];
  activeSidebarId: string;
  onSelectSidebar: (id: string) => void;
  tocItems: TocItem[];
  activeTocId?: string;
  onSelectToc: (id: string) => void;
  children: ReactNode;
}

export const DocsLayout = ({
  title,
  subtitle,
  readingTime = '6 min read',
  breadcrumbs,
  sidebarSections,
  activeSidebarId,
  onSelectSidebar,
  tocItems,
  activeTocId,
  onSelectToc,
  children,
}: DocsLayoutProps) => {
  useEffect(() => {
    document.title = `${title} — SpidyDashboard Documentation`;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [title]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: title,
    description: subtitle,
    author: {
      '@type': 'Person',
      name: 'Parth Arora',
      jobTitle: 'SOC Analyst',
    },
    publisher: {
      '@type': 'Organization',
      name: 'SpidyDashboard',
      url: typeof window !== 'undefined' ? window.location.origin : 'https://spidydashboard.com',
    },
  };

  return (
    <div className="min-h-screen bg-white text-[#0B0B14] font-sans antialiased selection:bg-blue-100 selection:text-blue-900 relative overflow-x-clip">
      {/* TechArticle Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar />

      <main className="relative w-full max-w-[1360px] mx-auto px-6 pt-[calc(var(--header-h)+env(safe-area-inset-top,0px)+24px)] lg:pt-[calc(var(--header-h)+56px)] pb-10 sm:pb-14 overflow-visible">
        <TechnicalGridPattern />

        {/* Top Breadcrumb & Metadata */}
        <div className="mb-8 pb-6 border-b border-black/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-gray-500 font-sans">
            {breadcrumbs.map((crumb, idx) => (
              <div key={crumb.label} className="flex items-center gap-1.5">
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-400 stroke-[2]" />}
                {crumb.href ? (
                  <a href={crumb.href} className="hover:text-[#4F8FF7] transition-colors">
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-[#0B0B14] font-semibold">{crumb.label}</span>
                )}
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-4 text-[12px] text-gray-500 font-sans">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#4F8FF7]" />
              <span>{readingTime}</span>
            </span>
            <span className="text-gray-300">•</span>
            <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified SpiderFoot v4 Engine</span>
            </span>
          </div>
        </div>

        {/* Three Column Grid: Sidebar (Left) -> Content (Center) -> Table of Contents (Right) */}
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          {/* Left Sidebar */}
          <DocsSidebar
            sections={sidebarSections}
            activeId={activeSidebarId}
            onSelect={onSelectSidebar}
            docTitle={title}
          />

          {/* Center Main Content */}
          <article className="flex-1 min-w-0 w-full overflow-hidden">
            {/* Header */}
            <div className="mb-10">
              <h1 className="font-headline font-semibold text-[32px] sm:text-[44px] lg:text-[48px] text-[#0B0B14] tracking-[-0.03em] leading-tight">
                {title}
              </h1>
              <p className="mt-3 text-[17px] sm:text-[18px] text-[#555555] font-sans leading-relaxed">
                {subtitle}
              </p>
            </div>

            {/* Document Content */}
            <div className="prose prose-slate max-w-none space-y-6">
              {children}
            </div>

            {/* Feedback Widget */}
            <DocsFeedback />
          </article>

          {/* Right Table of Contents */}
          <DocsTableOfContents
            items={tocItems}
            activeId={activeTocId}
            onSelect={onSelectToc}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
};
