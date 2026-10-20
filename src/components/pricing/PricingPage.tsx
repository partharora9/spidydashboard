import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../Navbar';
import { PricingHero } from './PricingHero';
import { PlanCards } from './PlanCards';
import { FaqSection } from './FaqSection';
import { CtaBanner } from '../CtaBanner';
import { Footer } from '../Footer';
import { ShoppingCart } from 'lucide-react';
import { plansData, type Plan } from '../../data/plans';
import { CheckoutModal } from '../checkout/CheckoutModal';
import { PRICE, PLAN_NAME, FORMATTED_PRICE } from '../../config/pricing';

export const PricingPage = () => {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const selectedPlan: Plan = plansData[0];
  const [showMobileBuyBar, setShowMobileBuyBar] = useState(false);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = 'Pricing — SpidyDashboard, Student Edition (₹999)';

    // Track scroll position to show sticky mobile buy bar when cards scroll past
    const handleScroll = () => {
      if (!cardsRef.current) return;
      const rect = cardsRef.current.getBoundingClientRect();
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
    name: PLAN_NAME,
    description:
      'SpidyDashboard Student Edition. Standalone Windows installer, setup guide, walkthrough video, and academic project pack with report, PPT, and viva Q&A.',
    brand: {
      '@type': 'Brand',
      name: 'SpidyDashboard',
    },
    offers: [
      {
        '@type': 'Offer',
        name: PLAN_NAME,
        price: String(PRICE),
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
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

      {/* Navigation Bar */}
      <Navbar />

      {/* Main Content Container */}
      <main className="relative flex flex-col items-center justify-start overflow-visible w-full">
        {/* SECTION 1: Pricing Hero + Centered Single Student Edition Card */}
        <PricingHero />

        <div ref={cardsRef} className="w-full overflow-visible">
          <PlanCards
            onCheckout={() => setIsCheckoutOpen(true)}
          />
        </div>

        {/* SECTION 2: FAQ Accordion with clean answers */}
        <FaqSection />

        {/* CTA Banner */}
        <CtaBanner />

        {/* Footer */}
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
                Student Edition
              </span>
              <span className="font-headline font-semibold text-[15px] text-[#0B0B14] truncate">
                {FORMATTED_PRICE} &bull; One-time
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsCheckoutOpen(true)}
              className="min-h-[44px] px-5 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-sans text-[14px] font-semibold flex items-center justify-center gap-1.5 shadow-[0_4px_14px_rgba(37,99,235,0.3)] active:scale-95 transition-transform cursor-pointer shrink-0"
            >
              <ShoppingCart className="w-4 h-4 shrink-0" />
              <span>Buy Now</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          plan={selectedPlan}
        />
      )}
    </div>
  );
};

export default PricingPage;
