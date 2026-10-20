import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

export interface RelatedPageItem {
  title: string;
  category: string;
  description: string;
  href: string;
}

interface RelatedPagesProps {
  heading?: string;
  pages: RelatedPageItem[];
}

export const RelatedPages = ({
  heading = 'Explore Related Capabilities & Documentation',
  pages,
}: RelatedPagesProps) => {
  return (
    <section className="relative w-full max-w-[1200px] mx-auto px-6 mt-24 sm:mt-32 overflow-visible select-none">
      <div className="flex flex-col items-center text-center mb-10">
        <div className="inline-flex items-center gap-2 border border-[#0B0B14] rounded-full px-3.5 py-1 mb-3 bg-transparent">
          <span className="font-sans text-[12px] font-medium tracking-[0.06em] uppercase text-[#0B0B14]">
            ECOSYSTEM
          </span>
        </div>
        <h3 className="font-headline font-semibold text-[26px] sm:text-[34px] text-[#0B0B14] tracking-[-0.03em]">
          {heading}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pages.map((p) => (
          <motion.a
            key={p.href}
            href={p.href}
            whileHover={{ y: -4 }}
            className="flex flex-col justify-between p-6 rounded-[22px] bg-white border border-black/[0.06] shadow-[0_8px_30px_rgba(20,30,60,0.05)] hover:shadow-[0_16px_45px_rgba(20,30,60,0.1)] hover:border-[#4F8FF7]/40 transition-all duration-300 group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#4F8FF7]">
                  {p.category}
                </span>
                <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-[#4F8FF7] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <h4 className="font-headline font-semibold text-[18px] sm:text-[19px] text-[#0B0B14] group-hover:text-[#4F8FF7] transition-colors leading-snug">
                {p.title}
              </h4>
              <p className="mt-2 text-[14px] text-[#555555] font-sans leading-[22px]">
                {p.description}
              </p>
            </div>

            <div className="mt-6 pt-3 border-t border-black/[0.05] flex items-center gap-1.5 text-[13px] font-medium text-[#4F8FF7]">
              <span>Read guide</span>
              <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
};
