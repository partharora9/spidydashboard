import { useState, useRef, type MouseEvent } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { PreviewVideo } from './PreviewVideo';
import { PreviewModal } from './PreviewModal';

interface HomepageCardProps {
  label: string;
  videoSrc: string;
  poster: string;
  delayIndex?: number;
  idleDelay?: number;
  staggerDelay?: number;
}

export const HomepageCard = ({
  label,
  videoSrc,
  poster,
  delayIndex = 0,
  idleDelay = 0,
  staggerDelay = 0,
}: HomepageCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Mouse Parallax & 3D Tilt (Max 5deg)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 180, damping: 20 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothMouseY, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(smoothMouseX, [-0.5, 0.5], [-5, 5]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <>
      <div className="flex flex-col items-center w-full max-w-[360px] mx-auto select-none">
        {/* Perspective wrapper for 3D card tilt */}
        <div style={{ perspective: '1200px' }} className="w-full flex justify-center">
          {/* Card Entrance Motion */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { y: 80, opacity: 0, scale: 0.94, rotateX: 8 }}
            whileInView={shouldReduceMotion ? { opacity: 1 } : { y: 0, opacity: 1, scale: 1, rotateX: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{
              delay: delayIndex * 0.15,
              duration: 1.0,
              ease: [0.22, 1, 0.36, 1] as const,
            }}
            className="w-full flex justify-center"
          >
            {/* Idle gentle float ON CARD ONLY (y: 0 to -6px to 0, 6s loop, offset phases) */}
            <motion.div
              animate={shouldReduceMotion ? {} : { y: [0, -6, 0] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: idleDelay,
              }}
              className="w-full flex justify-center"
            >
              {/* Interactive Video Card: 360px wide, aspect-ratio 3/4 (~480px tall), radius 24px, border, shadow */}
              <motion.div
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={handleMouseLeave}
                onClick={() => setIsModalOpen(true)}
                style={{
                  rotateX: shouldReduceMotion ? 0 : rotateX,
                  rotateY: shouldReduceMotion ? 0 : rotateY,
                  transformStyle: 'preserve-3d',
                }}
                whileHover={
                  shouldReduceMotion
                    ? {}
                    : {
                        y: -10,
                        scale: 1.02,
                        boxShadow: '0 32px 80px rgba(20, 30, 60, 0.16)',
                      }
                }
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as const }}
                className="relative w-full max-w-[360px] aspect-[3/4] bg-white rounded-[24px] border border-black/[0.04] shadow-[0_20px_60px_rgba(20,30,60,0.08)] overflow-hidden cursor-pointer gpu-card group select-none"
              >
                {/* Real Preview Video inside card */}
                <PreviewVideo
                  src={videoSrc}
                  poster={poster}
                  label={label}
                  staggerDelay={staggerDelay}
                  isHovered={isHovered}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Centered Label Below Card: Exactly aligned on identical grid row baseline */}
        {/* Has identical margin-top 24px, font-size 24px, weight 600, line-height 1.3 */}
        {/* Isolated from card float and parallax so it never shifts out of alignment */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          onClick={() => setIsModalOpen(true)}
          className="mt-6 flex items-center justify-center gap-1.5 cursor-pointer group/label h-8 overflow-visible"
        >
          <span
            className={`font-headline text-[24px] font-semibold leading-[1.3] tracking-[-0.02em] transition-colors duration-250 select-none pb-0.5 ${
              isHovered ? 'text-[#4F8FF7]' : 'text-[#0B0B14]'
            }`}
          >
            {label}
          </span>

          {/* Small arrow icon sliding in beside label on hover */}
          <motion.span
            animate={
              isHovered
                ? { opacity: 1, x: 0 }
                : { opacity: 0, x: -6 }
            }
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] as const }}
            className="text-[#4F8FF7] inline-flex items-center"
          >
            <ArrowRight className="w-5 h-5 stroke-[2.4]" />
          </motion.span>
        </div>
      </div>

      {/* Fullscreen Video Modal */}
      <PreviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={label}
        videoSrc={videoSrc}
        poster={poster}
      />
    </>
  );
};
