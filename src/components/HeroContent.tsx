import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';

export const HeroContent = () => {
  const [isShining, setIsShining] = useState(false);
  const [line1Done, setLine1Done] = useState(false);
  const [line2Done, setLine2Done] = useState(false);

  // Line 1 and Line 2 words for exact 2-line desktop layout
  const line1Words = ['The', 'ultimate', 'OSINT', 'dashboard'];
  const line2Words = ['for', 'security', 'teams'];

  const wordVariants: Variants = {
    hidden: {
      y: 35,
      opacity: 0,
      filter: 'blur(10px)',
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

  return (
    <section className="pt-10 sm:pt-16 lg:pt-20 pb-2 sm:pb-4 px-4 sm:px-6 text-center max-w-[1280px] mx-auto flex flex-col items-center overflow-visible">
      {/* H1 Heading - Fluid clamp: clamp(34px, 9vw, 72px) with descender protection */}
      <h1 className="font-headline font-semibold text-[#0B0B14] text-[34px] sm:text-[54px] lg:text-[72px] tracking-[-0.04em] leading-[1.15] pb-[0.1em] max-w-[960px] mx-auto overflow-visible">
        {/* Line 1 */}
        <span
          className={`block pt-[0.12em] px-[0.08em] pb-[0.28em] -mt-[0.12em] -mx-[0.08em] -mb-[0.28em] ${
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
              animate="visible"
              onAnimationComplete={() => {
                if (idx === line1Words.length - 1) setLine1Done(true);
              }}
              className="inline-block mr-[0.24em] last:mr-0 px-[0.04em]"
            >
              {word}
            </motion.span>
          ))}
        </span>
        {/* Line 2 (contains 'security' with descender 'y') */}
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
              animate="visible"
              onAnimationComplete={() => {
                if (idx === line2Words.length - 1) setLine2Done(true);
              }}
              className="inline-block mr-[0.24em] last:mr-0 px-[0.04em]"
            >
              {word}
            </motion.span>
          ))}
        </span>
      </h1>

      {/* Paragraph: 16px minimum, line-height 1.6, overflow visible */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.45,
          duration: 0.75,
          ease: [0.22, 1, 0.36, 1] as const,
        }}
        className="mt-4 sm:mt-6 text-[16px] sm:text-[18px] leading-[1.6] text-[#111111]/90 max-w-[540px] mx-auto font-normal pb-[0.2em] overflow-visible px-2"
      >
        SpidyDashboard automates open source intelligence gathering, attack surface mapping and threat monitoring, all in one place.
      </motion.p>

      {/* Buttons Row: Full width stack on mobile, min-height 52px */}
      <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto overflow-visible px-2 sm:px-0">
        {/* "Start free scan" button */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            delay: 0.6,
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1] as const,
          }}
          className="w-full sm:w-auto"
        >
          <motion.a
            href="/pricing"
            onMouseEnter={() => setIsShining(true)}
            onAnimationEnd={() => setIsShining(false)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="relative overflow-hidden w-full sm:w-auto min-h-[52px] h-[54px] sm:h-[60px] px-8 rounded-full bg-gradient-to-b from-[#5B9BFA] to-[#3B7FF0] text-white text-[16px] sm:text-[18px] font-semibold shadow-[0_8px_20px_rgba(59,127,240,0.3)] hover:shadow-[0_14px_28px_-4px_rgba(59,127,240,0.45)] transition-shadow duration-300 flex items-center justify-center cursor-pointer active:scale-[0.98]"
          >
            <span className="relative z-10">Start free scan</span>
            {isShining && (
              <span className="absolute inset-0 pointer-events-none">
                <span className="absolute top-0 bottom-0 left-0 w-[50px] bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shine" />
              </span>
            )}
          </motion.a>
        </motion.div>

        {/* "Read the docs" button */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            delay: 0.7,
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1] as const,
          }}
          className="w-full sm:w-auto"
        >
          <motion.a
            href="/docs/getting-started"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto min-h-[52px] h-[54px] sm:h-[60px] px-8 rounded-full bg-[#F5F5F7] text-[#0B0B14] text-[16px] sm:text-[18px] font-medium hover:bg-[#EBEBEF] transition-colors duration-300 flex items-center justify-center cursor-pointer active:scale-[0.98]"
          >
            Read the docs
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};
