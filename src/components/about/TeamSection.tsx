import { useState } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { teamMembers } from '../../data/team';
import { TeamRow } from './TeamRow';

export const TeamSection = () => {
  const prefersReduced = useReducedMotion();
  const [headingDone, setHeadingDone] = useState(false);

  const headingWords = ['Meet', 'the', 'person', 'behind', 'it'];

  const wordVariants: Variants = {
    hidden: {
      y: prefersReduced ? 0 : 40,
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
    <section className="relative w-full max-w-[1200px] mx-auto px-6 mt-[100px] sm:mt-[120px] lg:mt-[140px] overflow-visible">
      {/* H2 Title with word reveal and zero descender clipping */}
      <div className="flex justify-center text-center overflow-visible">
        <h2 className="font-headline font-semibold text-[32px] sm:text-[48px] lg:text-[64px] leading-[1.15] tracking-[-0.04em] text-[#0B0B14] overflow-visible">
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

      {/* Team Rows Container (1200px max, margin-top 72px, gap 20px) */}
      <div className="mt-10 sm:mt-14 lg:mt-[72px] flex flex-col gap-5 w-full overflow-visible">
        {teamMembers.map((member, index) => (
          <TeamRow key={member.id} member={member} index={index} />
        ))}
      </div>

      {/* Under-list CTA prompt: "Want to build something together? Get in touch." */}
      <motion.div
        initial={{ opacity: 0, y: prefersReduced ? 0 : 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{
          delay: 0.35,
          duration: 0.6,
          ease: [0.22, 1, 0.36, 1] as const,
        }}
        className="mt-8 text-center"
      >
        <p className="font-sans text-[15px] sm:text-[16px] text-[#555555]">
          Want to build something together or buy?{' '}
          <a
            href="mailto:hello@spidydashboard.com?subject=Inquiry to Parth Arora (SpidyDashboard)"
            className="text-[#4F8FF7] hover:underline font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#4F8FF7]/40 rounded px-1"
          >
            Connect on hello@spidydashboard.com
          </a>
        </p>
      </motion.div>
    </section>
  );
};
