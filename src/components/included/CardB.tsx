import { useState, useRef, type MouseEvent } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Terminal } from 'lucide-react';

export const CardB = () => {
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
        className="relative h-full min-h-[220px] md:min-h-[276px] rounded-[24px] bg-[#FFFFFF] border border-black/[0.04] p-6 sm:p-8 shadow-[0_20px_60px_rgba(20,30,60,0.06)] overflow-hidden flex flex-col justify-between gap-6 select-none"
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

        {/* Top-left: Interactive Terminal Badge (40px doodle icon tile) */}
        <div className="relative z-10 pt-1">
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#0B0B14] text-white shadow-md font-mono text-[11px] max-w-full">
            <div className="w-10 h-10 rounded-lg bg-[#4F8FF7]/15 flex items-center justify-center shrink-0">
              <Terminal className="w-5 h-5 text-[#4F8FF7]" />
            </div>
            <span className="truncate">spidy --scan example.com</span>
          </div>
        </div>

        {/* Content bottom */}
        <div className="relative z-10 mt-auto pt-6">
          <h3 className="font-headline text-[22px] sm:text-[24px] font-medium leading-[1.2] text-[#0B0B14] tracking-[-0.02em]">
            Open API and CLI included
          </h3>
          <p className="mt-2 text-[15px] sm:text-[17px] leading-[26px] sm:leading-[28px] text-[#111111]/90 font-normal">
            Automate scans from terminal or query via REST API.{' '}
            <a
              href="mailto:parthxcore@gmail.com"
              className="text-[#3B82F6] hover:underline transition-all font-medium inline-block break-all"
              onClick={(e) => e.stopPropagation()}
            >
              parthxcore@gmail.com
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
