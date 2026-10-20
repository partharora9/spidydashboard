import { useState, useRef, useEffect, type MouseEvent } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  animate,
  type Variants,
} from 'framer-motion';
import { Check, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import type { Plan } from '../../data/plans';
import { PRICE, PAYMENT_TYPE, STUDENT_PRICE_BADGE } from '../../config/pricing';

interface PlanCardProps {
  plan: Plan;
  onCheckout: () => void;
}

export const PlanCard = ({ plan, onCheckout }: PlanCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [animatedPrice, setAnimatedPrice] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // 3D Tilt with spring physics
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 180, damping: 22 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothMouseY, [-0.5, 0.5], [4, -4]);
  const rotateY = useTransform(smoothMouseX, [-0.5, 0.5], [-4, 4]);

  // Cursor light position
  const lightX = useTransform(smoothMouseX, [-0.5, 0.5], ['0%', '100%']);
  const lightY = useTransform(smoothMouseY, [-0.5, 0.5], ['0%', '100%']);

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

  // Price Count-up animation from 0 to PRICE over 1.2s
  useEffect(() => {
    if (shouldReduceMotion) {
      setAnimatedPrice(PRICE);
      return;
    }

    if (isInView) {
      const controls = animate(0, PRICE, {
        duration: 1.2,
        ease: [0.22, 1, 0.36, 1],
        onUpdate: (latest) => {
          setAnimatedPrice(Math.round(latest));
        },
      });
      return () => controls.stop();
    }
  }, [isInView, shouldReduceMotion]);

  const cardEntranceVariants: Variants = {
    hidden: {
      y: 60,
      opacity: 0,
      scale: 0.96,
    },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  return (
    <div style={{ perspective: '1000px' }} className="w-full max-w-[500px] mx-auto">
      <motion.div
        ref={cardRef}
        variants={cardEntranceVariants}
        initial={shouldReduceMotion ? 'visible' : 'hidden'}
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        onViewportEnter={() => setIsInView(true)}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX: shouldReduceMotion ? 0 : rotateX,
          rotateY: shouldReduceMotion ? 0 : rotateY,
          transformStyle: 'preserve-3d',
        }}
        whileHover={
          shouldReduceMotion
            ? {}
            : {
                y: -6,
                boxShadow: '0 32px 90px rgba(79, 143, 247, 0.16)',
              }
        }
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as const }}
        className="relative w-full bg-white rounded-[28px] border-2 border-[#4F8FF7]/40 shadow-[0_24px_70px_rgba(20,30,60,0.09)] p-7 sm:p-9 flex flex-col justify-between overflow-hidden select-none"
      >
        {/* Soft background blue gradient glow in corner */}
        <motion.div
          animate={
            shouldReduceMotion
              ? {}
              : {
                  x: [0, 16, -10, 0],
                  y: [0, -16, 12, 0],
                }
          }
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: 'easeInOut',
          }}
          className="absolute -right-16 -bottom-16 w-[340px] h-[340px] rounded-full bg-gradient-to-tl from-[#A9C8FD]/50 via-[#CFE2FF]/40 to-transparent blur-3xl pointer-events-none z-0"
        />

        {/* Soft interactive cursor radial light */}
        <motion.div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-0"
          style={{
            background: isHovered
              ? `radial-gradient(circle at ${lightX} ${lightY}, rgba(79, 143, 247, 0.09) 0%, transparent 65%)`
              : 'none',
          }}
        />

        {/* Card Content Wrapper */}
        <div className="relative z-10 flex flex-col">
          {/* Top Row: Plan Name + "Student price" badge */}
          <div className="flex items-center justify-between gap-2">
            <span className="font-sans text-[19px] sm:text-[20px] font-semibold text-[#0B0B14]">
              {plan.name}
            </span>

            <motion.span
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="relative overflow-hidden text-[12.5px] font-semibold text-[#2563EB] bg-[#EFF6FF] px-3.5 py-1 rounded-full border border-[#3B82F6]/30 shadow-xs inline-flex items-center gap-1.5 shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>{STUDENT_PRICE_BADGE}</span>
              <motion.span
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{ delay: 0.6, duration: 0.9, ease: 'easeInOut' }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent skew-x-12 pointer-events-none"
              />
            </motion.span>
          </div>

          {/* Price Line: Rs 999, One-time payment */}
          <div className="mt-5 flex items-baseline gap-2.5">
            <span className="font-sans text-[36px] sm:text-[40px] font-bold text-[#0B0B14] tracking-tight tabular-nums">
              ₹{animatedPrice}
            </span>
            <span className="font-sans text-[15px] sm:text-[16px] font-medium text-gray-500">
              {PAYMENT_TYPE}
            </span>
          </div>

          {/* Descriptor */}
          <div className="mt-2.5">
            <p className="font-sans text-[14px] text-gray-600 leading-relaxed">
              {plan.descriptor}
            </p>
          </div>

          {/* Divider */}
          <div className="mt-6 w-full h-[1px] bg-black/[0.08]" />

          {/* What the Buyer Gets Feature List */}
          <div className="mt-6">
            <span className="text-[11.5px] font-bold uppercase tracking-wider text-gray-400 block mb-3">
              What You Get
            </span>
            <ul className="space-y-3.5" role="list">
              {plan.features.map((feature, fIndex) => (
                <motion.li
                  key={feature}
                  initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                  whileInView={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: 0.2 + fIndex * 0.07,
                    duration: 0.4,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="flex items-start gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200">
                    <Check className="w-3.5 h-3.5 stroke-[2.4]" aria-hidden="true" />
                  </div>
                  <span className="font-sans text-[14.5px] sm:text-[15px] text-[#1F2937] leading-snug">
                    {feature}
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Buy Now CTA Button */}
        <div className="relative z-10 mt-8 pt-2">
          <motion.button
            type="button"
            onClick={onCheckout}
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="relative overflow-hidden w-full h-[54px] px-6 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#3B82F6] via-[#2563EB] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white font-sans text-[15px] sm:text-[16px] font-semibold tracking-[-0.01em] shadow-[0_8px_25px_rgba(37,99,235,0.35)] transition-all focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 cursor-pointer group"
          >
            {/* Button diagonal shine sweep on hover */}
            <motion.span
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12 pointer-events-none"
              initial={{ x: '-100%' }}
              whileHover={{ x: '200%' }}
              transition={{ duration: 0.75, ease: 'easeInOut' }}
            />
            <span className="relative z-10 font-bold">Buy Now — ₹{PRICE}</span>
            <ArrowRight className="w-4 h-4 shrink-0 stroke-[2.4] group-hover:translate-x-1 transition-transform relative z-10" />
          </motion.button>

          {/* Trust Footnote */}
          <div className="mt-3.5 flex items-center justify-center gap-2 text-[12px] text-gray-500 text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Direct manual UPI verification &bull; Secure download delivery</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
