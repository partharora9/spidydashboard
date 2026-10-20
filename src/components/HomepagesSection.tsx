import { useRef, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { HomepageCard } from './homepages/HomepageCard';

export const HomepagesSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [line1Done, setLine1Done] = useState(false);
  const [line2Done, setLine2Done] = useState(false);

  // Heading split words for exact 2-line desktop layout
  const line1Words = ['See', 'every', 'risk'];
  const line2Words = ['in', 'one', 'place.'];

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

  const previewCards = [
    {
      label: 'Dashboard',
      videoSrc: '/videos/dashboard.mp4',
      poster: '/videos/dashboard-poster.jpg',
      delayIndex: 0,
      idleDelay: 0,
      staggerDelay: 0,
    },
    {
      label: 'Threat Map',
      videoSrc: '/videos/threat-map.mp4',
      poster: '/videos/threat-map-poster.jpg',
      delayIndex: 1,
      idleDelay: 1.5,
      staggerDelay: 0.3,
    },
    {
      label: 'Recon',
      videoSrc: '/videos/recon.mp4',
      poster: '/videos/recon-poster.jpg',
      delayIndex: 2,
      idleDelay: 3.0,
      staggerDelay: 0.6,
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-white pt-16 pb-[120px] px-6 overflow-visible"
    >
      <div className="max-w-[1200px] mx-auto flex flex-col items-center">
        {/* Centered 2-line Heading: line-height 1.18, 0.1em bottom padding, no clipping on "every" (y) or "place" (p), no shaving on "S" or "i" */}
        <h2 className="font-headline font-semibold text-[#0B0B14] text-[40px] sm:text-[56px] lg:text-[72px] tracking-[-0.04em] leading-[1.18] pb-[0.1em] text-center mb-16 lg:mb-[72px] max-w-[960px] overflow-visible">
          {/* Line 1 */}
          <span
            className={`block pt-[0.12em] px-[0.08em] pb-[0.32em] -mt-[0.12em] -mx-[0.08em] -mb-[0.32em] ${
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
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                onAnimationComplete={() => {
                  if (idx === line1Words.length - 1) setLine1Done(true);
                }}
                className="inline-block mr-[0.26em] last:mr-0 px-[0.06em]"
              >
                {word}
              </motion.span>
            ))}
          </span>
          {/* Line 2 */}
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
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                onAnimationComplete={() => {
                  if (idx === line2Words.length - 1) setLine2Done(true);
                }}
                className="inline-block mr-[0.26em] last:mr-0 px-[0.06em]"
              >
                {word}
              </motion.span>
            ))}
          </span>
        </h2>

        {/* Responsive Grid/Carousel:
            - Desktop (>=1024px): 3 equal columns, 40px gap
            - Tablet (640-1023px): 2 columns, third card centered below
            - Mobile (<640px): horizontal scroll-snap carousel at 80% width
        */}
        <div className="w-full flex sm:grid sm:grid-cols-2 lg:grid-cols-3 overflow-x-auto sm:overflow-visible snap-x snap-mandatory pb-6 sm:pb-0 gap-6 sm:gap-8 lg:gap-10 -mx-6 px-6 sm:mx-0 sm:px-0">
          {previewCards.map((card, index) => (
            <div
              key={card.label}
              className={`w-[80vw] max-w-[340px] flex-shrink-0 snap-center sm:w-full sm:max-w-[360px] flex justify-center ${
                index === 2 ? 'sm:col-span-2 lg:col-span-1' : 'sm:col-span-1'
              }`}
            >
              <HomepageCard
                label={card.label}
                videoSrc={card.videoSrc}
                poster={card.poster}
                delayIndex={card.delayIndex}
                idleDelay={card.idleDelay}
                staggerDelay={card.staggerDelay}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
