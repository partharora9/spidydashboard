import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion, type Variants } from 'framer-motion';
import { faqsData } from '../../data/faqs';

export const FaqSection = () => {
  const [openId, setOpenId] = useState<string | null>('subscription');
  const [headingDone, setHeadingDone] = useState(false);
  const [bubbleWiggle, setBubbleWiggle] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const handleToggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
    // Trigger front bubble wiggle when question toggles
    setBubbleWiggle(true);
    setTimeout(() => setBubbleWiggle(false), 600);
  };

  const line1Words = ['Frequently'];
  const line2Words = ['asked', 'questions'];

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

  return (
    <section className="w-full max-w-[1200px] mx-auto mt-28 sm:mt-32 lg:mt-[140px] pb-28 px-6 select-none overflow-visible">
      <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-12 lg:gap-16 items-start">
        {/* LEFT COLUMN: H2 Heading + Speech Bubbles Illustration */}
        <div className="flex flex-col">
          {/* H2 Heading: 64px (clamp 38px to 64px), weight 600, line-height 1.15 */}
          <h2 className="font-headline font-semibold text-[#0B0B14] text-[38px] sm:text-[48px] lg:text-[64px] tracking-[-0.04em] leading-[1.15] overflow-visible">
            {/* Line 1: "Frequently" */}
            <span
              className={`block pt-[0.12em] px-[0.08em] pb-[0.28em] -mt-[0.12em] -mx-[0.08em] -mb-[0.28em] ${
                headingDone ? 'overflow-visible' : 'overflow-hidden'
              }`}
              style={{ overflowClipMargin: '0.35em' }}
            >
              {line1Words.map((word, idx) => (
                <motion.span
                  key={idx}
                  custom={idx}
                  variants={wordVariants}
                  initial={shouldReduceMotion ? 'visible' : 'hidden'}
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  className="inline-block"
                >
                  {word}
                </motion.span>
              ))}
            </span>

            {/* Line 2: "asked questions" */}
            <span
              className={`block pt-[0.12em] px-[0.08em] pb-[0.28em] -mt-[0.12em] -mx-[0.08em] -mb-[0.28em] ${
                headingDone ? 'overflow-visible' : 'overflow-hidden'
              }`}
              style={{ overflowClipMargin: '0.35em' }}
            >
              {line2Words.map((word, idx) => (
                <motion.span
                  key={idx}
                  custom={line1Words.length + idx}
                  variants={wordVariants}
                  initial={shouldReduceMotion ? 'visible' : 'hidden'}
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  onAnimationComplete={() => setHeadingDone(true)}
                  className="inline-block mr-[0.26em] last:mr-0"
                >
                  {word}
                </motion.span>
              ))}
            </span>
          </h2>

          {/* Speech Bubbles Illustration: ~140px below H2, ~200px wide, light gray #DADBDD */}
          <div className="hidden lg:flex flex-col mt-28 pl-2">
            <motion.div
              animate={
                shouldReduceMotion
                  ? {}
                  : {
                      y: [0, -6, 0],
                    }
              }
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative w-[210px] h-[190px]"
            >
              {/* Back speech bubble */}
              <motion.div
                animate={shouldReduceMotion ? {} : { y: [0, 4, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute top-0 left-12 w-[145px] h-[115px] bg-[#DADBDD] rounded-[24px] rounded-br-[8px] opacity-90 shadow-sm"
              />

              {/* Front speech bubble with white '?' */}
              <motion.div
                animate={
                  bubbleWiggle && !shouldReduceMotion
                    ? {
                        rotate: [0, -4, 4, -2, 2, 0],
                        scale: [1, 1.04, 1],
                      }
                    : { rotate: 0, scale: 1 }
                }
                transition={{ duration: 0.5 }}
                className="absolute bottom-0 left-0 w-[145px] h-[125px] bg-[#DADBDD] rounded-[24px] rounded-bl-[8px] flex items-center justify-center shadow-md"
              >
                {/* White bold '?' glyph */}
                <span className="font-headline font-bold text-white text-[56px] leading-none select-none translate-y-[-4px]">
                  ?
                </span>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* RIGHT COLUMN: 6 Accordion Cards */}
        <div className="flex flex-col space-y-5">
          {faqsData.map((faq, index) => {
            const isOpen = openId === faq.id;

            return (
              <motion.div
                key={faq.id}
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  delay: index * 0.08,
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={
                  shouldReduceMotion
                    ? {}
                    : {
                        y: -2,
                        boxShadow: '0 14px 44px rgba(20, 30, 60, 0.09)',
                      }
                }
                className="w-full bg-white rounded-[16px] shadow-[0_10px_40px_rgba(20,30,60,0.06)] border border-black/[0.04] p-6 sm:px-7 sm:py-6 transition-all duration-200"
              >
                {/* Accordion Toggle Header Button */}
                <button
                  type="button"
                  id={`faq-btn-${faq.id}`}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${faq.id}`}
                  onClick={() => handleToggle(faq.id)}
                  className="w-full flex items-center gap-6 text-left focus:outline-none cursor-pointer group"
                >
                  {/* Plus/Minus Morphing Icon: 16px wide, '+' when closed, '−' when open */}
                  <div className="w-5 h-5 flex items-center justify-center shrink-0 text-[#0B0B14]">
                    <div className="relative w-4 h-4 flex items-center justify-center">
                      {/* Horizontal bar (always visible) */}
                      <span className="absolute w-4 h-[1.8px] bg-[#0B0B14] rounded-full" />
                      {/* Vertical bar (shrinks to 0 and rotates when open) */}
                      <motion.span
                        animate={{
                          scaleY: isOpen ? 0 : 1,
                          rotate: isOpen ? 90 : 0,
                          opacity: isOpen ? 0 : 1,
                        }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute w-[1.8px] h-4 bg-[#0B0B14] rounded-full origin-center"
                      />
                    </div>
                  </div>

                  {/* Question Title: 18px, weight 500, #0B0B14 */}
                  <span className="font-sans text-[18px] font-medium text-[#0B0B14] group-hover:text-[#4F8FF7] transition-colors leading-snug">
                    {faq.question}
                  </span>
                </button>

                {/* Animated Answer Body */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-answer-${faq.id}`}
                      role="region"
                      aria-labelledby={`faq-btn-${faq.id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        duration: 0.35,
                        ease: [0.22, 1, 0.36, 1] as const,
                      }}
                      className="overflow-hidden"
                    >
                      {/* Indented to align with question text (pl-11 = 20px icon + 24px gap) */}
                      <div className="pt-4 pl-11">
                        <p className="font-sans text-[16px] leading-[28px] text-[#111111]/90">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
