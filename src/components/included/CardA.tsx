import { useState, useRef, type MouseEvent } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { TabularCounter } from './TabularCounter';

export const CardA = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse tilt & interactive glow
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springConfig = { stiffness: 200, damping: 20 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothY, [0, 1], [4, -4]);
  const rotateY = useTransform(smoothX, [0, 1], [-4, 4]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  return (
    <div style={{ perspective: '1000px' }} className="h-full">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        whileHover={{
          y: -6,
          boxShadow: '0 28px 70px rgba(20, 30, 60, 0.12)',
        }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
        className="relative h-full min-h-[276px] rounded-[24px] bg-[#FFFFFF] border border-black/[0.04] p-6 sm:p-8 shadow-[0_20px_60px_rgba(20,30,60,0.06)] overflow-hidden flex flex-col justify-between select-none"
      >
        {/* Soft blue static radial glow at the top center */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="absolute -top-12 left-1/2 -translate-x-1/2 w-[340px] h-[220px] bg-[radial-gradient(ellipse_at_top,rgba(147,187,255,0.42)_0%,rgba(244,248,255,0.2)_55%,transparent_75%)] blur-[28px] pointer-events-none -z-0"
        />

        {/* Dynamic cursor-following glow */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(280px circle at ${mouseX.get() * 100}% ${mouseY.get() * 100}%, rgba(147, 187, 255, 0.28), transparent 70%)`,
          }}
        />

        {/* Top-left: Giant number "200+" */}
        <div className="relative z-10">
          <TabularCounter
            target={200}
            duration={1.6}
            suffix="+"
            className="font-headline text-[52px] sm:text-[64px] font-normal tracking-[-0.03em] leading-none text-[#0B0B14]"
          />
        </div>

        {/* Content bottom */}
        <div className="relative z-10 mt-auto pt-6">
          <h3 className="font-headline text-[24px] font-medium leading-[1.2] text-[#0B0B14] tracking-[-0.02em]">
            200+ Modules &amp; Data sources
          </h3>
          <p className="mt-2 text-[17px] leading-[28px] text-[#111111]/90 font-normal">
            Automated intelligence gathering across threat feeds, leaks and public records
          </p>
        </div>
      </motion.div>
    </div>
  );
};
