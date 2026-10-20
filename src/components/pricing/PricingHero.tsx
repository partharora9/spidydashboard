import { useState } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { Mail } from 'lucide-react';

export const PricingHero = () => {
  const [headingDone, setHeadingDone] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const words = ['Pricing'];

  const wordVariants: Variants = {
    hidden: {
      y: 40,
      opacity: 0,
      filter: 'blur(12px)',
    },
    visible: {
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  const subtitleVariants: Variants = {
    hidden: {
      y: 24,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        delay: 0.4,
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  return (
    <section className="w-full flex flex-col items-center text-center pt-8 sm:pt-12 lg:pt-14 pb-4 px-6 overflow-visible select-none">
      <div className="max-w-[1200px] mx-auto flex flex-col items-center">
        {/* H1 Heading: 72px (clamp 44px to 72px), weight 600, letter-spacing -0.04em, line-height 1.15, color #0B0B14 */}
        <h1 className="font-headline font-semibold text-[#0B0B14] text-[44px] sm:text-[56px] lg:text-[72px] tracking-[-0.04em] leading-[1.15] text-center max-w-[900px] overflow-visible">
          <span
            className={`inline-block pt-[0.12em] px-[0.08em] pb-[0.28em] -mt-[0.12em] -mx-[0.08em] -mb-[0.28em] ${
              headingDone ? 'overflow-visible' : 'overflow-hidden'
            }`}
            style={{ overflowClipMargin: '0.35em' }}
          >
            {words.map((word, idx) => (
              <motion.span
                key={idx}
                variants={wordVariants}
                initial={shouldReduceMotion ? 'visible' : 'hidden'}
                animate="visible"
                onAnimationComplete={() => setHeadingDone(true)}
                className="inline-block px-[0.06em]"
              >
                {word}
              </motion.span>
            ))}
          </span>
        </h1>

        {/* Subtitle: margin-top 16px, 18px, line-height 28px, #111 at 90% */}
        <motion.p
          variants={subtitleVariants}
          initial={shouldReduceMotion ? 'visible' : 'hidden'}
          animate="visible"
          className="mt-4 font-sans text-[18px] leading-[28px] text-[#111111]/90 max-w-[600px]"
        >
          One-time payment. Direct access. Connect on parthxcore@gmail.com to buy.
        </motion.p>

        {/* Direct Contact Pill */}
        <motion.div
          variants={subtitleVariants}
          initial={shouldReduceMotion ? 'visible' : 'hidden'}
          animate="visible"
          className="mt-4"
        >
          <a
            href="mailto:parthxcore@gmail.com?subject=Inquiry to Buy SpidyDashboard&body=Hi Parth,%0D%0A%0D%0AI would like to purchase SpidyDashboard. Please share the details."
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-50 hover:bg-blue-100 border border-[#4F8FF7]/30 text-[#4F8FF7] text-[14px] sm:text-[15px] font-semibold transition-all shadow-sm"
          >
            <Mail className="w-4 h-4" />
            <span>connect on parthxcore@gmail.com to buy</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
};
