import { useState, useRef, useEffect } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { Check, Info, Mail } from 'lucide-react';
import { comparisonGroups } from '../../data/comparison';

export const ComparisonTable = () => {
  const tableRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [isStuck, setIsStuck] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  // Scroll detection for sticky header shadow below 88px navbar
  useEffect(() => {
    const handleScroll = () => {
      if (!tableRef.current) return;
      const rect = tableRef.current.getBoundingClientRect();
      // When table top reaches navbar bottom (88px) and before table ends
      if (rect.top <= 96 && rect.bottom >= 240) {
        setIsStuck(true);
      } else {
        setIsStuck(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      ref={tableRef}
      className="relative w-full max-w-[1200px] mx-auto mt-24 sm:mt-28 lg:mt-[120px] px-6 select-none overflow-visible"
    >
      <div className="w-full overflow-x-auto sm:overflow-visible pb-8">
        <div className="min-w-[700px] lg:min-w-full relative">
          {/* #F5F5F5 Highlight Panel for Complete kit (right column) running full table height */}
          <motion.div
            initial={shouldReduceMotion ? { scaleY: 1 } : { scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
            style={{ transformOrigin: 'top' }}
            className="absolute top-0 right-0 w-[267px] bottom-0 bg-[#F5F5F5] rounded-t-2xl pointer-events-none z-0"
          />

          {/* Sticky Header Row: Standard and Complete kit names + "Get started" buttons */}
          <div
            ref={headerRef}
            className={`sticky top-[88px] z-20 transition-all duration-300 ${
              isStuck
                ? 'bg-white/95 backdrop-blur-md shadow-[0_12px_30px_rgba(20,30,60,0.08)] py-4 rounded-b-2xl border-b border-black/[0.04]'
                : 'bg-transparent py-2'
            }`}
          >
            <div className="grid grid-cols-[1fr_267px_267px] items-center">
              {/* Empty left column */}
              <div className="hidden sm:block" />

              {/* Standard Header Column */}
              <div className="flex flex-col items-center justify-center px-4">
                <span className="font-sans text-[20px] font-medium text-[#0B0B14]">
                  Standard
                </span>
                <div className="mt-3">
                  <motion.a
                    href="mailto:parthxcore@gmail.com?subject=Inquiry to Buy SpidyDashboard Standard (₹499)&body=Hi Parth,%0D%0A%0D%0AI would like to purchase SpidyDashboard Standard (₹499). Please share payment and access details."
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-[240px] px-3 h-[44px] flex items-center justify-center gap-1.5 rounded-full bg-[#4F8FF7] hover:bg-[#3E82EE] text-white font-sans text-[12.5px] font-semibold shadow-[0_4px_14px_rgba(79,143,247,0.3)] transition-all focus:outline-none focus:ring-2 focus:ring-[#4F8FF7] text-center"
                  >
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">connect on parthxcore@gmail.com to buy</span>
                  </motion.a>
                </div>
              </div>

              {/* Complete kit Header Column */}
              <div className="flex flex-col items-center justify-center px-4 relative z-10">
                <span className="font-sans text-[20px] font-medium text-[#0B0B14]">
                  Complete kit
                </span>
                <div className="mt-3">
                  <motion.a
                    href="mailto:parthxcore@gmail.com?subject=Inquiry to Buy SpidyDashboard Complete kit (₹799)&body=Hi Parth,%0D%0A%0D%0AI would like to purchase SpidyDashboard Complete kit (₹799). Please share payment and access details."
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-[240px] px-3 h-[44px] flex items-center justify-center gap-1.5 rounded-full bg-[#4F8FF7] hover:bg-[#3E82EE] text-white font-sans text-[12.5px] font-semibold shadow-[0_4px_14px_rgba(79,143,247,0.3)] transition-all focus:outline-none focus:ring-2 focus:ring-[#4F8FF7] text-center"
                  >
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">connect on parthxcore@gmail.com to buy</span>
                  </motion.a>
                </div>
              </div>
            </div>
          </div>

          {/* Table Groups and Rows */}
          <div className="relative z-10 mt-8">
            {comparisonGroups.map((group, groupIdx) => (
              <div key={group.title} className={groupIdx > 0 ? 'mt-14' : 'mt-4'}>
                {/* Group Heading: 24px weight 600 with 56px space above */}
                <motion.h3
                  initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
                  className="font-headline text-[24px] font-semibold text-[#0B0B14] mb-3 px-2"
                >
                  {group.title}
                </motion.h3>

                {/* Rows in this group */}
                <div className="divide-y divide-black/[0.08] border-t border-black/[0.08]">
                  {group.rows.map((row, rowIdx) => (
                    <motion.div
                      key={row.label}
                      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{
                        delay: rowIdx * 0.05,
                        duration: 0.5,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="grid grid-cols-[1fr_267px_267px] items-center h-[65px] hover:bg-[#F8FAFF] transition-colors rounded-lg group"
                    >
                      {/* Label Column with 20px Info Icon & Tooltip */}
                      <div className="flex items-center gap-2.5 px-4 overflow-visible relative">
                        <span className="font-sans text-[18px] text-[#0B0B14] leading-normal font-normal">
                          {row.label}
                        </span>

                        {/* Info tooltip trigger */}
                        <div
                          className="relative inline-flex items-center cursor-help focus:outline-none"
                          onMouseEnter={() => setActiveTooltip(row.label)}
                          onMouseLeave={() => setActiveTooltip(null)}
                          onFocus={() => setActiveTooltip(row.label)}
                          onBlur={() => setActiveTooltip(null)}
                          tabIndex={0}
                          role="button"
                          aria-label={`More information about ${row.label}`}
                        >
                          <Info className="w-5 h-5 text-gray-400 group-hover:text-[#4F8FF7] transition-colors stroke-[1.8]" />

                          {/* Tooltip Popup */}
                          <AnimatePresence>
                            {activeTooltip === row.label && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 6 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 4 }}
                                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                                className="absolute left-6 top-1/2 -translate-y-1/2 z-50 w-[260px] bg-[#0B0B14] text-white text-[13px] leading-relaxed p-3 rounded-xl shadow-xl border border-white/10 pointer-events-none"
                              >
                                {row.tooltip}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Standard Column Value */}
                      <div className="flex items-center justify-center font-sans text-[16px] text-center">
                        {typeof row.standard === 'boolean' ? (
                          row.standard ? (
                            <Check
                              className="w-5 h-5 text-black stroke-[2]"
                              aria-label="Included"
                            />
                          ) : (
                            <span
                              className="text-gray-400 text-lg font-light"
                              aria-label="Not included"
                            >
                              –
                            </span>
                          )
                        ) : (
                          <span className="font-medium text-[#0B0B14]">
                            {row.standard}
                          </span>
                        )}
                      </div>

                      {/* Complete kit Column Value (inside highlight panel) */}
                      <div className="flex items-center justify-center font-sans text-[16px] text-center relative z-10">
                        {typeof row.complete === 'boolean' ? (
                          row.complete ? (
                            <Check
                              className="w-5 h-5 text-black stroke-[2]"
                              aria-label="Included"
                            />
                          ) : (
                            <span
                              className="text-gray-400 text-lg font-light"
                              aria-label="Not included"
                            >
                              –
                            </span>
                          )
                        ) : (
                          <span className="font-medium text-[#0B0B14]">
                            {row.complete}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Divider */}
          <div className="w-full h-[1px] bg-black/[0.08] mt-6" />
        </div>
      </div>
    </section>
  );
};
