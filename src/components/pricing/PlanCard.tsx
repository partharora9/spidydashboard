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
import { Check, Mail, Copy } from 'lucide-react';
import type { Plan } from '../../data/plans';


interface PlanCardProps {
  plan: Plan;
  index: number;
  isSelected: boolean;
  onSelect: (planId: 'standard' | 'complete') => void;
  onCheckout?: (plan: Plan) => void;
}

export const PlanCard = ({ plan, index, isSelected, onSelect }: PlanCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [directEmail, setDirectEmail] = useState('');
  const [sendingDirect, setSendingDirect] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);
  const [animatedPrice, setAnimatedPrice] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // 3D Tilt with spring physics (max 4deg)
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

  const handleDirectSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directEmail || !directEmail.includes('@')) return;
    setSendingDirect(true);
    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: directEmail, plan: plan.id }),
      });
      let data: any = {};
      try {
        data = await res.json();
      } catch {
        // Safe fallback if response is non-JSON
      }
      if (res.ok) {
        setEmailSentSuccess(true);
      } else {
        alert(data.error || 'Failed to dispatch email. Please email parthxcore@gmail.com directly.');
      }
    } catch {
      alert('Network error. Please email parthxcore@gmail.com directly.');
    } finally {
      setSendingDirect(false);
    }
  };

  // Price Count-up animation from 0 to plan.price over 1.2s
  useEffect(() => {
    if (shouldReduceMotion) {
      setAnimatedPrice(plan.price);
      return;
    }

    if (isInView) {
      const controls = animate(0, plan.price, {
        duration: 1.2,
        ease: [0.22, 1, 0.36, 1],
        onUpdate: (latest) => {
          setAnimatedPrice(Math.round(latest));
        },
      });
      return () => controls.stop();
    }
  }, [isInView, plan.price, shouldReduceMotion]);

  // Framer Motion entrance variants
  const cardEntranceVariants: Variants = {
    hidden: {
      y: 70,
      opacity: 0,
      scale: 0.96,
    },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        delay: index * 0.15,
        duration: 0.9,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  return (
    <div
      style={{ perspective: '1000px' }}
      className={`w-full max-w-[387px] ${
        plan.id === 'complete' ? 'order-1 sm:order-2' : 'order-2 sm:order-1'
      }`}
    >
      <motion.div
        ref={cardRef}
        variants={cardEntranceVariants}
        initial={shouldReduceMotion ? 'visible' : 'hidden'}
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        onViewportEnter={() => setIsInView(true)}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onClick={() => onSelect(plan.id)}
        style={{
          rotateX: shouldReduceMotion ? 0 : rotateX,
          rotateY: shouldReduceMotion ? 0 : rotateY,
          transformStyle: 'preserve-3d',
        }}
        whileHover={
          shouldReduceMotion
            ? {}
            : {
                y: -8,
                boxShadow: '0 30px 80px rgba(20, 30, 60, 0.14)',
              }
        }
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as const }}
        className={`relative w-full min-h-[580px] bg-white rounded-[24px] border transition-all duration-300 p-8 flex flex-col justify-between overflow-hidden cursor-pointer select-none ${
          isSelected
            ? 'border-[#4F8FF7] ring-2 ring-[#4F8FF7] shadow-[0_24px_70px_rgba(79,143,247,0.18)]'
            : 'border-black/[0.04] shadow-[0_20px_60px_rgba(20,30,60,0.08)]'
        }`}
      >
        {/* Standard Plan: drifting bottom-right corner light-blue gradient glow (matching screenshot 1) */}
        {plan.hasGradientGlow && (
          <motion.div
            animate={
              shouldReduceMotion
                ? {}
                : {
                    x: [0, 18, -12, 0],
                    y: [0, -18, 14, 0],
                  }
            }
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: 'mirror',
              ease: 'easeInOut',
            }}
            className="absolute -right-20 -bottom-20 w-[320px] h-[320px] rounded-full bg-gradient-to-tl from-[#A9C8FD]/70 via-[#CFE2FF]/60 to-transparent blur-3xl pointer-events-none z-0"
          />
        )}

        {/* Soft interactive cursor radial light */}
        <motion.div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-0"
          style={{
            background: isHovered
              ? `radial-gradient(circle at ${lightX} ${lightY}, rgba(79, 143, 247, 0.08) 0%, transparent 60%)`
              : 'none',
          }}
        />

        {/* Card Content Wrapper */}
        <div className="relative z-10 flex flex-col">
          {/* Top Row: Plan Name + "Most popular" badge */}
          <div className="flex items-center justify-between">
            <span className="font-sans text-[18px] font-normal text-[#555555]">
              {plan.name}
            </span>

            {plan.isPopular && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="relative overflow-hidden text-[13px] font-medium text-[#4F8FF7] bg-[#E8F0FE] px-3 py-1 rounded-full border border-[#4F8FF7]/20 select-none"
              >
                Most popular
                {/* Entrance shine sweep on badge */}
                <motion.span
                  initial={{ x: '-100%' }}
                  animate={{ x: '200%' }}
                  transition={{ delay: 0.6, duration: 0.9, ease: 'easeInOut' }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent skew-x-12 pointer-events-none"
                />
              </motion.span>
            )}
          </div>

          {/* Price Line: 32px weight 500, #0B0B14, formatted with Intl.NumberFormat */}
          <div className="mt-6 flex items-baseline">
            <span className="font-sans text-[32px] font-medium text-[#0B0B14] tracking-tight tabular-nums">
              ₹{animatedPrice}
            </span>
            <span className="ml-2 font-sans text-[16px] font-normal text-[#555555]">
              {plan.priceSuffix}
            </span>
          </div>

          {/* Reserved descriptor row: matches height of template's toggle row */}
          <div className="mt-2 h-[28px] flex items-center">
            <p className="font-sans text-[14px] text-[#555555] leading-snug">
              {plan.descriptor}
            </p>
          </div>

          {/* 1px divider */}
          <div className="mt-6 w-full h-[1px] bg-black/[0.08]" />

          {/* Feature list: item pitch 40px, text 16px #111, thin black check icon */}
          <ul className="mt-6 space-y-3.5" role="list">
            {plan.features.map((feature, fIndex) => (
              <motion.li
                key={feature}
                initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                whileInView={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: index * 0.15 + 0.3 + fIndex * 0.06,
                  duration: 0.4,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="flex items-center gap-3 min-h-[36px]"
              >
                {/* Thin black 20px check icon */}
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <Check
                    className="w-5 h-5 text-black stroke-[1.8]"
                    aria-hidden="true"
                  />
                </div>
                <span className="font-sans text-[16px] text-[#111111] leading-snug">
                  {feature}
                </span>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Bottom CTA Button: full-width blue pill linking directly to email Parth */}
        <div className="relative z-10 mt-8 pt-4">
          <motion.div
            className="relative rounded-full"
            animate={{
              boxShadow: [
                '0 0 0 4px rgba(79,143,247,0.15)',
                '0 0 0 8px rgba(79,143,247,0.0)',
                '0 0 0 4px rgba(79,143,247,0.15)',
              ],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <motion.a
              href={`mailto:parthxcore@gmail.com?subject=Inquiry to Buy SpidyDashboard ${plan.name} (${plan.formattedPrice})&body=Hi Parth,%0D%0A%0D%0AI would like to purchase SpidyDashboard ${plan.name} (${plan.formattedPrice}). Please share the payment and access details.%0D%0A%0D%0AThank you!`}
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="relative overflow-hidden w-full h-[54px] px-3.5 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#4F8FF7] to-[#3B7FF0] hover:from-[#3E82EE] hover:to-[#2B6EE0] text-white font-sans text-[12.5px] sm:text-[13px] font-semibold tracking-[-0.01em] shadow-[0_4px_18px_rgba(79,143,247,0.32)] transition-all focus:outline-none focus:ring-2 focus:ring-[#4F8FF7] focus:ring-offset-2 cursor-pointer text-center group"
            >
              {/* Button diagonal shine sweep on hover */}
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12 pointer-events-none"
                initial={{ x: '-100%' }}
                whileHover={{ x: '200%' }}
                transition={{ duration: 0.75, ease: 'easeInOut' }}
              />
              <Mail className="w-4 h-4 shrink-0 stroke-[2.2] group-hover:scale-110 transition-transform" />
              <span className="relative z-10 whitespace-nowrap">
                connect on <span className="font-mono font-bold">parthxcore@gmail.com</span> to buy
              </span>
            </motion.a>
          </motion.div>

          {/* Clean Pill Copy Badge */}
          <div className="mt-3 flex items-center justify-center">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText('parthxcore@gmail.com');
                setCopiedEmail(true);
                setTimeout(() => setCopiedEmail(false), 2000);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gray-50 hover:bg-gray-100/90 border border-gray-200/80 text-[12px] text-gray-600 hover:text-black font-medium transition-all shadow-2xs cursor-pointer group"
              title="Click to copy email address"
            >
              {copiedEmail ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                  <span className="text-emerald-700 font-semibold font-mono text-[11.5px]">Email copied to clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#4F8FF7] transition-colors" />
                  <span className="text-gray-500 group-hover:text-gray-800">
                    Copy: <strong className="font-mono text-gray-800 font-semibold">parthxcore@gmail.com</strong>
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Automated Direct Email Dispatch Form */}
          <div className="mt-3">
            {emailSentSuccess ? (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11.5px] flex items-center justify-center gap-1.5 font-medium text-center">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Link sent from parthxcore@gmail.com! Check your inbox.</span>
              </div>
            ) : showEmailForm ? (
              <form onSubmit={handleDirectSendEmail} className="flex items-center gap-1.5">
                <input
                  type="email"
                  required
                  value={directEmail}
                  onChange={(e) => setDirectEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-1.5 rounded-full border border-gray-300 text-[12px] focus:outline-none focus:ring-1 focus:ring-[#4F8FF7] bg-white text-gray-900"
                />
                <button
                  type="submit"
                  disabled={sendingDirect}
                  className="px-3.5 py-1.5 rounded-full bg-[#0B0B14] hover:bg-black text-white text-[11px] font-semibold transition-all shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {sendingDirect ? 'Sending...' : 'Send Link'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEmailForm(false)}
                  className="text-[12px] text-gray-400 hover:text-black px-1 cursor-pointer"
                  title="Cancel"
                >
                  ✕
                </button>
              </form>
            ) : (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowEmailForm(true)}
                  className="text-[11.5px] text-[#4F8FF7] hover:underline transition-colors cursor-pointer"
                >
                  Don't have an email app? Send link to my inbox &rarr;
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
