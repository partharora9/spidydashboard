import { useState, type ReactNode } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { ShieldCheck, Play, ArrowRight, ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeroProps {
  category: string;
  badgeIcon?: ReactNode;
  title: string;
  subtitle: string;
  breadcrumbs: BreadcrumbItem[];
  primaryCtaText?: string;
  primaryCtaHref?: string;
  secondaryCtaText?: string;
  onWatchWalkthrough?: () => void;
  authorizedUseNote?: string;
}

export const PageHero = ({
  category,
  badgeIcon = <ShieldCheck className="w-4 h-4 text-[#4F8FF7]" />,
  title,
  subtitle,
  breadcrumbs,
  primaryCtaText = 'Get Student Edition',
  primaryCtaHref = '/pricing',
  secondaryCtaText = 'Watch walkthrough',
  onWatchWalkthrough,
  authorizedUseNote = 'For authorized defensive and security testing only',
}: PageHeroProps) => {
  const prefersReduced = useReducedMotion();
  const [headingDone, setHeadingDone] = useState(false);
  const words = title.split(' ');

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
        delay: 0.12 + customIndex * 0.07,
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    }),
  };

  return (
    <section className="relative w-full pt-[calc(var(--header-h)+env(safe-area-inset-top,0px)+24px)] lg:pt-[calc(var(--header-h)+64px)] pb-8 px-6 overflow-visible select-none">
      <div className="max-w-[1200px] mx-auto flex flex-col items-center text-center">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-[13px] text-gray-500 font-sans mb-6 flex-wrap justify-center"
        >
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <div key={crumb.label} className="flex items-center gap-1.5">
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-400 stroke-[2]" />}
                {crumb.href && !isLast ? (
                  <a
                    href={crumb.href}
                    className="hover:text-[#4F8FF7] transition-colors font-medium"
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className={isLast ? 'text-[#0B0B14] font-semibold' : ''}>
                    {crumb.label}
                  </span>
                )}
              </div>
            );
          })}
        </nav>

        {/* Category Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F2F4FD] border border-[#4F8FF7]/30 text-[#4F8FF7] text-[12px] font-sans font-semibold uppercase tracking-[0.06em] mb-6 shadow-sm"
        >
          {badgeIcon}
          <span>{category}</span>
        </motion.div>

        {/* H1 Heading with clean word reveal and descender room */}
        <h1 className="font-headline font-semibold text-[#0B0B14] text-[36px] sm:text-[52px] lg:text-[66px] tracking-[-0.04em] leading-[1.14] max-w-[1000px] overflow-visible">
          <span
            className={`inline-block pt-[0.12em] px-[0.08em] pb-[0.28em] -mt-[0.12em] -mx-[0.08em] -mb-[0.28em] ${
              headingDone ? 'overflow-visible' : 'overflow-hidden'
            }`}
            style={{ overflowClipMargin: '0.35em' }}
          >
            {words.map((word, idx) => (
              <motion.span
                key={idx}
                custom={idx}
                variants={wordVariants}
                initial="hidden"
                animate="visible"
                onAnimationComplete={() => {
                  if (idx === words.length - 1) setHeadingDone(true);
                }}
                className="inline-block mr-[0.24em] last:mr-0 px-[0.04em]"
              >
                {word}
              </motion.span>
            ))}
          </span>
        </h1>

        {/* Subtitle / Value Proposition */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 font-sans text-[17px] sm:text-[19px] lg:text-[20px] leading-[30px] text-[#444444] max-w-[720px] font-normal"
        >
          {subtitle}
        </motion.p>

        {/* CTA Buttons Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-9 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          {/* Primary CTA: Get Student Edition */}
          <motion.div
            className="relative rounded-full w-full sm:w-auto"
            animate={
              prefersReduced
                ? undefined
                : {
                    boxShadow: [
                      '0 0 0 4px rgba(79,143,247,0.18)',
                      '0 0 0 8px rgba(79,143,247,0.0)',
                      '0 0 0 4px rgba(79,143,247,0.18)',
                    ],
                  }
            }
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <motion.a
              href={primaryCtaHref}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto h-[54px] px-8 rounded-full bg-gradient-to-b from-[#5B9BFA] to-[#3B7FF0] text-white font-sans text-[16px] font-semibold shadow-[0_6px_20px_rgba(59,127,240,0.38)] hover:shadow-[0_10px_28px_rgba(59,127,240,0.5)] transition-all"
            >
              <span>{primaryCtaText}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.2]" />
            </motion.a>
          </motion.div>

          {/* Secondary CTA: Watch Walkthrough */}
          <motion.button
            type="button"
            onClick={onWatchWalkthrough}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto h-[54px] px-7 rounded-full bg-[#F5F5F7] hover:bg-[#EBEBEF] text-[#0B0B14] font-sans text-[16px] font-medium transition-colors border border-black/[0.06] cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current text-[#4F8FF7]" />
            <span>{secondaryCtaText}</span>
          </motion.button>
        </motion.div>

        {/* Security / Authorized Use Micro-badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mt-6 flex items-center gap-2 text-[12px] text-gray-500 font-sans"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>{authorizedUseNote}</span>
          <span className="text-gray-300">•</span>
          <span>Instant source download</span>
        </motion.div>
      </div>
    </section>
  );
};
