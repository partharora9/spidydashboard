import { useState } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { Crosshair, Shield, ArrowUpRight, Globe, Mail } from 'lucide-react';
import { developerBioData } from '../../data/developerBio';
import { socialLinks } from '../../lib/socialLinks';

export const DeveloperBio = () => {
  const prefersReduced = useReducedMotion();
  const [headingDone, setHeadingDone] = useState(false);

  const headingWords = ['Behind', 'the', 'Dashboard'];

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

  const fadeUpVariants: Variants = {
    hidden: {
      opacity: 0,
      y: prefersReduced ? 0 : 24,
    },
    visible: (customDelay: number = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: customDelay,
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    }),
  };

  return (
    <section
      aria-labelledby="developer-bio-heading"
      className="relative w-full max-w-[1200px] mx-auto px-6 mt-[100px] sm:mt-[120px] lg:mt-[140px] overflow-visible select-none"
    >
      {/* Section Header: Open editorial style with category tag, NO BOX */}
      <div className="flex flex-col items-start overflow-visible border-b border-black/[0.08] pb-8 sm:pb-10">
        <div className="inline-flex items-center gap-2 border border-[#0B0B14] rounded-full px-3.5 py-1 mb-4 bg-transparent">
          <span className="font-sans text-[12px] font-medium tracking-[0.06em] uppercase text-[#0B0B14]">
            Creator &amp; Methodology
          </span>
        </div>

        <h2
          id="developer-bio-heading"
          className="font-headline font-semibold text-[36px] sm:text-[48px] lg:text-[64px] leading-[1.15] tracking-[-0.04em] text-[#0B0B14] overflow-visible"
        >
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

      {/* Main Two-Column Editorial Content: Completely open, NO BOX */}
      <div className="mt-12 sm:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* LEFT COLUMN (lg:col-span-5): Identity Panel */}
        <motion.div
          custom={0.2}
          variants={fadeUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="lg:col-span-5 flex flex-col justify-between"
        >
          <div>
            {/* Monogram circle + Name & Role */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 shrink-0 rounded-full bg-[#0B0B14] text-white flex items-center justify-center font-headline font-semibold text-[22px] tracking-wide select-none shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
                {developerBioData.monogram}
              </div>

              <div className="flex flex-col">
                <h3 className="font-headline font-semibold text-[26px] sm:text-[30px] text-[#0B0B14] tracking-[-0.02em] leading-tight">
                  {developerBioData.name}
                </h3>
                {/* Role Pill */}
                <div className="inline-flex items-center gap-2 border border-[#4F8FF7]/40 bg-[#F2F4FD] rounded-full px-3 py-0.5 w-fit mt-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4F8FF7] animate-pulse" />
                  <span className="font-sans text-[11px] font-semibold tracking-[0.06em] uppercase text-[#4F8FF7]">
                    {developerBioData.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Editorial Quote: Open, subtle accent line, NO BOX */}
            <div className="mt-8 border-l-2 border-[#4F8FF7] pl-5 py-1">
              <p className="font-sans text-[16px] sm:text-[17px] leading-[28px] text-[#333333] italic">
                &ldquo;{developerBioData.quote}&rdquo;
              </p>
            </div>
          </div>

          {/* Direct Profile Links in website pill style */}
          <div className="mt-10 pt-6 border-t border-black/[0.08]">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-[#0B0B14] font-headline block mb-3.5">
              Direct Profiles:
            </span>
            <div className="flex items-center gap-2.5 flex-wrap">
              {socialLinks.map((link) => (
                <motion.a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.ariaLabel}
                  whileHover={
                    prefersReduced
                      ? undefined
                      : {
                          y: -2,
                          scale: 1.02,
                          transition: { duration: 0.2 },
                        }
                  }
                  whileTap={{ scale: 0.97 }}
                  className="group/pill inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-sans text-[13px] font-medium text-[#4F8FF7] bg-white border border-[#4F8FF7]/30 hover:bg-[#4F8FF7] hover:text-white hover:border-[#4F8FF7] shadow-[0_2px_8px_rgba(79,143,247,0.12)] hover:shadow-[0_4px_14px_rgba(79,143,247,0.3)] transition-all duration-200"
                >
                  {link.iconType === 'email' && <Mail className="w-3.5 h-3.5" />}
                  {link.iconType === 'portfolio' && <Globe className="w-3.5 h-3.5" />}
                  {link.iconType === 'linkedin' && (
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c-.97 0-1.75-.79-1.75-1.76s.78-1.76 1.75-1.76 1.75.79 1.75 1.76-.78 1.76-1.75 1.76m1.4 9.74v-8.37H5.06v8.37h2.8Z" />
                    </svg>
                  )}
                  {link.iconType === 'facebook' && (
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95C18.05 21.45 22 17.19 22 12Z" />
                    </svg>
                  )}
                  <span>{link.label}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.2] group-hover/pill:translate-x-0.5 group-hover/pill:-translate-y-0.5 transition-transform" />
                </motion.a>
              ))}
            </div>
          </div>
        </motion.div>

        {/* RIGHT COLUMN (lg:col-span-7): Bio Content - Open, NO BOX */}
        <motion.div
          custom={0.3}
          variants={fadeUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="lg:col-span-7 flex flex-col justify-between"
        >
          {/* Main Statement */}
          <p className="font-headline font-medium text-[22px] sm:text-[26px] lg:text-[28px] leading-[1.35] text-[#0B0B14] tracking-[-0.02em]">
            {developerBioData.intro}
          </p>

          {/* Offense & Defense: Clean open sections with dividers, NO BOX */}
          <div className="mt-10 pt-8 border-t border-black/[0.08] space-y-10">
            {developerBioData.blocks.map((block) => (
              <div key={block.id} className="flex flex-col">
                {/* Block Title with subtle icon badge */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#F2F4FD] flex items-center justify-center text-[#4F8FF7]">
                    {block.iconType === 'offense' ? (
                      <Crosshair className="w-4 h-4 stroke-[2.2]" />
                    ) : (
                      <Shield className="w-4 h-4 stroke-[2.2]" />
                    )}
                  </div>
                  <h3 className="font-headline font-semibold text-[20px] sm:text-[22px] text-[#0B0B14]">
                    {block.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="mt-3.5 text-[15px] sm:text-[16px] leading-[26px] text-[#555555] font-sans">
                  {block.description}
                </p>

                {/* Pill Tags: Clean site style */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {block.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3.5 py-1.5 rounded-full bg-[#F5F5F7] hover:bg-[#EBEBEF] text-[#0B0B14] transition-colors text-[12px] font-sans font-medium cursor-default"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Closing Line with terminal prompt */}
          <div className="mt-10 pt-6 border-t border-black/[0.08] flex items-center gap-2.5 text-[14px] sm:text-[15px] text-[#555555] font-mono">
            <span className="text-[#4F8FF7] font-semibold text-[16px] select-none">&gt;_</span>
            <span>{developerBioData.closing}</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

