import { useState } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import type { FooterColumnData, FooterLink } from '../data/footerLinks';

interface FooterColumnProps {
  column: FooterColumnData;
  columnIndex: number;
}

const SingleFooterLink = ({
  link,
  columnIndex,
  linkIndex,
}: {
  link: FooterLink;
  columnIndex: number;
  linkIndex: number;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const prefersReduced = useReducedMotion();

  const linkVariants: Variants = {
    hidden: {
      y: prefersReduced ? 0 : 14,
      opacity: 0,
      filter: prefersReduced ? 'none' : 'blur(6px)',
    },
    visible: {
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      transition: {
        delay: columnIndex * 0.08 + linkIndex * 0.05 + 0.15,
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  return (
    <motion.li
      variants={linkVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="list-none"
    >
      <motion.a
        href={link.href}
        onClick={(e) => {
          if (
            link.href === '#contact-developer' ||
            link.href.startsWith('mailto:') ||
            link.label.includes('parthxcore@gmail.com')
          ) {
            e.preventDefault();
            window.dispatchEvent(new CustomEvent('open-contact-modal'));
          }
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        animate={{
          x: isHovered && !prefersReduced ? 6 : 0,
          color: isHovered ? '#4F8FF7' : 'rgba(17, 17, 17, 0.85)',
        }}
        whileTap={{ scale: 0.98 }}
        transition={{
          duration: 0.25,
          ease: [0.22, 1, 0.36, 1] as const,
        }}
        className="relative inline-block text-[17px] font-normal leading-[24px] tracking-[-0.01em] transition-colors"
      >
        <span>{link.label}</span>

        {/* Animated underline that expands from left on hover */}
        <motion.span
          initial={{ width: 0 }}
          animate={{ width: isHovered ? '100%' : 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
          className="absolute left-0 bottom-0 h-[1.5px] bg-[#4F8FF7] pointer-events-none"
        />
      </motion.a>
    </motion.li>
  );
};

export const FooterColumn = ({ column, columnIndex }: FooterColumnProps) => {
  const prefersReduced = useReducedMotion();

  const headingVariants: Variants = {
    hidden: {
      y: prefersReduced ? 0 : 20,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        delay: columnIndex * 0.08,
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  return (
    <div className="flex flex-col w-full">
      {/* Column Heading */}
      <motion.h4
        variants={headingVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="text-[15px] font-semibold uppercase tracking-[0.04em] text-[#0B0B14] font-sans"
      >
        {column.title}
      </motion.h4>

      {/* Links List starting ~48px below heading, ~40px vertical pitch between links */}
      <ul className="mt-12 flex flex-col gap-4">
        {column.links.map((link, linkIndex) => (
          <SingleFooterLink
            key={link.label}
            link={link}
            columnIndex={columnIndex}
            linkIndex={linkIndex}
          />
        ))}
      </ul>
    </div>
  );
};
