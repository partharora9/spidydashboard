import { useRef, useState } from 'react';
import { motion, useScroll, useTransform, type Variants } from 'framer-motion';
import { CardA } from './included/CardA';
import { CardB } from './included/CardB';
import { CardC } from './included/CardC';
import { CardD } from './included/CardD';

export const IncludedSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [line1Done, setLine1Done] = useState(false);
  const [line2Done, setLine2Done] = useState(false);

  // Scroll Parallax for background glows and content depth
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const scrollParallaxY = useTransform(scrollYProgress, [0, 1], [-20, 20]);

  // Heading words for exact 2-line desktop layout
  const line1Words = ['What', 'is', 'included'];
  const line2Words = ['in', 'SpidyDashboard'];

  const wordVariants: Variants = {
    hidden: {
      y: 40,
      opacity: 0,
      filter: 'blur(12px)',
    },
    visible: (customIndex: number) => ({
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      transition: {
        delay: customIndex * 0.08,
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    }),
  };

  const cardEntranceTransition = (delay: number) => ({
    delay,
    duration: 0.9,
    ease: [0.22, 1, 0.36, 1] as const,
  });

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-white pt-16 pb-[120px] px-4 sm:px-6 overflow-visible"
    >
      <div className="max-w-[1160px] mx-auto flex flex-col items-center">
        {/* Centered 2-line Heading: line-height 1.18, 0.1em bottom padding */}
        <h2 className="font-headline font-semibold text-[#0B0B14] text-[32px] sm:text-[48px] lg:text-[64px] tracking-[-0.04em] leading-[1.18] pb-[0.1em] text-center mb-10 sm:mb-14 overflow-visible">
          <span
            className={`block pt-[0.12em] px-[0.08em] pb-[0.32em] -mt-[0.12em] -mx-[0.08em] -mb-[0.32em] ${
              line1Done ? 'overflow-visible' : 'overflow-hidden'
            }`}
            style={{ overflowClipMargin: '0.35em' }}
          >
            {line1Words.map((word, idx) => (
              <motion.span
                key={idx}
                custom={idx}
                variants={wordVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                onAnimationComplete={() => {
                  if (idx === line1Words.length - 1) setLine1Done(true);
                }}
                className="inline-block mr-[0.28em] last:mr-0 px-[0.06em]"
              >
                {word}
              </motion.span>
            ))}
          </span>
          <span
            className={`block pt-[0.12em] px-[0.08em] pb-[0.32em] -mt-[0.12em] -mx-[0.08em] -mb-[0.32em] ${
              line2Done ? 'overflow-visible' : 'overflow-hidden'
            }`}
            style={{ overflowClipMargin: '0.35em' }}
          >
            {line2Words.map((word, idx) => (
              <motion.span
                key={idx}
                custom={line1Words.length + idx}
                variants={wordVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                onAnimationComplete={() => {
                  if (idx === line2Words.length - 1) setLine2Done(true);
                }}
                className="inline-block mr-[0.28em] last:mr-0 px-[0.06em]"
              >
                {word}
              </motion.span>
            ))}
          </span>
        </h2>

        {/* Bento Grid: 1 col under 640px (order A, B, C, D), 2 cols at 640-1023px, 3 cols at 1024px+ */}
        <motion.div
          style={{ y: scrollParallaxY }}
          className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 auto-rows-auto md:auto-rows-fr lg:auto-rows-auto"
        >
          {/* Card A: Domain Scanning (Order 1 on all viewports) */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={cardEntranceTransition(0.1)}
            className="order-1 h-full"
          >
            <CardA />
          </motion.div>

          {/* Card B: Asset Discovery (Order 2 on all viewports) */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={cardEntranceTransition(0.2)}
            className="order-2 h-full"
          >
            <CardB />
          </motion.div>

          {/* Card C: Attack Surface Monitoring (Order 3 on mobile/tablet, Order 4 on desktop row 2 cols 1-2) */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={cardEntranceTransition(0.3)}
            className="order-3 lg:order-4 md:col-span-2 lg:col-span-2 h-full"
          >
            <CardC />
          </motion.div>

          {/* Card D: Modules Integration (Order 4 on mobile/tablet, Order 3 on desktop col 3 rows 1-2) */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={cardEntranceTransition(0.4)}
            className="order-4 lg:order-3 lg:row-span-2 h-full"
          >
            <CardD />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
