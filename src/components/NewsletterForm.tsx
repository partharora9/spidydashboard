import { useRef, useState, type FormEvent, type MouseEvent } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
  AnimatePresence,
} from 'framer-motion';
import { ArrowUpRight, Check } from 'lucide-react';

interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
}

export const NewsletterForm = () => {
  const [email, setEmail] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [shakeKey, setShakeKey] = useState(0);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [confetti, setConfetti] = useState<ConfettiParticle[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const prefersReduced = useReducedMotion();

  // Magnetic button displacement (max 12px)
  const buttonMagnetX = useMotionValue(0);
  const buttonMagnetY = useMotionValue(0);
  const smoothButtonX = useSpring(buttonMagnetX, { stiffness: 260, damping: 20 });
  const smoothButtonY = useSpring(buttonMagnetY, { stiffness: 260, damping: 20 });

  const handleContainerMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (prefersReduced || !buttonRef.current) return;
    const btnRect = buttonRef.current.getBoundingClientRect();
    const btnCenterX = btnRect.left + btnRect.width / 2;
    const btnCenterY = btnRect.top + btnRect.height / 2;
    const dist = Math.hypot(e.clientX - btnCenterX, e.clientY - btnCenterY);

    if (dist < 80) {
      const pull = (1 - dist / 80) * 12;
      const angle = Math.atan2(e.clientY - btnCenterY, e.clientX - btnCenterX);
      buttonMagnetX.set(Math.cos(angle) * pull);
      buttonMagnetY.set(Math.sin(angle) * pull);
    } else {
      buttonMagnetX.set(0);
      buttonMagnetY.set(0);
    }
  };

  const handleContainerMouseLeave = () => {
    buttonMagnetX.set(0);
    buttonMagnetY.set(0);
  };

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isSubscribed) return;

    if (!validateEmail(email)) {
      setErrorMsg('Please enter a valid email address');
      setShakeKey((prev) => prev + 1);
      return;
    }

    setErrorMsg('');
    setIsSubscribed(true);

    // Generate ~12 confetti dots radiating outward
    if (!prefersReduced) {
      const particles: ConfettiParticle[] = [];
      const colors = ['#4F8FF7', '#38BDF8', '#60A5FA', '#93C5FD', '#10B981'];
      for (let i = 0; i < 14; i++) {
        const angle = (i / 14) * 2 * Math.PI + (Math.random() - 0.5) * 0.4;
        const dist = 35 + Math.random() * 35;
        particles.push({
          id: i,
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist,
          size: 4 + Math.random() * 3,
          color: colors[i % colors.length],
        });
      }
      setConfetti(particles);
    }

    // Reset back after 3 seconds
    setTimeout(() => {
      setIsSubscribed(false);
      setEmail('');
      setConfetti([]);
    }, 3000);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleContainerMouseMove}
      onMouseLeave={handleContainerMouseLeave}
      className="w-full max-w-full sm:max-w-[370px] flex flex-col"
    >
      {/* Newsletter Block Title: *SUBSCRIBE TO OUR NEWSLETTER */}
      <motion.h4
        initial={{ opacity: 0, y: prefersReduced ? 0 : 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
        className="text-[18px] sm:text-[20px] font-semibold uppercase tracking-[0.02em] text-[#0B0B14]"
      >
        *SUBSCRIBE FOR SECURITY UPDATES
      </motion.h4>

      {/* Form Row with Underline */}
      <form onSubmit={handleSubmit} className="relative mt-6 sm:mt-8 w-full">
        <motion.div
          key={shakeKey}
          animate={
            shakeKey > 0
              ? { x: [-6, 6, -4, 4, 0] }
              : { x: 0 }
          }
          transition={{ duration: 0.4 }}
          className="relative flex flex-col min-[480px]:flex-row min-[480px]:items-center min-[480px]:justify-between min-[480px]:h-[60px] pb-1 gap-3 min-[480px]:gap-0"
        >
          {/* Floating Label / Placeholder */}
          <div className="relative w-full h-[52px] min-[480px]:h-full flex items-center">
            <motion.label
              htmlFor="newsletter-email"
              animate={{
                y: isFocused || email.length > 0 ? -18 : 0,
                scale: isFocused || email.length > 0 ? 0.8 : 1,
                color: isFocused
                  ? '#4F8FF7'
                  : 'rgba(51, 51, 51, 0.9)',
              }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] as const }}
              className="absolute left-4 text-[16px] min-[480px]:text-[15px] font-normal pointer-events-none origin-left select-none"
            >
              Email
            </motion.label>

            {/* Text Input */}
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              autoComplete="email"
              inputMode="email"
              disabled={isSubscribed}
              className="w-full h-full bg-transparent pl-4 pr-4 min-[480px]:pr-32 text-[16px] min-[480px]:text-[15px] text-[#0B0B14] placeholder-transparent focus:outline-none disabled:opacity-70"
            />
          </div>

          {/* Subscribe Button (Full width under 480px, absolute magnetic on desktop) */}
          <motion.div
            initial={{ opacity: 0, scale: prefersReduced ? 1 : 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 20,
              delay: 0.4,
            }}
            style={{
              x: smoothButtonX,
              y: smoothButtonY,
            }}
            className="w-full min-[480px]:w-auto min-[480px]:absolute min-[480px]:right-0 flex items-center"
          >
            <motion.button
              ref={buttonRef}
              type="submit"
              onMouseEnter={() => setIsButtonHovered(true)}
              onMouseLeave={() => setIsButtonHovered(false)}
              whileHover={{ y: isSubscribed ? 0 : -2 }}
              whileTap={{ scale: 0.97 }}
              animate={
                isSubscribed
                  ? {
                      backgroundColor: '#10B981',
                      boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.2)',
                    }
                  : prefersReduced
                  ? {
                      backgroundColor: '#4F8FF7',
                      boxShadow:
                        '0 0 0 4px rgba(79, 143, 247, 0.12), 0 4px 14px rgba(79, 143, 247, 0.25)',
                    }
                  : {
                      backgroundColor: '#4F8FF7',
                      boxShadow: [
                        '0 0 0 4px rgba(79, 143, 247, 0.16), 0 4px 14px rgba(79, 143, 247, 0.25)',
                        '0 0 0 8px rgba(79, 143, 247, 0), 0 4px 14px rgba(79, 143, 247, 0.25)',
                        '0 0 0 4px rgba(79, 143, 247, 0.16), 0 4px 14px rgba(79, 143, 247, 0.25)',
                      ],
                    }
              }
              transition={{
                boxShadow: {
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
                y: { duration: 0.2 },
                scale: { duration: 0.15 },
              }}
              className="relative w-full min-[480px]:w-auto min-h-[48px] inline-flex items-center justify-center gap-1.5 px-5 py-3.5 rounded-full text-white text-[16px] font-semibold tracking-[-0.01em] overflow-hidden select-none cursor-pointer"
            >
              {/* White shine sweep animation on hover */}
              {!isSubscribed && (
                <motion.div
                  initial={{ x: '-150%', opacity: 0 }}
                  animate={{
                    x: isButtonHovered && !prefersReduced ? '250%' : '-150%',
                    opacity: isButtonHovered && !prefersReduced ? 1 : 0,
                  }}
                  transition={{
                    duration: 0.7,
                    ease: 'easeInOut',
                  }}
                  className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-20 pointer-events-none"
                />
              )}

              {/* Button text & icon with smooth morph */}
              <AnimatePresence mode="wait">
                {isSubscribed ? (
                  <motion.span
                    key="subscribed"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="relative z-10 flex items-center gap-1.5"
                  >
                    <span>Subscribed</span>
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="subscribe"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="relative z-10 flex items-center gap-1.5"
                  >
                    <span>Subscribe</span>
                    <motion.span
                      animate={{
                        x: isButtonHovered && !prefersReduced ? 3 : 0,
                        y: isButtonHovered && !prefersReduced ? -3 : 0,
                      }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center"
                    >
                      <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                    </motion.span>
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Confetti burst on subscribe */}
              {confetti.map((c) => (
                <motion.span
                  key={c.id}
                  initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                  animate={{ x: c.x, y: c.y, scale: 0, opacity: 0 }}
                  transition={{ duration: 0.75, ease: 'easeOut' }}
                  style={{
                    backgroundColor: c.color,
                    width: c.size,
                    height: c.size,
                  }}
                  className="absolute rounded-full pointer-events-none"
                />
              ))}
            </motion.button>
          </motion.div>
        </motion.div>

        {/* 1px Solid Underline (Draws left to right, turns blue on focus) */}
        <div className="relative w-full h-[1px] bg-black/[0.12] overflow-hidden">
          <motion.div
            initial={{ scaleX: prefersReduced ? 1 : 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] as const }}
            style={{ transformOrigin: 'left' }}
            className={`w-full h-full transition-colors duration-300 ${
              isFocused ? 'bg-[#4F8FF7] shadow-[0_1px_0_#4F8FF7]' : 'bg-transparent'
            }`}
          />
        </div>

        {/* Error Feedback */}
        <AnimatePresence>
          {errorMsg && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="mt-2 text-[13px] text-red-500 font-medium pl-4"
            >
              {errorMsg}
            </motion.p>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
};
