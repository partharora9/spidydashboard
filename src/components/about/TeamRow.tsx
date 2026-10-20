import { useState } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import type { TeamMember } from '../../data/team';

interface TeamRowProps {
  member: TeamMember;
  index: number;
}

interface TeamLinkPillProps {
  label: string;
  url: string;
  ariaLabel: string;
  prefersReduced: boolean | null;
}

const TeamLinkPill = ({ label, url, ariaLabel, prefersReduced }: TeamLinkPillProps) => {
  const [isPillHovered, setIsPillHovered] = useState(false);

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      onMouseEnter={() => setIsPillHovered(true)}
      onMouseLeave={() => setIsPillHovered(false)}
      animate={
        prefersReduced
          ? undefined
          : {
              boxShadow: [
                '0 0 0 4px rgba(79,143,247,0.12)',
                '0 0 0 8px rgba(79,143,247,0.0)',
                '0 0 0 4px rgba(79,143,247,0.12)',
              ],
            }
      }
      transition={{
        boxShadow: {
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      }}
      whileHover={
        prefersReduced
          ? undefined
          : {
              y: -1,
              scale: 1.02,
              transition: { duration: 0.2 },
            }
      }
      whileTap={{ scale: prefersReduced ? 1 : 0.97 }}
      className={`relative inline-flex items-center justify-center gap-1.5 px-4 py-2.5 sm:px-5 sm:py-2.5 rounded-full font-sans text-[14px] sm:text-[15px] font-medium transition-all duration-300 w-full sm:w-auto min-h-[44px] ${
        isPillHovered && !prefersReduced
          ? 'bg-[#4F8FF7] text-white shadow-[0_4px_16px_rgba(79,143,247,0.35)]'
          : 'bg-[#F5F5F7] sm:bg-transparent text-[#4F8FF7]'
      }`}
    >
      <span className="tracking-[-0.01em]">{label}</span>
      <motion.span
        animate={{
          x: isPillHovered && !prefersReduced ? 3 : 0,
          y: isPillHovered && !prefersReduced ? -3 : 0,
        }}
        transition={{ duration: 0.2 }}
        className="flex items-center justify-center"
      >
        <ArrowUpRight className="w-4 h-4 stroke-[2.2]" />
      </motion.span>
    </motion.a>
  );
};

export const TeamRow = ({ member, index }: TeamRowProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const prefersReduced = useReducedMotion();

  const rowVariants: Variants = {
    hidden: {
      y: prefersReduced ? 0 : 30,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        delay: index * 0.1,
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  const linksToRender =
    member.links && member.links.length > 0
      ? member.links
      : [{ label: 'LinkedIn', url: member.linkedin || '#', ariaLabel: `${member.name} on LinkedIn` }];

  return (
    <motion.div
      variants={rowVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      whileHover={
        prefersReduced
          ? undefined
          : {
              y: -3,
              boxShadow: '0 16px 50px rgba(20,30,60,0.12)',
              transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
            }
      }
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full min-h-[120px] bg-white rounded-[16px] border border-black/[0.04] shadow-[0_10px_40px_rgba(20,30,60,0.06)] px-6 sm:px-8 py-5 sm:py-0 flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-6 transition-all duration-300 will-change-transform select-none"
    >
      {/* Left Column / Row: Name + Role Tag */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0">
        {/* Name: 22px, weight 400, #0B0B14, turns blue on hover */}
        <motion.span
          animate={{
            color: isHovered && !prefersReduced ? '#4F8FF7' : '#0B0B14',
          }}
          transition={{ duration: 0.2 }}
          className="font-sans text-[20px] sm:text-[22px] font-normal tracking-[-0.01em]"
        >
          {member.name}
        </motion.span>

        {/* Role Tag: 60px gap on desktop, uppercase 14px, Inter weight 500, outline 1px solid #0B0B14, pill rounded */}
        <motion.div
          animate={{
            x: isHovered && !prefersReduced ? 4 : 0,
          }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="sm:ml-[60px] inline-flex items-center justify-center border border-[#0B0B14] rounded-full px-4 py-2 w-fit bg-transparent"
        >
          <span className="font-sans text-[13px] sm:text-[14px] font-medium tracking-[0.06em] uppercase text-[#0B0B14] whitespace-nowrap">
            {member.role}
          </span>
        </motion.div>
      </div>

      {/* Right Column: Profile Links (Portfolio, LinkedIn, Facebook) in the exact pill pattern */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-start sm:justify-end gap-2.5 sm:gap-3 w-full sm:w-auto">
        {linksToRender.map((link) => (
          <TeamLinkPill
            key={link.label}
            label={link.label}
            url={link.url}
            ariaLabel={link.ariaLabel || `${member.name} on ${link.label}`}
            prefersReduced={prefersReduced}
          />
        ))}
      </div>
    </motion.div>
  );
};
