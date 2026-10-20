import { useEffect } from 'react';
import { motion, useScroll, useSpring, useReducedMotion } from 'framer-motion';
import { Navbar } from '../Navbar';
import { AboutHero } from './AboutHero';
import { StatsSection } from './StatsSection';
import { DeveloperBio } from './DeveloperBio';
import { TeamSection } from './TeamSection';
import { CtaBanner } from '../CtaBanner';
import { Footer } from '../Footer';
import { teamMembers } from '../../data/team';

export const AboutPage = () => {
  const prefersReduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    // Title and meta description for SEO
    document.title = 'About | SpidyDashboard — Built by Parth Arora, SOC Analyst';

    let metaDesc = document.querySelector('meta[name="description"]');
    const prevDesc = metaDesc ? metaDesc.getAttribute('content') : null;
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'SpidyDashboard brings attack surface discovery and OSINT into one clear view, built by Parth Arora, a working SOC Analyst.'
      );
    }

    window.scrollTo({ top: 0, behavior: 'instant' });

    return () => {
      if (metaDesc && prevDesc) {
        metaDesc.setAttribute('content', prevDesc);
      }
    };
  }, []);

  // Person Schema JSON-LD for Parth Arora
  const parth = teamMembers[0];
  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: parth.name,
    jobTitle: parth.role,
    url: typeof window !== 'undefined' ? window.location.origin : 'https://spidydashboard.com',
    sameAs: [parth.linkedin],
    worksFor: {
      '@type': 'SoftwareApplication',
      name: 'SpidyDashboard',
      applicationCategory: 'SecurityApplication',
      operatingSystem: 'All',
    },
    knowsAbout: [
      'Open Source Intelligence (OSINT)',
      'Attack Surface Management',
      'Threat Intelligence Correlation',
      'Security Operations Center (SOC)',
    ],
  };

  return (
    <div className="min-h-screen bg-white text-[#0B0B14] font-sans antialiased selection:bg-blue-100 selection:text-blue-900 relative overflow-x-clip">
      {/* Person JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />

      {/* Page-level Scroll-linked Progress Bar (2px, #4F8FF7) */}
      {!prefersReduced && (
        <motion.div
          style={{ scaleX, transformOrigin: '0%' }}
          className="fixed top-0 left-0 right-0 h-[2px] bg-[#4F8FF7] z-50 pointer-events-none"
        />
      )}

      {/* Reused SpidyDashboard Navigation Bar */}
      <Navbar />

      {/* Main Content: Sections under Navbar, above CtaBanner and Footer */}
      <main className="relative flex flex-col items-center justify-start overflow-visible w-full">
        {/* SECTION 1: ABOUT HERO (Hero title + subtitle + photo on gradient background) */}
        <AboutHero />

        {/* SECTION 2: NUMBERS ("SpidyDashboard in numbers" with 3 stat cards) */}
        <StatsSection />

        {/* SECTION 3: MEET THE DEVELOPER / BEHIND THE DASHBOARD (Personal Bio) */}
        <DeveloperBio />

        {/* SECTION 4: TEAM ("Meet the person behind it" - Connect links row) */}
        <TeamSection />

        {/* Reused SpidyDashboard CTA Banner */}
        <CtaBanner />

        {/* Reused SpidyDashboard Footer */}
        <Footer />
      </main>
    </div>
  );
};

export default AboutPage;
