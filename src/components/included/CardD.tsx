import { useState, useRef, type MouseEvent } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { FileText, Download, ShieldAlert, FileSpreadsheet } from 'lucide-react';

export const CardD = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isPrimaryShining, setIsPrimaryShining] = useState(false);

  // Mouse tilt
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
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  const severityLevels = [
    { color: '#EF4444', name: 'Critical' },
    { color: '#F97316', name: 'High' },
    { color: '#F59E0B', name: 'Medium' },
    { color: '#10B981', name: 'Low' },
  ];

  return (
    <div style={{ perspective: '1000px' }} className="h-full">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
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
        className="relative h-full min-h-[536px] rounded-[24px] bg-[#FFFFFF] border border-black/[0.04] p-8 shadow-[0_20px_60px_rgba(20,30,60,0.06)] overflow-hidden flex flex-col justify-between select-none"
      >
        {/* 1. Risk Severity Color Swatches */}
        <div>
          <div className="flex items-center justify-between gap-3.5">
            {severityLevels.map((swatch, idx) => (
              <motion.div
                key={idx}
                initial={{ scale: 0.6, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  delay: 0.1 + idx * 0.08,
                  type: 'spring',
                  stiffness: 240,
                  damping: 18,
                }}
                whileHover={{ y: -4, scale: 1.05 }}
                style={{ backgroundColor: swatch.color }}
                className="w-[62px] h-[62px] rounded-[10px] shadow-sm flex flex-col items-center justify-center text-white text-[10px] font-bold cursor-pointer border border-black/[0.03] transition-shadow hover:shadow-md"
              >
                <span>{swatch.name}</span>
              </motion.div>
            ))}
          </div>

          <div className="w-full h-[1px] bg-black/[0.06] mt-6" />
        </div>

        {/* 2. Format Badges + Action Buttons */}
        <div className="mt-8 flex items-center justify-between gap-4">
          {/* LEFT: Format badges */}
          <div className="flex flex-col gap-2 select-none">
            <span className="font-mono font-bold text-[28px] text-[#0B0B14]">
              .PDF
            </span>
            <span className="font-mono font-semibold text-[22px] text-[#555555]">
              .JSON
            </span>
            <span className="font-mono font-medium text-[18px] text-[#888888]">
              .CSV
            </span>
          </div>

          {/* RIGHT: Export & Download Buttons */}
          <div className="flex flex-col gap-3.5">
            <motion.button
              initial={{ x: 30, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: 0.35, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
              onMouseEnter={() => setIsPrimaryShining(true)}
              onAnimationEnd={() => setIsPrimaryShining(false)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="relative overflow-hidden w-[160px] h-[48px] rounded-full bg-gradient-to-b from-[#5B9BFA] to-[#3B7FF0] text-white text-[13px] font-medium shadow-[0_6px_16px_rgba(79,143,247,0.3)] hover:shadow-[0_10px_22px_rgba(79,143,247,0.4)] transition-shadow flex items-center justify-center gap-2 select-none"
            >
              <FileText className="w-4 h-4" />
              <span className="relative z-10">Export report</span>
              <motion.div
                initial={false}
                animate={isPrimaryShining ? { x: ['-120%', '220%'] } : { x: '-120%' }}
                transition={{ duration: 0.75, ease: 'easeInOut' }}
                className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-25deg] pointer-events-none"
              />
            </motion.button>

            <motion.button
              initial={{ x: 30, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: 0.45, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
              whileHover={{ y: -2, backgroundColor: '#ECECF0' }}
              whileTap={{ scale: 0.97 }}
              className="w-[160px] h-[48px] rounded-full bg-[#F5F5F7] text-[#0B0B14] text-[13px] font-medium transition-colors flex items-center justify-center gap-2 select-none"
            >
              <Download className="w-4 h-4 text-gray-600" />
              Download JSON
            </motion.button>
          </div>
        </div>

        {/* 3. Security Icon Row */}
        <div className="mt-8 flex justify-center items-center gap-6 w-full text-gray-500">
          <div className="flex items-center gap-2 text-[12px] font-medium">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <span>CSV Reports</span>
          </div>
          <div className="flex items-center gap-2 text-[12px] font-medium">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <span>Risk Matrix</span>
          </div>
        </div>

        {/* 4. Bottom Title */}
        <div className="mt-auto pt-8 text-center">
          <h3 className="font-headline text-[32px] font-medium leading-[1.2] text-[#0B0B14] tracking-[-0.03em] max-w-[300px] mx-auto">
            Pre-built reports and exports (CSV, JSON, PDF)
          </h3>
        </div>
      </motion.div>
    </div>
  );
};
