import { useRef, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { HomepageCard } from './homepages/HomepageCard';

export const HomepagesSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [line1Done, setLine1Done] = useState(false);
  const [line2Done, setLine2Done] = useState(false);

  // Track active slide on mobile horizontal scroll
  const handleScroll = () => {
    if (!carouselRef.current) return;
    const { scrollLeft, clientWidth } = carouselRef.current;
    if (clientWidth > 0) {
      const idx = Math.round(scrollLeft / (clientWidth * 0.82));
      setActiveIndex(Math.max(0, Math.min(idx, 2)));
    }
  };

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
      className="relative w-full bg-white pt-16 pb-[120px] px-4 sm:px-6 overflow-visible"
    >
      <div className="max-w-[1200px] mx-auto flex flex-col items-center">
        {/* Centered 2-line Heading: line-height 1.18, 0.1em bottom padding */}
        <h2 className="font-headline font-semibold text-[#0B0B14] text-[34px] sm:text-[56px] lg:text-[72px] tracking-[-0.04em] leading-[1.18] pb-[0.1em] text-center mb-12 lg:mb-[72px] max-w-[960px] overflow-visible">
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
            - Mobile (<640px): horizontal scroll-snap carousel at 80% width, 16px gap, 10% peek
        */}
        <div
          ref={carouselRef}
          onScroll={handleScroll}
          className="w-full flex sm:grid sm:grid-cols-2 lg:grid-cols-3 overflow-x-auto sm:overflow-visible snap-x snap-mandatory pb-4 sm:pb-0 gap-4 sm:gap-8 lg:gap-10 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none"
          style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
        >
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
                isActive={activeIndex === index}
              />
            </div>
          ))}
        </div>

        {/* Mobile Dots Indicator (<640px) */}
        <div
          className="flex sm:hidden items-center justify-center gap-2 mt-5"
          role="tablist"
          aria-label="Preview cards navigation"
        >
          {previewCards.map((card, idx) => (
            <button
              key={card.label}
              type="button"
              role="tab"
              aria-selected={activeIndex === idx}
              aria-label={`Go to ${card.label} card`}
              onClick={() => {
                if (carouselRef.current) {
                  const cardEl = carouselRef.current.children[idx] as HTMLElement;
                  if (cardEl) {
                    cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                  }
                }
                setActiveIndex(idx);
              }}
              className={`transition-all rounded-full min-h-[44px] min-w-[24px] flex items-center justify-center cursor-pointer`}
            >
              <span
                className={`transition-all rounded-full ${
                  activeIndex === idx ? 'w-6 h-2 bg-[#4F8FF7]' : 'w-2 h-2 bg-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
