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

  // Responsive device tier & width detection
  const [deviceTier, setDeviceTier] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [windowWidth, setWindowWidth] = useState(1200);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [leftHovered, setLeftHovered] = useState(false);
  const [rightHovered, setRightHovered] = useState(false);

  // Synced videos hook to start center video
  const { registerVideo, syncAndPlay, setIsInViewport } = useSyncedVideos({
    entranceDelayMs: 1200,
    threshold: 0.25,
  });

  useEffect(() => {
    setIsTouchDevice(
      typeof window !== 'undefined' &&
        window.matchMedia('(hover: none) and (pointer: coarse)').matches
    );

    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      if (width < 640) {
        setDeviceTier('mobile');
      } else if (width < 1024) {
        setDeviceTier('tablet');
      } else {
        setDeviceTier('desktop');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // IntersectionObserver on main mockup section to activate/pause synced playback
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
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [setIsInViewport, syncAndPlay]);

  // Mouse Parallax for subtle 3D tilt & offset (disabled on touch devices)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 100, damping: 20 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || isTouchDevice || deviceTier === 'mobile') return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    mouseX.set(x * 2);
    mouseY.set(y * 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Center Parallax Transforms
  const centerTiltX = useTransform(smoothMouseY, [-1, 1], [3, -3]);
  const centerTiltY = useTransform(smoothMouseX, [-1, 1], [-3, 3]);

  // Sides Parallax Transforms
  const sidesX = useTransform(smoothMouseX, [-1, 1], [-16, 16]);
  const sidesY = useTransform(smoothMouseY, [-1, 1], [-12, 12]);
  const sidesTiltX = useTransform(smoothMouseY, [-1, 1], [4, -4]);
  const sidesTiltY = useTransform(smoothMouseX, [-1, 1], [-4, 4]);

  // Scroll Parallax
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const scrollLeftRotateDelta = useTransform(scrollYProgress, [0, 1], [0, 5]);
  const scrollRightRotateDelta = useTransform(scrollYProgress, [0, 1], [0, -5]);
  const scrollFanInwardDelta = useTransform(scrollYProgress, [0, 1], [0, 40]);
  const scrollRightFanInwardDelta = useTransform(scrollFanInwardDelta, (v) => -v);
  const scrollCenterMove = useTransform(scrollYProgress, [0, 1], [0, 45]);
  const scrollSidesMove = useTransform(scrollYProgress, [0, 1], [0, 25]);

  // Fan positioning based on responsive tier
  const getLeftTargetTransform = () => {
    if (deviceTier === 'mobile') {
      return {
        x: -120,
        y: 35,
        rotateZ: -8,
        skewY: -1,
        rotateY: 6,
        scale: 0.64,
        opacity: 0.35,
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
        x: 120,
        y: 35,
        rotateZ: 8,
        rotateY: -6,
        scale: 0.64,
        opacity: 0.35,
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

  // Playback rules: Only center video plays on mobile/tablet; all 3 on desktop
  const centerAllowPlay = true;
  const sidesAllowPlay = deviceTier === 'desktop';

  // Hide side cards under 400px so center card has 100% focus and zero side clutter
  const hideSideCardsOnMobile = windowWidth < 400;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full mt-4 sm:mt-8 lg:mt-10 overflow-visible pt-6 sm:pt-[100px] lg:pt-[130px] pb-10 sm:pb-[80px] lg:pb-[110px] select-none min-h-[460px] sm:min-h-[620px] lg:min-h-[740px]"
    >
      {/* 3D Perspective Container */}
      <div
        className="perspective-container relative w-full max-w-[1200px] mx-auto flex items-center justify-center overflow-visible px-4"
        style={{ perspective: '1800px' }}
      >
        {/* ================= LEFT CARD (z-1) ================= */}
        <motion.div
          style={{
            y: scrollSidesMove,
          }}
          className="absolute z-[1] pointer-events-none sm:pointer-events-auto hidden min-[400px]:block"
        >
          <motion.div
            initial={{
              x: 0,
              y: 100,
              rotateZ: 0,
              skewY: 0,
              rotateY: 0,
              scale: 0.85,
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
              delay: shouldReduceMotion ? 0 : 0.8,
              duration: 1.0,
              type: 'spring',
              stiffness: 70,
              damping: 16,
            }}
            onMouseEnter={() => setLeftHovered(true)}
            onMouseLeave={() => setLeftHovered(false)}
            className="gpu-card"
            style={{
              zIndex: 1,
              transform: 'translateZ(-40px)',
              WebkitTransform: 'translateZ(-40px)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
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
                        y: [0, -9, 0],
                      }
                }
                transition={{
                  duration: 6.8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.7,
                }}
              >
                <motion.div
                  style={
                    isTouchDevice || deviceTier === 'mobile'
                      ? {}
                      : {
                          x: sidesX,
                          y: sidesY,
                          rotateX: sidesTiltX,
                          rotateY: sidesTiltY,
                        }
                  }
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
          className="relative z-[3] w-full max-w-[420px] flex justify-center"
        >
          <motion.div
            initial={{
              scale: 0.9,
              y: 80,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              y: 0,
              opacity: 1,
            }}
            transition={{
              delay: shouldReduceMotion ? 0 : 0.4,
              duration: 1.0,
              type: 'spring',
              stiffness: 85,
              damping: 16,
            }}
            className="gpu-card w-full flex justify-center"
            style={{
              zIndex: 3,
              transform: 'translateZ(20px)',
              WebkitTransform: 'translateZ(20px)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            {/* Gentle idle float */}
            <motion.div
              animate={
                shouldReduceMotion
                  ? {}
                  : {
                      y: [0, -7, 0],
                    }
              }
              transition={{
                duration: 5.6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="w-full flex justify-center"
            >
              {/* Subtle 3D mouse tilt layer (active on desktop hover only) */}
              <motion.div
                style={
                  isTouchDevice || deviceTier === 'mobile'
                    ? {}
                    : {
                        rotateX: centerTiltX,
                        rotateY: centerTiltY,
                      }
                }
                className="w-full flex justify-center"
              >
                <CenterCard
                  allowPlay={centerAllowPlay}
                  registerVideo={registerVideo}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* ================= RIGHT CARD (z-2) ================= */}
        <motion.div
          style={{
            y: scrollSidesMove,
          }}
          className="absolute z-[2] pointer-events-none sm:pointer-events-auto hidden min-[400px]:block"
        >
          <motion.div
            initial={{
              x: 0,
              y: 100,
              rotateZ: 0,
              rotateY: 0,
              scale: 0.85,
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
              delay: shouldReduceMotion ? 0 : 0.8,
              duration: 1.0,
              type: 'spring',
              stiffness: 70,
              damping: 16,
            }}
            onMouseEnter={() => setRightHovered(true)}
            onMouseLeave={() => setRightHovered(false)}
            className="gpu-card"
            style={{
              zIndex: 2,
              transform: 'translateZ(-40px)',
              WebkitTransform: 'translateZ(-40px)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            <motion.div
              style={{
                rotateZ: scrollRightRotateDelta,
                x: scrollRightFanInwardDelta,
              }}
            >
              <motion.div
                animate={
                  shouldReduceMotion
                    ? {}
                    : {
                        y: [0, -8, 0],
                      }
                }
                transition={{
                  duration: 6.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.4,
                }}
              >
                <motion.div
                  style={
                    isTouchDevice || deviceTier === 'mobile'
                      ? {}
                      : {
                          x: sidesX,
                          y: sidesY,
                          rotateX: sidesTiltX,
                          rotateY: sidesTiltY,
                        }
                  }
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
    </div>
  );
};
