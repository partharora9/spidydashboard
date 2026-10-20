import { useRef, useState, useEffect, type MouseEvent } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useInView,
  useReducedMotion,
  type Variants,
} from 'framer-motion';
import type { StatItem } from '../../data/stats';

interface StatCardProps {
  stat: StatItem;
  index: number;
}

export const StatCard = ({ stat, index }: StatCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, amount: 0.25 });
  const prefersReduced = useReducedMotion();

  // Mouse tracking for dynamic aqua spotlight glow
  const mouseX = useMotionValue(100);
  const mouseY = useMotionValue(100);
  const smoothX = useSpring(mouseX, { stiffness: 220, damping: 25 });
  const smoothY = useSpring(mouseY, { stiffness: 220, damping: 25 });
  const [isHovered, setIsHovered] = useState(false);

  // Count-up animation state
  const [displayCount, setDisplayCount] = useState(() => (prefersReduced ? stat.value : 0));

  useEffect(() => {
    if (prefersReduced) {
      return;
    }

    if (!isInView) return;

    let startTime: number | null = null;
    const duration = 1400; // 1.4s

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(easeProgress * stat.value);
      setDisplayCount(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDisplayCount(stat.value);
      }
    };

    const timer = setTimeout(() => {
      requestAnimationFrame(step);
    }, index * 120 + 150);

    return () => clearTimeout(timer);
  }, [isInView, stat.value, index, prefersReduced]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (prefersReduced || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const cardVariants: Variants = {
    hidden: {
      y: prefersReduced ? 0 : 50,
      opacity: 0,
      scale: prefersReduced ? 1 : 0.96,
    },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        delay: index * 0.12,
        duration: 0.9,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  // Render SVG with pathLength animation
  const renderAnimatedIcon = () => {
    if (stat.iconName === 'Layers') {
      return (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#444444"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0"
        >
          <motion.path
            d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"
            initial={{ pathLength: prefersReduced ? 1 : 0 }}
            animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.15 + index * 0.1 }}
          />
          <motion.path
            d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"
            initial={{ pathLength: prefersReduced ? 1 : 0 }}
            animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.3 + index * 0.1 }}
          />
          <motion.path
            d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"
            initial={{ pathLength: prefersReduced ? 1 : 0 }}
            animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.45 + index * 0.1 }}
          />
        </svg>
      );
    }

    if (stat.iconName === 'FolderGit2') {
      return (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#444444"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0"
        >
          <motion.path
            d="M9 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v5"
            initial={{ pathLength: prefersReduced ? 1 : 0 }}
            animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.15 + index * 0.1 }}
          />
          <motion.circle
            cx="13"
            cy="13"
            r="2"
            initial={{ pathLength: prefersReduced ? 1 : 0 }}
            animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1], delay: 0.35 + index * 0.1 }}
          />
          <motion.path
            d="M18 19c-2.8 0-5-2.2-5-5v8"
            initial={{ pathLength: prefersReduced ? 1 : 0 }}
            animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.45 + index * 0.1 }}
          />
          <motion.circle
            cx="18"
            cy="19"
            r="2"
            initial={{ pathLength: prefersReduced ? 1 : 0 }}
            animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1], delay: 0.55 + index * 0.1 }}
          />
        </svg>
      );
    }

    // Default: Wrench
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#444444"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0"
      >
        <motion.path
          d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
          initial={{ pathLength: prefersReduced ? 1 : 0 }}
          animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
          transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1], delay: 0.2 + index * 0.1 }}
        />
      </svg>
    );
  };

  return (
    <motion.div
      ref={cardRef}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      whileHover={
        prefersReduced
          ? undefined
          : {
              y: -6,
              transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
            }
      }
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative flex-1 w-full max-w-[380px] h-[160px] sm:h-[200px] lg:h-[232px] rounded-[20px] overflow-hidden flex flex-col items-center justify-center select-none cursor-default will-change-transform"
      style={{
        backgroundColor: '#F2F4FD',
      }}
      aria-label={`${stat.value} ${stat.label}`}
    >
      {/* Base Layer: Soft aqua glow at bottom-left (#E6FAF7) and faint white-lavender glow at right */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 10% 90%, rgba(230, 250, 247, 0.95) 0%, rgba(230, 250, 247, 0) 70%), radial-gradient(ellipse 60% 50% at 90% 20%, rgba(255, 255, 255, 0.8) 0%, rgba(242, 244, 253, 0) 70%)',
        }}
      />

      {/* Subtle Noise / Wave texture at 4% opacity */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, #000 1px, transparent 1px)`,
          backgroundSize: '16px 16px',
        }}
      />

      {/* Interactive Aqua Glow following cursor */}
      {!prefersReduced && (
        <motion.div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 180px at ${smoothX}px ${smoothY}px, rgba(190, 245, 240, 0.75) 0%, rgba(242, 244, 253, 0) 75%)`,
            opacity: isHovered ? 1 : 0.3,
          }}
        />
      )}

      {/* Content Container (Centered vertically and horizontally) */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
        {/* Top Row: 20px outlined icon (1.5px stroke, #444) + label (18px, Inter, #333) */}
        <div className="flex items-center justify-center gap-2.5">
          {renderAnimatedIcon()}
          <span className="font-sans text-[15px] sm:text-[17px] lg:text-[18px] font-normal text-[#333333] tracking-[-0.01em]">
            {stat.label}
          </span>
        </div>

        {/* Big Number: 72px on desktop (56px tablet), weight 500, tabular numbers, #0B0B14 */}
        <div className="mt-2 sm:mt-2.5">
          <span
            aria-hidden="true"
            className="font-sans font-medium text-[44px] sm:text-[56px] lg:text-[72px] leading-[1.05] tracking-[-0.03em] text-[#0B0B14] tabular-nums"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {displayCount}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
