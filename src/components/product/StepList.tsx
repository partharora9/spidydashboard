import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

export interface WorkflowStep {
  step: string; // e.g. "01"
  title: string;
  description: string;
  badge?: string;
  codeSnippet?: string;
  details?: string[];
}

interface StepListProps {
  sectionTag?: string;
  sectionTitle: string;
  sectionSubtitle?: string;
  steps: WorkflowStep[];
}

export const StepList = ({
  sectionTag = 'METHODOLOGY',
  sectionTitle,
  sectionSubtitle = 'From raw target input to correlated, actionable security intelligence in four automated stages.',
  steps,
}: StepListProps) => {
  const prefersReduced = useReducedMotion();

  return (
    <section className="relative w-full max-w-[1200px] mx-auto px-6 mt-20 sm:mt-28 overflow-visible select-none">
      {/* Header */}
      <div className="flex flex-col items-center text-center max-w-[800px] mx-auto mb-14 sm:mb-16">
        <div className="inline-flex items-center gap-2 border border-[#0B0B14] rounded-full px-3.5 py-1 mb-4 bg-transparent">
          <span className="font-sans text-[12px] font-medium tracking-[0.06em] uppercase text-[#0B0B14]">
            {sectionTag}
          </span>
        </div>
        <h2 className="font-headline font-semibold text-[32px] sm:text-[44px] lg:text-[52px] leading-[1.15] tracking-[-0.03em] text-[#0B0B14]">
          {sectionTitle}
        </h2>
        {sectionSubtitle && (
          <p className="mt-4 font-sans text-[16px] sm:text-[18px] text-[#555555] leading-relaxed">
            {sectionSubtitle}
          </p>
        )}
      </div>

      {/* Grid of Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7 relative">
        {steps.map((st, idx) => (
          <motion.div
            key={st.step}
            initial={{ opacity: 0, y: prefersReduced ? 0 : 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: idx * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col bg-white rounded-[20px] border border-black/[0.06] p-6 shadow-[0_8px_30px_rgba(20,30,60,0.05)] hover:shadow-[0_16px_45px_rgba(20,30,60,0.1)] hover:border-[#4F8FF7]/40 transition-all duration-300 relative group"
          >
            {/* Step Number + Badge */}
            <div className="flex items-center justify-between mb-4">
              <span className="font-headline font-semibold text-[26px] sm:text-[28px] text-[#4F8FF7] tracking-tight">
                {st.step}
              </span>
              {st.badge && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#F2F4FD] text-[#4F8FF7] text-[11px] font-mono font-medium">
                  {st.badge}
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="font-headline font-semibold text-[18px] sm:text-[20px] text-[#0B0B14] leading-snug">
              {st.title}
            </h3>

            {/* Description */}
            <p className="mt-2.5 text-[14px] sm:text-[15px] text-[#555555] font-sans leading-[24px]">
              {st.description}
            </p>

            {/* Code Snippet / Technical output */}
            {st.codeSnippet && (
              <div className="mt-4 p-2.5 rounded-xl bg-[#0B0F19] text-[#10B981] font-mono text-[12px] leading-relaxed overflow-x-auto border border-white/[0.06]">
                <code>{st.codeSnippet}</code>
              </div>
            )}

            {/* Detail bullet points */}
            {st.details && st.details.length > 0 && (
              <ul className="mt-4 pt-4 border-t border-black/[0.06] space-y-2">
                {st.details.map((d) => (
                  <li key={d} className="flex items-center gap-2 text-[13px] text-[#444444] font-sans">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4F8FF7]" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Step Connector Indicator for Mobile/Tablet */}
            {idx < steps.length - 1 && (
              <div className="lg:hidden flex justify-center py-2 text-gray-300">
                <ArrowDown className="w-4 h-4" />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
};
