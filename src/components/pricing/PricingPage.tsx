import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../Navbar';
import { PricingHero } from './PricingHero';
import { PlanCards } from './PlanCards';
import { ComparisonTable } from './ComparisonTable';
import { FaqSection } from './FaqSection';
import { CtaBanner } from '../CtaBanner';
import { Footer } from '../Footer';
import { Mail } from 'lucide-react';
import { plansData, type Plan } from '../../data/plans';
import { paymentLinks } from '../../config/paymentLinks';

export const PricingPage = () => {
  const [selectedPlan, setSelectedPlan] = useState<Plan>(plansData[0]);
  const [showMobileBuyBar, setShowMobileBuyBar] = useState(false);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = 'Pricing — SpidyDashboard | One-Time Source Code Purchase';

    // Track scroll position to show sticky mobile buy bar when cards scroll past
    const handleScroll = () => {
      if (!cardsRef.current) return;
      const rect = cardsRef.current.getBoundingClientRect();
      // On mobile screens, when cards section is scrolled past viewport top
      if (window.innerWidth < 640 && rect.bottom < 100) {
        setShowMobileBuyBar(true);
      } else {
        setShowMobileBuyBar(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'SpidyDashboard OSINT Source Code',
    description:
      'SpidyDashboard automates open source intelligence gathering across 200+ modules and attack surfaces. One-time purchase with instant source code download.',
    brand: {
      '@type': 'Brand',
      name: 'SpidyDashboard',
    },
    offers: [
      {
        '@type': 'Offer',
        name: 'Standard Plan',
        price: '499',
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
        url: paymentLinks.standard,
      },
      {
        '@type': 'Offer',
        name: 'Complete Kit Plan',
        price: '799',
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
        url: paymentLinks.complete,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-white text-[#0B0B14] font-sans antialiased selection:bg-blue-100 selection:text-blue-900 relative overflow-x-clip">
      {/* Product JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Reused SpidyDashboard Navigation Bar */}
      <Navbar />

      {/* Main Content Container without clipping */}
      <main className="relative flex flex-col items-center justify-start overflow-visible w-full">
        {/* SECTION 1: Pricing Hero + Centered Plan Cards */}
        <PricingHero />

        <div ref={cardsRef} className="w-full overflow-visible">
          <PlanCards
            onPlanChange={(plan) => setSelectedPlan(plan)}
          />
        </div>

        {/* SECTION 2: Feature Comparison Table with #F5F5F5 highlight column */}
        <ComparisonTable />

        {/* SECTION 3: FAQ Accordion with 2-column layout and speech bubbles */}
        <FaqSection />

        {/* Reused SpidyDashboard CTA Banner */}
        <CtaBanner />

        {/* Reused SpidyDashboard Footer */}
        <Footer />
      </main>

      {/* Sticky Mobile Buy Bar (< 640px) */}
      <AnimatePresence>
        {showMobileBuyBar && (
          <motion.div
            id="pricing-sticky-buy-bar"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="sm:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-t border-black/[0.08] px-4 pt-3 pb-[max(14px,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(0,0,0,0.08)] flex items-center justify-between gap-3"
          >
            <div className="flex flex-col min-w-0 shrink">
              <span className="font-sans text-[11px] text-[#555555] uppercase tracking-wider">
                Selected Plan
              </span>
              <span className="font-headline font-semibold text-[15px] text-[#0B0B14] truncate">
                {selectedPlan.name} • {selectedPlan.formattedPrice}
              </span>
            </div>

            <a
              href={`mailto:parthxcore@gmail.com?subject=Inquiry to Buy SpidyDashboard ${selectedPlan.name} (${selectedPlan.formattedPrice})&body=Hi Parth,%0D%0A%0D%0AI would like to purchase SpidyDashboard ${selectedPlan.name} (${selectedPlan.formattedPrice}). Please share the payment and access details.%0D%0A%0D%0AThank you!`}
              className="min-h-[44px] px-4 rounded-full bg-[#4F8FF7] hover:bg-[#3E82EE] text-white font-sans text-[13px] font-semibold flex items-center justify-center gap-1.5 shadow-[0_4px_14px_rgba(79,143,247,0.3)] active:scale-95 transition-transform cursor-pointer shrink-0"
            >
              <Mail className="w-4 h-4 shrink-0" />
              <span>Buy now</span>
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PricingPage;
