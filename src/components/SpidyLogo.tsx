import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export interface SpidyLogoProps {
  /** Icon height and width in px (default 28) */
  size?: number;
  /** Web stroke color (default "currentColor") */
  color?: string;
  /** Whether to render the wordmark text "SpidyDashboard" (default false) */
  withWordmark?: boolean;
  /** Optional wordmark text size override in px */
  wordmarkSize?: number;
  /** Custom CSS classes */
  className?: string;
  /** Enable draw-on animation on mount (default true) */
  animateEntrance?: boolean;
  /** Enable hover interactions (rotate 45deg, blue shift, ring ripple) (default true) */
  interactive?: boolean;
  /** Optional spider drop on thread on hover (default false) */
  showSpiderDrop?: boolean;
}

// 8 radial spokes from center (50, 50) to the 8 outer tips at 22.5° + k * 45°
const spokePaths = [
  'M 50.00 50.00 L 94.00 68.23',
  'M 50.00 50.00 L 68.23 94.00',
  'M 50.00 50.00 L 31.77 94.00',
  'M 50.00 50.00 L 6.00 68.23',
  'M 50.00 50.00 L 6.00 31.77',
  'M 50.00 50.00 L 31.77 6.00',
  'M 50.00 50.00 L 68.23 6.00',
  'M 50.00 50.00 L 94.00 31.77',
];

// 5 concentric rings with concave inward-bowed circular arcs (curving towards center)
const ringPaths = [
  {
    id: 'ring0',
    d: 'M 57.85 53.25 A 3.42 3.42 0 0,0 53.25 57.85 A 3.42 3.42 0 0,0 46.75 57.85 A 3.42 3.42 0 0,0 42.15 53.25 A 3.42 3.42 0 0,0 42.15 46.75 A 3.42 3.42 0 0,0 46.75 42.15 A 3.42 3.42 0 0,0 53.25 42.15 A 3.42 3.42 0 0,0 57.85 46.75 A 3.42 3.42 0 0,0 57.85 53.25 Z',
  },
  {
    id: 'ring1',
    d: 'M 64.05 55.82 A 6.38 6.38 0 0,0 55.82 64.05 A 6.38 6.38 0 0,0 44.18 64.05 A 6.38 6.38 0 0,0 35.95 55.82 A 6.38 6.38 0 0,0 35.95 44.18 A 6.38 6.38 0 0,0 44.18 35.95 A 6.38 6.38 0 0,0 55.82 35.95 A 6.38 6.38 0 0,0 64.05 44.18 A 6.38 6.38 0 0,0 64.05 55.82 Z',
  },
  {
    id: 'ring2',
    d: 'M 71.42 58.87 A 9.81 9.81 0 0,0 58.87 71.42 A 9.81 9.81 0 0,0 41.13 71.42 A 9.81 9.81 0 0,0 28.58 58.87 A 9.81 9.81 0 0,0 28.58 41.13 A 9.81 9.81 0 0,0 41.13 28.58 A 9.81 9.81 0 0,0 58.87 28.58 A 9.81 9.81 0 0,0 71.42 41.13 A 9.81 9.81 0 0,0 71.42 58.87 Z',
  },
  {
    id: 'ring3',
    d: 'M 81.99 63.25 A 14.24 14.24 0 0,0 63.25 81.99 A 14.24 14.24 0 0,0 36.75 81.99 A 14.24 14.24 0 0,0 18.01 63.25 A 14.24 14.24 0 0,0 18.01 36.75 A 14.24 14.24 0 0,0 36.75 18.01 A 14.24 14.24 0 0,0 63.25 18.01 A 14.24 14.24 0 0,0 81.99 36.75 A 14.24 14.24 0 0,0 81.99 63.25 Z',
  },
  {
    id: 'ring4',
    d: 'M 94.00 68.23 A 19.73 19.73 0 0,0 68.23 94.00 A 19.73 19.73 0 0,0 31.77 94.00 A 19.73 19.73 0 0,0 6.00 68.23 A 19.73 19.73 0 0,0 6.00 31.77 A 19.73 19.73 0 0,0 31.77 6.00 A 19.73 19.73 0 0,0 68.23 6.00 A 19.73 19.73 0 0,0 94.00 31.77 A 19.73 19.73 0 0,0 94.00 68.23 Z',
  },
];

const customEasing = [0.22, 1, 0.36, 1] as const;

export const SpidyLogo = ({
  size = 28,
  color = 'currentColor',
  withWordmark = false,
  wordmarkSize,
  className = '',
  animateEntrance = true,
  interactive = true,
  showSpiderDrop = false,
}: SpidyLogoProps) => {
  const prefersReduced = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);

  // Proportional wordmark sizing matching specification:
  // size 28 -> ~20px | size 14 -> ~12px | size 58 -> ~54px
  const calculatedWordmarkSize =
    wordmarkSize ??
    (size >= 50
      ? Math.round(size * 0.93)
      : size <= 16
      ? Math.max(10, Math.round(size * 0.85))
      : Math.max(14, Math.round(size * 0.72)));

  return (
    <div
      role="img"
      aria-label="SpidyDashboard"
      onMouseEnter={() => interactive && setIsHovered(true)}
      onMouseLeave={() => interactive && setIsHovered(false)}
      className={`inline-flex items-center gap-[10px] select-none overflow-visible leading-[1.2] ${className}`}
      style={{ color }}
    >
      {/* Icon Wrapper: handles subtle breathing idle and hover spring rotation with overflow visible */}
      <motion.div
        style={{
          width: size,
          height: size,
          transformOrigin: '50% 50%',
        }}
        className="relative shrink-0 flex items-center justify-center cursor-pointer overflow-visible"
        animate={
          prefersReduced
            ? {}
            : isHovered && interactive
            ? {
                rotate: 45,
                scale: 1.04,
              }
            : {
                rotate: [0, 4, 0, -4, 0],
                scale: [1, 1.03, 1],
              }
        }
        transition={
          isHovered && interactive
            ? {
                type: 'spring',
                stiffness: 260,
                damping: 18,
              }
            : {
                duration: 4.0,
                repeat: Infinity,
                ease: 'easeInOut',
              }
        }
      >
        <svg
          width={size}
          height={size}
          viewBox="-2 -2 104 104"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          overflow="visible"
          className="w-full h-full overflow-visible transition-colors duration-300"
          style={{
            stroke: isHovered && interactive ? '#4F8FF7' : 'currentColor',
          }}
        >
          {/* Radial Spokes: 8 straight lines from center to outer points */}
          <g className="spidy-spokes" strokeWidth="2.5" strokeLinecap="round">
            {spokePaths.map((d, i) => (
              <motion.path
                key={i}
                d={d}
                initial={
                  animateEntrance && !prefersReduced
                    ? { pathLength: 0, opacity: 0 }
                    : { pathLength: 1, opacity: 1 }
                }
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{
                  duration: 0.5,
                  delay: animateEntrance && !prefersReduced ? i * 0.05 : 0,
                  ease: customEasing,
                }}
              />
            ))}
          </g>

          {/* Concentric Rings: 5 concave inward-bowed rings from center outward */}
          <g className="spidy-rings" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {ringPaths.map((ring, ringIdx) => (
              <motion.path
                key={ring.id}
                id={ring.id}
                d={ring.d}
                initial={
                  animateEntrance && !prefersReduced
                    ? { pathLength: 0, opacity: 0 }
                    : { pathLength: 1, opacity: 1 }
                }
                animate={
                  isHovered && interactive && !prefersReduced
                    ? {
                        scale: [1, 1.06, 1],
                        pathLength: 1,
                        opacity: 1,
                      }
                    : {
                        pathLength: 1,
                        opacity: 1,
                      }
                }
                transition={
                  isHovered && interactive
                    ? {
                        duration: 0.45,
                        delay: ringIdx * 0.06,
                        ease: customEasing,
                      }
                    : {
                        duration: 0.65,
                        delay: animateEntrance && !prefersReduced ? 0.4 + ringIdx * 0.08 : 0,
                        ease: customEasing,
                      }
                }
                style={{ transformOrigin: '50px 50px' }}
              />
            ))}
          </g>

          {/* Optional: tiny spider drops on a thread on hover (0.6s, then retracts) */}
          {showSpiderDrop && isHovered && !prefersReduced && (
            <motion.g
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: [0, 26, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 1.2, times: [0, 0.5, 1], ease: customEasing }}
            >
              <line x1="50" y1="50" x2="50" y2="72" stroke="#4F8FF7" strokeWidth="1.2" />
              <circle cx="50" cy="73" r="2.4" fill="#4F8FF7" />
            </motion.g>
          )}
        </svg>
      </motion.div>

      {/* Wordmark: SpidyDashboard (Plus Jakarta Sans, weight 700, letter-spacing -0.04em, line-height 1.2 with 0.15em bottom padding so descender "y" is never clipped) */}
      {withWordmark && (
        <motion.span
          initial={
            animateEntrance && !prefersReduced
              ? { opacity: 0, x: -12 }
              : { opacity: 1, x: 0 }
          }
          animate={{ opacity: 1, x: 0 }}
          transition={{
            delay: animateEntrance && !prefersReduced ? 1.0 : 0,
            duration: 0.6,
            ease: customEasing,
          }}
          className="font-headline font-bold tracking-[-0.04em] text-[#0B0B14] leading-[1.2] pb-[0.15em] overflow-visible whitespace-nowrap inline-block"
          style={{ fontSize: `${calculatedWordmarkSize}px` }}
        >
          SpidyDashboard
        </motion.span>
      )}
    </div>
  );
};

// Backwards-compatible alias for legacy references
export const CloverLogo = (props: { className?: string; showText?: boolean }) => (
  <SpidyLogo
    size={28}
    withWordmark={props.showText !== false}
    className={props.className}
  />
);

export default SpidyLogo;
