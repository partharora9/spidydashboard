import { motion, type Variants } from 'framer-motion';

interface FigmaLogoProps {
  isHovered?: boolean;
  className?: string;
}

export const FigmaLogo = ({ isHovered = false, className = '' }: FigmaLogoProps) => {
  const shapeVariants: Variants = {
    hidden: { scale: 0, opacity: 0 },
    visible: (i: number) => ({
      scale: 1,
      opacity: 1,
      transition: {
        delay: 0.15 + i * 0.1,
        type: 'spring' as const,
        stiffness: 260,
        damping: 18,
      },
    }),
  };

  return (
    <motion.div
      animate={
        isHovered
          ? {
              rotate: [0, -8, 8, -5, 5, 0],
              transition: { duration: 0.6, ease: 'easeInOut' },
            }
          : { rotate: 0 }
      }
      className={`inline-block select-none origin-center ${className}`}
    >
      <svg
        width="34"
        height="50"
        viewBox="0 0 48 72"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        {/* 1. Top-Left: Red-Orange */}
        <motion.path
          custom={0}
          variants={shapeVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          d="M0 12C0 5.37258 5.37258 0 12 0H24V24H12C5.37258 24 0 18.6274 0 12Z"
          fill="#F24E1E"
        />

        {/* 2. Top-Right: Coral */}
        <motion.path
          custom={1}
          variants={shapeVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          d="M24 0H36C42.6274 0 48 5.37258 48 12C48 18.6274 42.6274 24 36 24H24V0Z"
          fill="#FF7262"
        />

        {/* 3. Middle-Left: Purple */}
        <motion.path
          custom={2}
          variants={shapeVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          d="M0 36C0 29.3726 5.37258 24 12 24H24V48H12C5.37258 48 0 42.6274 0 36Z"
          fill="#A259FF"
        />

        {/* 4. Middle-Right: Blue Circle */}
        <motion.circle
          custom={3}
          variants={shapeVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          cx="36"
          cy="36"
          r="12"
          fill="#1ABCFE"
        />

        {/* 5. Bottom-Left: Green Teardrop */}
        <motion.path
          custom={4}
          variants={shapeVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          d="M0 60C0 53.3726 5.37258 48 12 48H24V60C24 66.6274 18.6274 72 12 72C5.37258 72 0 66.6274 0 60Z"
          fill="#0ACF83"
        />
      </svg>
    </motion.div>
  );
};
