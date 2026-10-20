import { useRef, useState, type MouseEvent } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  useReducedMotion,
  type Variants,
} from 'framer-motion';
import { AboutDashboardMock } from './AboutDashboardMock';

interface GridSquare {
  id: string;
  row: number;
  col: number;
  initialOpacity: number;
  delay: number;
  duration: number;
}

const generateCornerSquares = (prefix: string, rows: number, cols: number): GridSquare[] => {
  const squares: GridSquare[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const seed = (r * 13 + c * 19) % 10;
      const initialOpacity = 0.1 + (seed / 10) * 0.35; // between 0.1 and 0.45
      const delay = (seed * 0.25) % 2.5;
      const duration = 2.4 + (seed % 3) * 0.9;
      squares.push({
        id: `${prefix}-${r}-${c}`,
        row: r,
        col: c,
        initialOpacity,
        delay,
        duration,
      });
    }
  }
  return squares;
};

const leftCornerSquares = generateCornerSquares('hero-left', 4, 6);
const rightCornerSquares = generateCornerSquares('hero-right', 4, 6);

export const AboutHero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const photoContainerRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  // State for image load error: fall back to code-built dashboard mock
  const [imageError, setImageError] = useState(false);

  // Descender clipping flags: keep overflow visible once animated
  const [line1Done, setLine1Done] = useState(false);
  const [line2Done, setLine2Done] = useState(false);

  // Parallax scroll effect on the photo
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const photoParallaxY = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReduced ? [0, 0] : [-15, 30]
  );

  // 3D Tilt for Photo (max 2deg)
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const smoothTiltX = useSpring(tiltX, { stiffness: 200, damping: 25 });
  const smoothTiltY = useSpring(tiltY, { stiffness: 200, damping: 25 });

  const handlePhotoMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (prefersReduced || !photoContainerRef.current) return;
    const rect = photoContainerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5
    tiltX.set(y * -2); // Max 2deg
    tiltY.set(x * 2);  // Max 2deg
  };

  const handlePhotoMouseLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  // Heading word animations
  const headingLine1 = ['Empower', 'Your', 'Security'];
  const headingLine2 = ['Journey', 'With', 'Us'];

  const wordVariants: Variants = {
    hidden: {
      y: prefersReduced ? 0 : 40,
      opacity: 0,
      filter: prefersReduced ? 'none' : 'blur(12px)',
    },
    visible: (customIndex: number) => ({
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      transition: {
        delay: 0.15 + customIndex * 0.08,
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    }),
  };

  return (
    <section
      ref={sectionRef}
      className="relative w-full flex flex-col items-center justify-start overflow-visible pt-[calc(var(--header-h)+env(safe-area-inset-top,0px)+16px)] lg:pt-[calc(var(--header-h)+16px)] px-4 sm:px-6"
    >
      {/* SECTION 1 HERO BACKGROUND PANEL: Wider than container (~1546px), top rounded */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[1546px] rounded-t-[28px] sm:rounded-t-[36px] lg:rounded-t-[44px] relative overflow-hidden flex flex-col items-center pt-10 sm:pt-14 lg:pt-[90px]"
        style={{
          background:
            'linear-gradient(180deg, #FFFFFF 0%, #E8F8FC 32%, #DDF7FF 60%, #9BC4FD 92%, #6FA5FB 100%)',
          maskImage:
            'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 88%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 88%, rgba(0,0,0,0) 100%)',
        }}
      >
        {/* Ambient Drifting Glow Orbs (+/-24px drift, scale 1 to 1.06, 10s alternate loop) */}
        {!prefersReduced && (
          <>
            {/* Middle Aqua Glow */}
            <motion.div
              animate={{
                x: [-24, 24, -24],
                y: [-12, 12, -12],
                scale: [1, 1.06, 1],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle, rgba(221, 247, 255, 0.75) 0%, rgba(191, 224, 255, 0.45) 50%, rgba(111, 165, 251, 0) 75%)',
                filter: 'blur(45px)',
              }}
            />

            {/* Bottom Blue Glow */}
            <motion.div
              animate={{
                x: [24, -24, 24],
                y: [10, -10, 10],
                scale: [1.05, 1, 1.05],
              }}
              transition={{
                duration: 11,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1,
              }}
              className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[900px] h-[450px] rounded-full pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle, rgba(111, 165, 251, 0.6) 0%, rgba(79, 143, 247, 0.35) 45%, rgba(111, 165, 251, 0) 75%)',
                filter: 'blur(50px)',
              }}
            />
          </>
        )}

        {/* Lower-Left Corner Subtle Grid Pattern (~66px squares, 1px rgba(255,255,255,0.3) lines) */}
        <div
          className="absolute bottom-0 left-0 w-[396px] h-[264px] pointer-events-none grid grid-cols-6 grid-rows-4 z-0"
          style={{
            maskImage:
              'radial-gradient(circle at 0% 100%, rgba(0, 0, 0, 0.8) 25%, rgba(0, 0, 0, 0) 80%)',
            WebkitMaskImage:
              'radial-gradient(circle at 0% 100%, rgba(0, 0, 0, 0.8) 25%, rgba(0, 0, 0, 0) 80%)',
          }}
        >
          {leftCornerSquares.map((sq) => (
            <motion.div
              key={sq.id}
              className="w-[66px] h-[66px] border border-white/30 bg-white/[0.08]"
              animate={
                prefersReduced
                  ? { opacity: sq.initialOpacity }
                  : {
                      opacity: [sq.initialOpacity, 0.5, sq.initialOpacity],
                    }
              }
              transition={{
                duration: sq.duration,
                repeat: Infinity,
                delay: sq.delay,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* Lower-Right Corner Subtle Grid Pattern (~66px squares, 1px rgba(255,255,255,0.3) lines) */}
        <div
          className="absolute bottom-0 right-0 w-[396px] h-[264px] pointer-events-none grid grid-cols-6 grid-rows-4 z-0"
          style={{
            maskImage:
              'radial-gradient(circle at 100% 100%, rgba(0, 0, 0, 0.8) 25%, rgba(0, 0, 0, 0) 80%)',
            WebkitMaskImage:
              'radial-gradient(circle at 100% 100%, rgba(0, 0, 0, 0.8) 25%, rgba(0, 0, 0, 0) 80%)',
          }}
        >
          {rightCornerSquares.map((sq) => (
            <motion.div
              key={sq.id}
              className="w-[66px] h-[66px] border border-white/30 bg-white/[0.08]"
              animate={
                prefersReduced
                  ? { opacity: sq.initialOpacity }
                  : {
                      opacity: [sq.initialOpacity, 0.5, sq.initialOpacity],
                    }
              }
              transition={{
                duration: sq.duration,
                repeat: Infinity,
                delay: sq.delay + 0.35,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* Central Content Container: Max 1200px centered */}
        <div className="relative z-10 max-w-[1200px] w-full mx-auto px-4 sm:px-6 flex flex-col items-center text-center overflow-visible">
          {/* H1 Heading: 72px (clamp 40px to 72px), weight 600, line-height 1.15, letter-spacing -0.04em, color #0B0B14 */}
          <h1 className="font-headline font-semibold text-[38px] sm:text-[56px] lg:text-[72px] leading-[1.15] tracking-[-0.04em] text-[#0B0B14] overflow-visible max-w-[960px]">
            {/* Line 1 */}
            <span
              className={`block pt-[0.12em] px-[0.08em] pb-[0.28em] -mt-[0.12em] -mx-[0.08em] -mb-[0.28em] ${
                line1Done ? 'overflow-visible' : 'overflow-hidden'
              }`}
              style={{ overflowClipMargin: '0.35em' }}
            >
              {headingLine1.map((word, idx) => (
                <motion.span
                  key={word}
                  custom={idx}
                  variants={wordVariants}
                  initial="hidden"
                  animate="visible"
                  onAnimationComplete={() => {
                    if (idx === headingLine1.length - 1) setLine1Done(true);
                  }}
                  className="inline-block mr-[0.24em] last:mr-0 px-[0.04em]"
                >
                  {word}
                </motion.span>
              ))}
            </span>

            {/* Line 2 */}
            <span
              className={`block pt-[0.12em] px-[0.08em] pb-[0.28em] -mt-[0.12em] -mx-[0.08em] -mb-[0.28em] ${
                line2Done ? 'overflow-visible' : 'overflow-hidden'
              }`}
              style={{ overflowClipMargin: '0.35em' }}
            >
              {headingLine2.map((word, idx) => (
                <motion.span
                  key={word}
                  custom={headingLine1.length + idx}
                  variants={wordVariants}
                  initial="hidden"
                  animate="visible"
                  onAnimationComplete={() => {
                    if (idx === headingLine2.length - 1) setLine2Done(true);
                  }}
                  className="inline-block mr-[0.24em] last:mr-0 px-[0.04em]"
                >
                  {word}
                </motion.span>
              ))}
            </span>
          </h1>

          {/* Subtitle: margin-top 24px, 18px, line-height 28px, #444, max-width 480px, centered, 2 lines */}
          <motion.p
            initial={{ opacity: 0, y: prefersReduced ? 0 : 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.4,
              ease: [0.22, 1, 0.36, 1] as const,
            }}
            className="mt-6 text-[16px] sm:text-[18px] leading-[28px] text-[#444444] max-w-[480px] mx-auto text-center font-sans"
          >
            SpidyDashboard brings attack surface discovery and OSINT into one clear view, built by a working SOC Analyst.
          </motion.p>

          {/* Photo Section: margin-top ~64px, 1200px wide container, top corners radius 24px, height ~560px, cropped by section bottom */}
          <div
            ref={photoContainerRef}
            onMouseMove={handlePhotoMouseMove}
            onMouseLeave={handlePhotoMouseLeave}
            className="mt-12 sm:mt-16 w-full max-w-[1200px] mx-auto overflow-hidden rounded-t-[24px] select-none"
            style={{ perspective: 1200 }}
          >
            {/* Rises from y:80 with opacity 0 to 1 and a clip-path reveal (inset(100% 0 0 0) to inset(0% 0 0 0)), 1.1s */}
            <motion.div
              initial={
                prefersReduced
                  ? { opacity: 0 }
                  : {
                      y: 80,
                      opacity: 0,
                      clipPath: 'inset(100% 0% 0% 0%)',
                    }
              }
              animate={{
                y: 0,
                opacity: 1,
                clipPath: 'inset(0% 0% 0% 0%)',
              }}
              transition={{
                duration: 1.1,
                delay: 0.5,
                ease: [0.22, 1, 0.36, 1] as const,
              }}
              style={{
                rotateX: smoothTiltX,
                rotateY: smoothTiltY,
                transformStyle: 'preserve-3d',
              }}
              className="relative w-full h-[320px] sm:h-[460px] lg:h-[560px] overflow-hidden rounded-t-[24px] bg-[#0B0F19]"
            >
              {/* Inner container with scale 1.12 to 1 and scroll parallax */}
              <motion.div
                initial={prefersReduced ? { scale: 1 } : { scale: 1.12 }}
                animate={{ scale: 1 }}
                transition={{
                  duration: 1.2,
                  delay: 0.5,
                  ease: [0.22, 1, 0.36, 1] as const,
                }}
                style={{ y: photoParallaxY }}
                className="w-full h-full"
              >
                {!imageError ? (
                  <picture className="w-full h-full block">
                    <source srcSet="/photos/about-hero.webp" type="image/webp" />
                    <source srcSet="/photos/about-hero.png" type="image/png" />
                    <source srcSet="/photos/about-hero.jpg" type="image/jpeg" />
                    <img
                      src="/photos/about-hero.png"
                      alt="SpidyDashboard — OSINT Threat Intelligence Dashboard created by Parth Arora"
                      width={1200}
                      height={560}
                      fetchPriority="high"
                      onError={() => setImageError(true)}
                      className="w-full h-full object-cover object-top rounded-t-[24px]"
                    />
                  </picture>
                ) : (
                  /* Fallback when image is missing or fails to load */
                  <AboutDashboardMock />
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
