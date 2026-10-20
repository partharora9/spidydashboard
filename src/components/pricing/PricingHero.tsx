import { useState } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { FORMATTED_PRICE, PLAN_NAME } from '../../config/pricing';

export const PricingHero = () => {
  const [headingDone, setHeadingDone] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const words = ['Student', 'Edition', 'Pricing'];

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
        delay: 0.3,
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  return (
    <section className="w-full flex flex-col items-center text-center pt-[calc(var(--header-h)+env(safe-area-inset-top,0px)+24px)] lg:pt-[calc(var(--header-h)+56px)] pb-2 px-6 overflow-visible select-none">
      <div className="max-w-[1200px] mx-auto flex flex-col items-center">
        {/* Student Price Badge */}
        <motion.div
          variants={subtitleVariants}
          initial={shouldReduceMotion ? 'visible' : 'hidden'}
          animate="visible"
          className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-[#4F8FF7]/20 text-[#4F8FF7] text-[13px] font-semibold"
        >
          <Sparkles className="w-4 h-4 text-[#4F8FF7]" />
          <span>{PLAN_NAME} &bull; {FORMATTED_PRICE} One-Time</span>
        </motion.div>

        {/* H1 Heading */}
        <h1 className="font-headline font-semibold text-[#0B0B14] text-[40px] sm:text-[54px] lg:text-[68px] tracking-[-0.04em] leading-[1.15] text-center max-w-[900px] overflow-visible">
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

        {/* Subtitle */}
        <motion.p
          variants={subtitleVariants}
          initial={shouldReduceMotion ? 'visible' : 'hidden'}
          animate="visible"
          className="mt-4 font-sans text-[17px] sm:text-[18px] leading-[28px] text-[#111111]/85 max-w-[620px]"
        >
          Everything you need for your cybersecurity lab or college project. One-time payment of {FORMATTED_PRICE}, no subscriptions.
        </motion.p>
      </div>
    </section>
  );
};
