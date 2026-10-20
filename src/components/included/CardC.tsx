import { useState, useRef, type MouseEvent } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { TabularCounter } from './TabularCounter';
import { PhotoStack, type PhotoItem } from './PhotoStack';

const dashboardPhotos: PhotoItem[] = [
  {
    id: 'front',
    webpSrc: '/photos/dashboard-front.webp',
    pngSrc: '/photos/dashboard-front.png',
    alt: 'SpidyDashboard scan overview',
    loading: 'eager',
    fetchPriority: 'high',
  },
  {
    id: 'middle',
    webpSrc: '/photos/dashboard-middle.webp',
    pngSrc: '/photos/dashboard-middle.png',
    alt: 'SpidyDashboard OSINT threat intelligence view',
    loading: 'lazy',
  },
  {
    id: 'back',
    webpSrc: '/photos/dashboard-back.webp',
    pngSrc: '/photos/dashboard-back.png',
    alt: 'SpidyDashboard results view',
    loading: 'lazy',
  },
];

export const CardC = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse tilt & interactive glow
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springConfig = { stiffness: 200, damping: 20 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothY, [0, 1], [3, -3]);
  const rotateY = useTransform(smoothX, [0, 1], [-3, 3]);

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
        className="relative h-full min-h-[244px] rounded-[24px] bg-gradient-to-r from-[#E8E9FB] via-[#EFF0FC] to-[#F3F3FD] border border-black/[0.04] p-6 sm:p-8 shadow-[0_20px_60px_rgba(20,30,60,0.06)] overflow-hidden flex flex-col justify-end select-none"
      >
        {/* Soft Lavender / Blue glow from the left */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="absolute -top-10 -left-10 w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(180,185,255,0.45)_0%,transparent_70%)] blur-[35px] pointer-events-none -z-0"
        />

        {/* Dynamic cursor-following glow */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(280px circle at ${mouseX.get() * 100}% ${mouseY.get() * 100}%, rgba(180, 185, 255, 0.3), transparent 70%)`,
          }}
        />

        {/* Left Side: "50+" and "Ready-made scan profiles" */}
        <div className="relative z-20 max-w-[180px] sm:max-w-[240px]">
          <TabularCounter
            target={50}
            duration={1.6}
            suffix="+"
            className="font-headline text-[52px] sm:text-[64px] font-semibold tracking-[-0.03em] leading-none text-[#0B0B14]"
          />
          <h3 className="font-headline text-[20px] sm:text-[24px] font-medium leading-[1.2] text-[#0B0B14] tracking-[-0.02em] mt-3">
            Ready-made scan profiles
          </h3>
        </div>

        {/* Right Side: Stacked collage of 3 real dashboard photos */}
        <div className="absolute right-0 left-[38%] sm:left-[45%] top-0 bottom-0 overflow-hidden pointer-events-auto">
          <PhotoStack photos={dashboardPhotos} isCardHovered={isHovered} />
        </div>
      </motion.div>
    </div>
  );
};
