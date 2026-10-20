import { useEffect, useState, useRef, type MouseEvent } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
  useMotionValue,
} from 'framer-motion';
import { CenterCard } from './mockup/CenterCard';
import { LeftCard } from './mockup/LeftCard';
import { RightCard } from './mockup/RightCard';
import { useSyncedVideos } from '../hooks/useSyncedVideos';

export const MockupSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Responsive device tier detection
  const [deviceTier, setDeviceTier] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [leftHovered, setLeftHovered] = useState(false);
  const [rightHovered, setRightHovered] = useState(false);

  // Synced videos hook to start all 3 videos at the same moment after card entrance animation
  const { registerVideo, syncAndPlay, setIsInViewport } = useSyncedVideos({
    entranceDelayMs: 1400,
    threshold: 0.3,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setDeviceTier('mobile');
      } else if (width < 1024) {
        setDeviceTier('tablet');
      } else {
        setDeviceTier('desktop');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // IntersectionObserver on the main mockup section to activate/pause synced playback
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsInViewport(entry.isIntersecting);
          if (entry.isIntersecting) {
            syncAndPlay();
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [setIsInViewport, syncAndPlay]);

  // Mouse Parallax for subtle 3D tilt & offset
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 100, damping: 20 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Normalized from -1 to 1
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;

    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Center Parallax Transforms
  const centerX = useTransform(smoothMouseX, [-1, 1], [-8, 8]);
  const centerY = useTransform(smoothMouseY, [-1, 1], [-6, 6]);
  const centerTiltX = useTransform(smoothMouseY, [-1, 1], [2, -2]);
  const centerTiltY = useTransform(smoothMouseX, [-1, 1], [-2, 2]);

  // Sides Parallax Transforms (deeper shift ±18px)
  const sidesX = useTransform(smoothMouseX, [-1, 1], [-18, 18]);
  const sidesY = useTransform(smoothMouseY, [-1, 1], [-14, 14]);
  const sidesTiltX = useTransform(smoothMouseY, [-1, 1], [4, -4]);
  const sidesTiltY = useTransform(smoothMouseX, [-1, 1], [-4, 4]);

  // Scroll Parallax: fan slightly closes and side cards move slower than center
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const scrollLeftRotateDelta = useTransform(scrollYProgress, [0, 1], [0, 6]);
  const scrollRightRotateDelta = useTransform(scrollYProgress, [0, 1], [0, -6]);
  const scrollFanInwardDelta = useTransform(scrollYProgress, [0, 1], [0, 45]);
  const scrollCenterMove = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const scrollSidesMove = useTransform(scrollYProgress, [0, 1], [0, 30]);

  // Responsive positions ensuring fan remains centered at 1440px, 1024px, and 390px (Bug 4)
  const getLeftTargetTransform = () => {
    if (deviceTier === 'mobile') {
      return {
        x: -160,
        y: 40,
        rotateZ: -10,
        skewY: -1,
        rotateY: 8,
        scale: 0.72,
        opacity: 0.4, // 40% opacity on mobile as requested
      };
    }
    if (deviceTier === 'tablet') {
      return {
        x: -240,
        y: 50,
        rotateZ: -12,
        skewY: -1.5,
        rotateY: 10,
        scale: 0.82,
        opacity: 0.9,
      };
    }
    return {
      x: -330,
      y: 60,
      rotateZ: -15,
      skewY: -2,
      rotateY: 12,
      scale: 1,
      opacity: 1,
    };
  };

  const getRightTargetTransform = () => {
    if (deviceTier === 'mobile') {
      return {
        x: 160,
        y: 40,
        rotateZ: 10,
        rotateY: -8,
        scale: 0.72,
        opacity: 0.4, // 40% opacity on mobile as requested
      };
    }
    if (deviceTier === 'tablet') {
      return {
        x: 240,
        y: 50,
        rotateZ: 12,
        rotateY: -10,
        scale: 0.82,
        opacity: 0.9,
      };
    }
    return {
      x: 330,
      y: 60,
      rotateZ: 15,
      rotateY: -12,
      scale: 1,
      opacity: 1,
    };
  };

  const leftTarget = getLeftTargetTransform();
  const rightTarget = getRightTargetTransform();

  // Responsive playback rules:
  // Desktop: all 3 play
  // Tablet: only center plays, side cards show poster
  // Mobile: only center plays, side cards show poster at 40% opacity
  const centerAllowPlay = true;
  const sidesAllowPlay = deviceTier === 'desktop';

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full mt-2 sm:mt-4 lg:mt-6 overflow-visible pt-[140px] pb-[120px] select-none"
      style={{ minHeight: '740px' }}
    >
      {/* 3D Perspective container with 1800px perspective and generous headroom for side cards and glow */}
      <div
        className="perspective-container relative w-full max-w-[1200px] mx-auto flex items-center justify-center overflow-visible"
        style={{ perspective: '1800px' }}
      >
        {/* ================= LEFT CARD (z-1) ================= */}
        <motion.div
          style={{
            y: scrollSidesMove,
          }}
          className="absolute z-[1]"
        >
          <motion.div
            initial={{
              x: 0,
              y: 120,
              rotateZ: 0,
              skewY: 0,
              rotateY: 0,
              scale: 0.9,
              opacity: 0,
            }}
            animate={{
              x: leftTarget.x,
              y: leftTarget.y,
              rotateZ: leftTarget.rotateZ,
              skewY: leftTarget.skewY,
              rotateY: leftTarget.rotateY,
              scale: leftHovered ? leftTarget.scale * 1.03 : leftTarget.scale,
              opacity: leftTarget.opacity,
            }}
            transition={{
              delay: shouldReduceMotion ? 0 : 1.05,
              duration: 1.1,
              type: 'spring',
              stiffness: 70,
              damping: 16,
            }}
            onMouseEnter={() => setLeftHovered(true)}
            onMouseLeave={() => setLeftHovered(false)}
            className="gpu-card cursor-pointer"
            style={{
              zIndex: 1,
              transform: 'translateZ(-40px)',
              WebkitTransform: 'translateZ(-40px)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            {/* Scroll parallax fan closing + Idle float */}
            <motion.div
              style={{
                rotateZ: scrollLeftRotateDelta,
                x: scrollFanInwardDelta,
              }}
            >
              <motion.div
                animate={
                  shouldReduceMotion
                    ? {}
                    : {
                        y: [0, -11, 0],
                      }
                }
                transition={{
                  duration: 6.8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.7,
                }}
              >
                {/* Mouse Parallax Layer */}
                <motion.div
                  style={{
                    x: sidesX,
                    y: sidesY,
                    rotateX: sidesTiltX,
                    rotateY: sidesTiltY,
                  }}
                  className="transition-shadow duration-300"
                >
                  <LeftCard
                    allowPlay={sidesAllowPlay}
                    registerVideo={registerVideo}
                  />
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* ================= CENTER CARD (Straight, on top, z-3) ================= */}
        <motion.div
          style={{
            y: scrollCenterMove,
          }}
          className="relative z-[3]"
        >
          <motion.div
            initial={{
              y: 200,
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            transition={{
              delay: shouldReduceMotion ? 0 : 0.9,
              duration: 1.0,
              ease: [0.22, 1, 0.36, 1] as const,
            }}
            className="gpu-card"
            style={{
              zIndex: 3,
              transform: 'translateZ(40px)',
              WebkitTransform: 'translateZ(40px)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            {/* Idle Float Layer (offset phase from sides) */}
            <motion.div
              animate={
                shouldReduceMotion
                  ? {}
                  : {
                      y: [0, -10, 0],
                    }
              }
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {/* Mouse Parallax Layer */}
              <motion.div
                style={{
                  x: centerX,
                  y: centerY,
                  rotateX: centerTiltX,
                  rotateY: centerTiltY,
                }}
              >
                <CenterCard
                  allowPlay={centerAllowPlay}
                  registerVideo={registerVideo}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* ================= RIGHT CARD (Mirror of Left, z-1) ================= */}
        <motion.div
          style={{
            y: scrollSidesMove,
          }}
          className="absolute z-[1]"
        >
          <motion.div
            initial={{
              x: 0,
              y: 120,
              rotateZ: 0,
              rotateY: 0,
              scale: 0.9,
              opacity: 0,
            }}
            animate={{
              x: rightTarget.x,
              y: rightTarget.y,
              rotateZ: rightTarget.rotateZ,
              rotateY: rightTarget.rotateY,
              scale: rightHovered ? rightTarget.scale * 1.03 : rightTarget.scale,
              opacity: rightTarget.opacity,
            }}
            transition={{
              delay: shouldReduceMotion ? 0 : 1.2,
              duration: 1.1,
              type: 'spring',
              stiffness: 70,
              damping: 16,
            }}
            onMouseEnter={() => setRightHovered(true)}
            onMouseLeave={() => setRightHovered(false)}
            className="gpu-card cursor-pointer"
            style={{
              zIndex: 1,
              transform: 'translateZ(-40px)',
              WebkitTransform: 'translateZ(-40px)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            {/* Scroll parallax fan closing + Idle float */}
            <motion.div
              style={{
                rotateZ: scrollRightRotateDelta,
                x: useTransform(scrollFanInwardDelta, (v) => -v),
              }}
            >
              <motion.div
                animate={
                  shouldReduceMotion
                    ? {}
                    : {
                        y: [0, -9, 0],
                      }
                }
                transition={{
                  duration: 6.4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 1.4,
                }}
              >
                {/* Mouse Parallax Layer */}
                <motion.div
                  style={{
                    x: sidesX,
                    y: sidesY,
                    rotateX: sidesTiltX,
                    rotateY: sidesTiltY,
                  }}
                  className="transition-shadow duration-300"
                >
                  <RightCard
                    allowPlay={sidesAllowPlay}
                    registerVideo={registerVideo}
                  />
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Soft bottom fade: smooth gradient over the bottom 220px of the fan */}
      <div
        className="absolute bottom-0 inset-x-0 h-[220px] pointer-events-none z-[4]"
        style={{
          background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.85) 55%, #ffffff 100%)',
        }}
      />
    </div>
  );
};
