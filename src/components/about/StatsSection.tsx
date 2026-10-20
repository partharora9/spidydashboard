import { useState } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { statsData } from '../../data/stats';
import { StatCard } from './StatCard';

export const StatsSection = () => {
  const prefersReduced = useReducedMotion();
  const [headingDone, setHeadingDone] = useState(false);

  const headingWords = ['SpidyDashboard', 'in', 'numbers'];

  const wordVariants: Variants = {
    hidden: {
      y: prefersReduced ? 0 : 36,
      opacity: 0,
      filter: prefersReduced ? 'none' : 'blur(10px)',
    },
    visible: (customIndex: number) => ({
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      transition: {
        delay: 0.1 + customIndex * 0.08,
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    }),
  };

  return (
    <section className="relative w-full max-w-[1200px] mx-auto px-6 mt-[90px] sm:mt-[110px] lg:mt-[120px] overflow-visible">
      {/* H2 Title with word reveal and zero descender clipping */}
      <div className="flex justify-center text-center overflow-visible">
        <h2 className="font-headline font-semibold text-[32px] sm:text-[44px] lg:text-[56px] leading-[1.15] tracking-[-0.04em] text-[#0B0B14] overflow-visible">
          <span
            className={`inline-block pt-[0.12em] px-[0.08em] pb-[0.28em] -mt-[0.12em] -mx-[0.08em] -mb-[0.28em] ${
              headingDone ? 'overflow-visible' : 'overflow-hidden'
            }`}
            style={{ overflowClipMargin: '0.35em' }}
          >
            {headingWords.map((word, idx) => (
              <motion.span
                key={word}
                custom={idx}
                variants={wordVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.25 }}
                onAnimationComplete={() => {
                  if (idx === headingWords.length - 1) setHeadingDone(true);
                }}
                className="inline-block mr-[0.26em] last:mr-0 px-[0.04em]"
              >
                {word}
              </motion.span>
            ))}
          </span>
        </h2>
      </div>

      {/* 3 Cards Container (margin-top 56px, gap 30px, 380px x 232px) */}
      <div className="mt-10 sm:mt-12 lg:mt-[56px] flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-6 lg:gap-[30px] w-full overflow-visible">
        {statsData.map((stat, index) => (
          <StatCard key={stat.id} stat={stat} index={index} />
        ))}
      </div>
    </section>
  );
};
