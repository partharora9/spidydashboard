import { useState } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { blogsData } from '../data/blogs';
import { BlogCard } from './BlogCard';

export const BlogsSection = () => {
  const prefersReduced = useReducedMotion();
  const [headingDone, setHeadingDone] = useState(false);
  const headingWords = ['Latest', 'from', 'the', 'blog'];

  const wordVariants: Variants = {
    hidden: {
      y: prefersReduced ? 0 : 40,
      opacity: 0,
      filter: prefersReduced ? 'none' : 'blur(12px)',
    },
    visible: (idx: number) => ({
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      transition: {
        delay: idx * 0.08,
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    }),
  };

  return (
    <section className="w-full bg-white relative overflow-visible">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Heading: Centered, 64px, weight 600, letter-spacing -0.04em, line-height 1.18, 0.1em pb */}
        <h2 className="mt-16 mb-[72px] text-center font-headline font-semibold text-[36px] sm:text-[48px] lg:text-[64px] leading-[1.18] pb-[0.1em] tracking-[-0.04em] text-[#0B0B14] overflow-visible">
          <span
            className={`inline-block pt-[0.12em] px-[0.08em] pb-[0.32em] -mt-[0.12em] -mx-[0.08em] -mb-[0.32em] ${
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
                className="inline-block mr-[0.28em] last:mr-0 px-[0.06em]"
              >
                {word}
              </motion.span>
            ))}
          </span>
        </h2>

        {/* 3x2 Card Grid: 3 cols desktop, 2 cols tablet, 1 col mobile */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7 lg:gap-x-10 lg:gap-y-9 justify-items-center">
          {blogsData.map((post, index) => (
            <BlogCard key={post.id} post={post} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
