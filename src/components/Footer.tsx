import { useRef, useState, type MouseEvent } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
  type Variants,
} from 'framer-motion';
import { ArrowUp, Globe, Mail } from 'lucide-react';
import { footerColumnsData } from '../data/footerLinks';
import { FooterColumn } from './FooterColumn';
import { NewsletterForm } from './NewsletterForm';
import { SpidyLogo } from './SpidyLogo';
import { socialLinks } from '../lib/socialLinks';

export const Footer = () => {
  const footerRef = useRef<HTMLElement>(null);
  const prefersReduced = useReducedMotion();

  // Ambient cursor glow tracking across footer
  const cursorX = useMotionValue(-500);
  const cursorY = useMotionValue(-500);
  const smoothCursorX = useSpring(cursorX, { stiffness: 180, damping: 24 });
  const smoothCursorY = useSpring(cursorY, { stiffness: 180, damping: 24 });
  const [isMouseOverFooter, setIsMouseOverFooter] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    if (prefersReduced || !footerRef.current) return;
    const rect = footerRef.current.getBoundingClientRect();
    cursorX.set(e.clientX - rect.left);
    cursorY.set(e.clientY - rect.top);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Divider entrance: scaleX from 0 to 1 with origin left
  const dividerVariants: Variants = {
    hidden: { scaleX: prefersReduced ? 1 : 0 },
    visible: {
      scaleX: 1,
      transition: {
        duration: 1.2,
        delay: 0.5,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  return (
    <footer
      ref={footerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsMouseOverFooter(true)}
      onMouseLeave={() => setIsMouseOverFooter(false)}
      className="relative w-full bg-white text-[#0B0B14] overflow-hidden pt-[72px] border-l border-b border-black/[0.04]"
    >
      {/* Ambient Cursor Glow (rgba(79,143,247,0.06), 600px) */}
      {!prefersReduced && (
        <motion.div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: `radial-gradient(circle 300px at ${smoothCursorX}px ${smoothCursorY}px, rgba(79, 143, 247, 0.06) 0%, rgba(79, 143, 247, 0) 70%)`,
          }}
          animate={{
            opacity: isMouseOverFooter ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Main Container: Max-width 1200px centered */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-6">
        {/* PART 1: 4 LINK COLUMNS (PRODUCT, DOCS, COMPANY, LEGAL) */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {footerColumnsData.map((column, index) => (
            <FooterColumn
              key={column.title}
              column={column}
              columnIndex={index}
            />
          ))}
        </div>

        {/* PART 2: DIVIDER LINE */}
        <div className="w-full mt-20">
          <motion.div
            variants={dividerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            style={{ transformOrigin: 'left' }}
            className="w-full h-[1px] bg-black/[0.08]"
          />
        </div>

        {/* PART 3: BRAND + NEWSLETTER ROW (~64px margin-top) */}
        <div className="w-full mt-16 flex flex-col lg:flex-row lg:items-start justify-between gap-12">
          {/* LEFT: SpidyDashboard Logo (size 58 with wordmark 54px) */}
          <div className="lg:pt-5 overflow-visible">
            <SpidyLogo size={58} withWordmark wordmarkSize={54} />
          </div>

          {/* RIGHT: Newsletter Block */}
          <NewsletterForm />
        </div>

        {/* PART 4: BOTTOM BAR (Connect Section + Copyright, margin-top ~64px, padding-bottom ~48px) */}
        <div className="w-full mt-16 pb-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* LEFT: Connect with Parth section */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-[#0B0B14] font-headline hidden md:inline-block mr-1">
              Connect:
            </span>
            <div className="flex items-center justify-center gap-2.5 sm:gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  onClick={(e) => {
                    if (link.id === 'email' || link.url.startsWith('mailto:')) {
                      e.preventDefault();
                      window.dispatchEvent(new CustomEvent('open-contact-modal'));
                    }
                  }}
                  target={link.id === 'email' ? undefined : '_blank'}
                  rel="noopener noreferrer"
                  aria-label={link.ariaLabel}
                  className="group inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#F5F5F7] hover:bg-white text-[#0B0B14] border border-black/[0.08] hover:border-[#4F8FF7]/40 hover:text-[#4F8FF7] hover:shadow-[0_4px_16px_rgba(79,143,247,0.2)] hover:-translate-y-0.5 transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-[#4F8FF7]/40"
                >
                  <span className="text-gray-600 group-hover:text-[#4F8FF7] transition-colors duration-200 flex items-center justify-center">
                    {link.iconType === 'email' && <Mail className="w-4 h-4 stroke-[2]" />}
                    {link.iconType === 'portfolio' && <Globe className="w-4 h-4 stroke-[2]" />}
                    {link.iconType === 'linkedin' && (
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c-.97 0-1.75-.79-1.75-1.76s.78-1.76 1.75-1.76 1.75.79 1.75 1.76-.78 1.76-1.75 1.76m1.4 9.74v-8.37H5.06v8.37h2.8Z" />
                      </svg>
                    )}
                    {link.iconType === 'facebook' && (
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95C18.05 21.45 22 17.19 22 12Z" />
                      </svg>
                    )}
                  </span>
                  <span className="text-[13px] sm:text-[14px] font-medium hidden md:inline text-[#0B0B14] group-hover:text-[#4F8FF7] transition-colors duration-200">
                    {link.label}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* RIGHT: Copyright Text & Attribution */}
          <motion.div
            initial={{ opacity: 0, y: prefersReduced ? 0 : 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: 0.6,
              delay: 0.4,
              ease: [0.22, 1, 0.36, 1] as const,
            }}
            className="text-center sm:text-right space-y-1"
          >
            <p className="text-[15px] font-medium text-[#111111]">
              © 2026 SpidyDashboard. All rights reserved.
            </p>
            <p className="text-[12px] text-gray-500">
              Built on SpiderFoot, MIT License &bull; Created by Parth Arora (SOC Analyst)
            </p>
          </motion.div>
        </div>

        {/* Floating Back to Top Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="pb-8 flex justify-start"
        >
          <motion.button
            onClick={scrollToTop}
            whileHover={{ y: -3, scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 20,
            }}
            aria-label="Scroll back to top"
            className="w-11 h-11 rounded-full bg-white text-[#0B0B14] border border-black/[0.08] shadow-md flex items-center justify-center hover:text-[#4F8FF7] hover:border-[#4F8FF7]/40 transition-colors cursor-pointer"
          >
            <ArrowUp className="w-5 h-5 stroke-[2.2]" />
          </motion.button>
        </motion.div>
      </div>
    </footer>
  );
};
