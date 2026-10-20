import { type ReactNode } from 'react';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';
import { Scale } from 'lucide-react';

interface LegalPageLayoutProps {
  title: string;
  subtitle: string;
  lastUpdated: string;
  children: ReactNode;
}

export const LegalPageLayout = ({ title, subtitle, lastUpdated, children }: LegalPageLayoutProps) => {
  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#0B0B14] font-sans antialiased flex flex-col justify-between">
      <Navbar />

      <main className="max-w-[840px] mx-auto px-6 pt-[calc(var(--header-h)+env(safe-area-inset-top,0px)+24px)] lg:pt-[calc(var(--header-h)+64px)] pb-16 sm:pb-20 w-full">
        {/* Title Header */}
        <div className="pb-8 border-b border-black/[0.08] mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#4F8FF7] text-[12px] font-semibold tracking-wider uppercase mb-2">
            <Scale className="w-3.5 h-3.5" />
            <span>Legal Documentation</span>
          </div>
          <h1 className="text-[32px] sm:text-[42px] font-bold text-[#0B0B14] tracking-tight">{title}</h1>
          <p className="text-[16px] text-gray-600 leading-relaxed">{subtitle}</p>
          <div className="text-[12px] text-gray-400 font-mono pt-2">Last Updated: {lastUpdated} &bull; SpidyDashboard</div>
        </div>

        {/* Lawyer Review Advisory */}
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[13px] mb-8 leading-relaxed">
          <strong>Advisory Note:</strong> This document is a draft operational policy tailored for digital software source
          code sales under Indian e-commerce & DPDP Act 2023 principles. For full legal bindingness, have your corporate
          counsel review prior to large-scale enterprise engagements.
        </div>

        {/* Legal Text Content */}
        <article className="prose prose-slate max-w-none text-[15px] leading-[26px] text-gray-700 space-y-6">
          {children}
        </article>
      </main>

      <Footer />
    </div>
  );
};
