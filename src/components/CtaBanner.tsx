import { useRef, useState, type MouseEvent } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
  type Variants,
} from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

interface GridSquare {
  id: string;
  row: number;
  col: number;
  initialOpacity: number;
  delay: number;
  duration: number;
}

// Generate structured corner grid data
const generateCornerSquares = (prefix: string, rows: number, cols: number): GridSquare[] => {
  const squares: GridSquare[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Softened values for subtle background grid squares
      const seed = (r * 11 + c * 17) % 10;
      const initialOpacity = seed > 5 ? 0.08 : seed > 2 ? 0.05 : 0.03;
      const delay = (seed * 0.3) % 2.5;
      const duration = 2.5 + (seed % 3) * 0.8;
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

const leftCornerSquares = generateCornerSquares('left', 4, 6);
const rightCornerSquares = generateCornerSquares('right', 4, 6);

export const CtaBanner = () => {
  const bannerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const prefersReduced = useReducedMotion();

  // Mouse tracking for banner spotlight (200px white radial glow)
  const mouseX = useMotionValue(-500);
  const mouseY = useMotionValue(-500);
  const smoothX = useSpring(mouseX, { stiffness: 220, damping: 26 });
  const smoothY = useSpring(mouseY, { stiffness: 220, damping: 26 });
  const [isBannerHovered, setIsBannerHovered] = useState(false);

  // Magnetic button displacement (max 12px)
  const buttonMagnetX = useMotionValue(0);
  const buttonMagnetY = useMotionValue(0);
  const smoothButtonX = useSpring(buttonMagnetX, { stiffness: 250, damping: 20 });
  const smoothButtonY = useSpring(buttonMagnetY, { stiffness: 250, damping: 20 });
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [line1Done, setLine1Done] = useState(false);
  const [line2Done, setLine2Done] = useState(false);

  const handleBannerMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (prefersReduced || !bannerRef.current) return;
    const rect = bannerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mouseX.set(x);
    mouseY.set(y);

    // Magnetic pull for button when near
    if (buttonRef.current) {
      const btnRect = buttonRef.current.getBoundingClientRect();
      const btnCenterX = btnRect.left + btnRect.width / 2;
      const btnCenterY = btnRect.top + btnRect.height / 2;
      const dist = Math.hypot(e.clientX - btnCenterX, e.clientY - btnCenterY);

      if (dist < 100) {
        const pull = (1 - dist / 100) * 12;
        const angle = Math.atan2(e.clientY - btnCenterY, e.clientX - btnCenterX);
        buttonMagnetX.set(Math.cos(angle) * pull);
        buttonMagnetY.set(Math.sin(angle) * pull);
      } else {
        buttonMagnetX.set(0);
        buttonMagnetY.set(0);
      }
    }
  };

  const handleBannerMouseEnter = () => {
    setIsBannerHovered(true);
  };

  const handleBannerMouseLeave = () => {
    setIsBannerHovered(false);
    buttonMagnetX.set(0);
    buttonMagnetY.set(0);
  };

  // Entrance variants
  const containerVariants: Variants = {
    hidden: {
      y: prefersReduced ? 0 : 60,
      opacity: 0,
      scale: prefersReduced ? 1 : 0.96,
    },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 1.0,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  const headingLine1 = ['Unleash', 'the', 'power', 'of', 'SpidyDashboard'];
  const headingLine2 = ['and', 'start', 'scanning'];

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
        delay: 0.2 + customIndex * 0.06,
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    }),
  };

  return (
    <section className="w-full bg-white relative py-[120px] px-6 overflow-hidden">
      <motion.div
        ref={bannerRef}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        onMouseMove={handleBannerMouseMove}
        onMouseEnter={handleBannerMouseEnter}
        onMouseLeave={handleBannerMouseLeave}
        className="relative max-w-[1200px] w-full min-h-[420px] md:h-[480px] mx-auto rounded-[24px] overflow-hidden flex flex-col items-center justify-center text-center px-6 py-12 md:px-12 select-none"
        style={{
          background:
            'linear-gradient(180deg, #D8F6FF 0%, #CDE7FF 42%, #5B9BFA 100%)',
        }}
      >
        {/* Layer 1: Radial Glows (Top White Glow & Bottom White-Aqua Glow) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 90% 60% at 50% 0%, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0) 70%), radial-gradient(ellipse 70% 50% at 50% 100%, rgba(216, 246, 255, 0.65) 0%, rgba(216, 246, 255, 0) 65%)',
          }}
        />

        {/* Layer 2: Drifting Glow Orbs (10s alternate loop) */}
        {!prefersReduced && (
          <>
            {/* Top Aqua Drift Glow */}
            <motion.div
              animate={{
                x: [-30, 30, -30],
                scale: [1, 1.08, 1],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle, rgba(255, 255, 255, 0.75) 0%, rgba(216, 246, 255, 0.4) 50%, rgba(216, 246, 255, 0) 75%)',
                filter: 'blur(30px)',
              }}
            />

            {/* Bottom Blue Drift Glow */}
            <motion.div
              animate={{
                x: [30, -30, 30],
                scale: [1.05, 1, 1.05],
              }}
              transition={{
                duration: 11,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1,
              }}
              className="absolute -bottom-28 left-1/2 -translate-x-1/2 w-[850px] h-[360px] rounded-full pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle, rgba(79, 143, 247, 0.7) 0%, rgba(107, 164, 251, 0.4) 45%, rgba(91, 155, 250, 0) 75%)',
                filter: 'blur(35px)',
              }}
            />
          </>
        )}

        {/* Layer 3: Left-Bottom Corner Pixel Grid (Faint subtle squares) */}
        <div
          className="absolute bottom-0 left-0 w-[396px] h-[264px] pointer-events-none grid grid-cols-6 grid-rows-4 z-0"
          style={{
            maskImage:
              'radial-gradient(circle at 0% 100%, rgba(0, 0, 0, 0.6) 20%, rgba(0, 0, 0, 0) 80%)',
            WebkitMaskImage:
              'radial-gradient(circle at 0% 100%, rgba(0, 0, 0, 0.6) 20%, rgba(0, 0, 0, 0) 80%)',
          }}
        >
          {leftCornerSquares.map((sq) => (
            <motion.div
              key={sq.id}
              className="w-[66px] h-[66px] border border-white/15 bg-white/[0.08]"
              animate={
                prefersReduced
                  ? { opacity: sq.initialOpacity }
                  : {
                      opacity: [sq.initialOpacity, 0.16, sq.initialOpacity],
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

        {/* Layer 4: Right-Bottom Corner Pixel Grid (Faint subtle squares) */}
        <div
          className="absolute bottom-0 right-0 w-[396px] h-[264px] pointer-events-none grid grid-cols-6 grid-rows-4 z-0"
          style={{
            maskImage:
              'radial-gradient(circle at 100% 100%, rgba(0, 0, 0, 0.6) 20%, rgba(0, 0, 0, 0) 80%)',
            WebkitMaskImage:
              'radial-gradient(circle at 100% 100%, rgba(0, 0, 0, 0.6) 20%, rgba(0, 0, 0, 0) 80%)',
          }}
        >
          {rightCornerSquares.map((sq) => (
            <motion.div
              key={sq.id}
              className="w-[66px] h-[66px] border border-white/15 bg-white/[0.08]"
              animate={
                prefersReduced
                  ? { opacity: sq.initialOpacity }
                  : {
                      opacity: [sq.initialOpacity, 0.16, sq.initialOpacity],
                    }
              }
              transition={{
                duration: sq.duration,
                repeat: Infinity,
                delay: sq.delay + 0.4,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* Layer 5: Cursor Spotlight (200px white radial glow following cursor at 40% opacity) */}
        {!prefersReduced && (
          <motion.div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background: `radial-gradient(circle 200px at ${smoothX}px ${smoothY}px, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 80%)`,
            }}
            animate={{
              opacity: isBannerHovered ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
          />
        )}

        {/* Content Wrapper (Centered, z-10, overflow-visible) */}
        <div className="relative z-10 max-w-[760px] flex flex-col items-center justify-center overflow-visible">
          {/* H2: 2 lines, line-height 1.18, 0.1em bottom padding, no clipping on "SpidyDashboard" (y), "power" (p), "scanning" (g) */}
          <h2 className="font-headline font-semibold text-[36px] sm:text-[48px] lg:text-[64px] leading-[1.18] pb-[0.1em] tracking-[-0.04em] text-[#0B0B14] overflow-visible">
            {/* Line 1 */}
            <span
              className={`block pt-[0.12em] px-[0.08em] pb-[0.32em] -mt-[0.12em] -mx-[0.08em] -mb-[0.32em] ${
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
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.25 }}
                  onAnimationComplete={() => {
                    if (idx === headingLine1.length - 1) setLine1Done(true);
                  }}
                  className="inline-block mr-[0.25em] last:mr-0 px-[0.06em]"
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
              {headingLine2.map((word, idx) => (
                <motion.span
                  key={word}
                  custom={headingLine1.length + idx}
                  variants={wordVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.25 }}
                  onAnimationComplete={() => {
                    if (idx === headingLine2.length - 1) setLine2Done(true);
                  }}
                  className="inline-block mr-[0.25em] last:mr-0 px-[0.06em]"
                >
                  {word}
                </motion.span>
              ))}
            </span>
          </h2>

          {/* Paragraph: 18px, line-height 1.5, pb 0.2em, max-width ~520px, margin-top 24px */}
          <motion.p
            initial={{ opacity: 0, y: prefersReduced ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{
              duration: 0.7,
              delay: 0.4,
              ease: [0.22, 1, 0.36, 1] as const,
            }}
            className="mt-6 text-[16px] sm:text-[18px] leading-[1.5] text-[#111111]/90 max-w-[520px] pb-[0.2em] overflow-visible"
          >
            Automate reconnaissance, uncover exposed assets and stay ahead of threats.
          </motion.p>

          {/* Button: "Start free scan" with ArrowUpRight icon */}
          <motion.div
            initial={{ opacity: 0, scale: prefersReduced ? 1 : 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 20,
              delay: 0.6,
            }}
            style={{
              x: smoothButtonX,
              y: smoothButtonY,
            }}
            className="mt-8 flex justify-center w-full sm:w-auto"
          >
            <motion.a
              ref={buttonRef}
              href="/pricing"
              onMouseEnter={() => setIsButtonHovered(true)}
              onMouseLeave={() => setIsButtonHovered(false)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              animate={
                prefersReduced
                  ? { boxShadow: '0 0 0 4px rgba(255, 255, 255, 0.7)' }
                  : {
                      boxShadow: [
                        '0 0 0 4px rgba(255, 255, 255, 0.8)',
                        '0 0 0 8px rgba(255, 255, 255, 0)',
                        '0 0 0 4px rgba(255, 255, 255, 0.8)',
                      ],
                    }
              }
              transition={{
                boxShadow: {
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
                y: { duration: 0.25 },
                scale: { duration: 0.15 },
              }}
              className="relative inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#4F8FF7] hover:bg-[#3E82ED] text-white text-[16px] font-semibold tracking-[-0.01em] shadow-lg overflow-hidden group transition-colors duration-200 w-full sm:w-auto"
            >
              {/* White shine sweep animation on hover */}
              <motion.div
                initial={{ x: '-150%', opacity: 0 }}
                animate={{
                  x: isButtonHovered && !prefersReduced ? '250%' : '-150%',
                  opacity: isButtonHovered && !prefersReduced ? 1 : 0,
                }}
                transition={{
                  duration: 0.75,
                  ease: 'easeInOut',
                }}
                className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-20 pointer-events-none"
              />

              {/* Button Text */}
              <span className="relative z-10">Start free scan</span>

              {/* Arrow Icon with translate 3px up-right on hover */}
              <motion.span
                animate={{
                  x: isButtonHovered && !prefersReduced ? 3 : 0,
                  y: isButtonHovered && !prefersReduced ? -3 : 0,
                }}
                transition={{ duration: 0.2 }}
                className="relative z-10 flex items-center"
              >
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              </motion.span>
            </motion.a>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};
