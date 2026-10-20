import { type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export interface CapabilityItem {
  icon: ReactNode;
  title: string;
  description: string;
  tag?: string;
  specs?: string[];
}

interface FeatureGridProps {
  sectionTag?: string;
  sectionTitle: string;
  sectionSubtitle?: string;
  features: CapabilityItem[];
  columns?: 3 | 4;
}

export const FeatureGrid = ({
  sectionTag = 'CAPABILITIES',
  sectionTitle,
  sectionSubtitle,
  features,
  columns = 3,
}: FeatureGridProps) => {
  const prefersReduced = useReducedMotion();

  const gridClasses =
    columns === 4
      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'
      : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7';

  return (
    <section className="relative w-full max-w-[1200px] mx-auto px-6 mt-20 sm:mt-28 overflow-visible select-none">
      {/* Header */}
      <div className="flex flex-col items-center text-center max-w-[800px] mx-auto mb-14">
        {sectionTag && (
          <div className="inline-flex items-center gap-2 border border-[#0B0B14] rounded-full px-3.5 py-1 mb-4 bg-transparent">
            <span className="font-sans text-[12px] font-medium tracking-[0.06em] uppercase text-[#0B0B14]">
              {sectionTag}
            </span>
          </div>
        )}
        <h2 className="font-headline font-semibold text-[32px] sm:text-[44px] lg:text-[52px] leading-[1.15] tracking-[-0.03em] text-[#0B0B14]">
          {sectionTitle}
        </h2>
        {sectionSubtitle && (
          <p className="mt-4 font-sans text-[16px] sm:text-[18px] text-[#555555] leading-relaxed">
            {sectionSubtitle}
          </p>
        )}
      </div>

      {/* Grid */}
      <div className={gridClasses}>
        {features.map((feat, idx) => (
          <motion.div
            key={feat.title}
            initial={{ opacity: 0, y: prefersReduced ? 0 : 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: idx * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            whileHover={prefersReduced ? undefined : { y: -4 }}
            className="flex flex-col justify-between bg-white rounded-[22px] border border-black/[0.06] p-7 shadow-[0_10px_35px_rgba(20,30,60,0.05)] hover:shadow-[0_20px_50px_rgba(20,30,60,0.1)] hover:border-[#4F8FF7]/40 transition-all duration-300 group"
          >
            <div>
              {/* Top Row: Icon + Tag */}
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-xl bg-[#F2F4FD] group-hover:bg-[#4F8FF7] text-[#4F8FF7] group-hover:text-white transition-colors duration-300 flex items-center justify-center shadow-sm">
                  {feat.icon}
                </div>
                {feat.tag && (
                  <span className="px-2.5 py-1 rounded-full bg-[#F5F5F7] group-hover:bg-[#F2F4FD] text-[#0B0B14] group-hover:text-[#4F8FF7] text-[11px] font-mono font-medium transition-colors">
                    {feat.tag}
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="font-headline font-semibold text-[20px] text-[#0B0B14] group-hover:text-[#4F8FF7] transition-colors leading-snug">
                {feat.title}
              </h3>

              {/* Description */}
              <p className="mt-2.5 text-[14px] sm:text-[15px] text-[#555555] font-sans leading-[24px]">
                {feat.description}
              </p>
            </div>

            {/* Spec Chips / Highlights */}
            {feat.specs && feat.specs.length > 0 && (
              <div className="mt-6 pt-4 border-t border-black/[0.05] flex flex-wrap gap-1.5">
                {feat.specs.map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-0.5 rounded-full bg-[#F5F5F7] text-[11px] font-mono text-[#444444]"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
};
