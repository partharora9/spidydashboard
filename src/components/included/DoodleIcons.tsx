import { motion } from 'framer-motion';

export const DoodleIcons = () => {
  const drawTransition = (delay: number) => ({
    pathLength: {
      delay,
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1] as const,
    },
    opacity: {
      delay,
      duration: 0.3,
    },
  });

  return (
    <div className="flex items-center justify-between w-full max-w-[340px] px-1 select-none">
      {/* 1. Lightbulb with rays */}
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        className="w-10 h-10 flex items-center justify-center text-[#0B0B14]"
      >
        <svg width="34" height="34" viewBox="0 0 36 36" fill="none">
          {/* Bulb Outline */}
          <motion.path
            d="M13 19.5C11.5 17.5 11 15 11.5 12.5C12.2 8.8 15.2 6 19 6C23 6 26.2 9 26.5 13C26.7 15.5 25.5 18 24 19.8C22.8 21.2 22.4 22.5 22.2 24.2H14.8C14.6 22.5 14.1 21 13 19.5Z"
            stroke="#0B0B14"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={drawTransition(0.1)}
          />
          {/* Base threads */}
          <motion.path
            d="M15 27H22 M16 29.5H21"
            stroke="#0B0B14"
            strokeWidth="1.8"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={drawTransition(0.3)}
          />
          {/* Filament inside */}
          <motion.path
            d="M16 17C17 14 18 13.5 19 15C20 16.5 21 14 21.5 16"
            stroke="#0B0B14"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={drawTransition(0.25)}
          />
          {/* Doodle rays around */}
          <motion.path
            d="M19 1.5V3.5 M8.5 7L10 8.5 M29 7.5L27.5 9 M5.5 14H7.5 M30.5 14.5H32.5"
            stroke="#0B0B14"
            strokeWidth="1.7"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={drawTransition(0.4)}
          />
        </svg>
      </motion.div>

      {/* 2. Pencil with squiggle */}
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
        className="w-10 h-10 flex items-center justify-center text-[#0B0B14]"
      >
        <svg width="34" height="34" viewBox="0 0 36 36" fill="none">
          {/* Pencil body */}
          <motion.path
            d="M14.5 24.5L27.5 11.5C28.5 10.5 28.5 9 27.5 8L26 6.5C25 5.5 23.5 5.5 22.5 6.5L9.5 19.5L8.5 25.5L14.5 24.5Z"
            stroke="#0B0B14"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={drawTransition(0.25)}
          />
          {/* Pencil tip separator & detail */}
          <motion.path
            d="M11 21L13 23 M21 8L26 13"
            stroke="#0B0B14"
            strokeWidth="1.6"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={drawTransition(0.4)}
          />
          {/* Playful squiggle line coming from tip */}
          <motion.path
            d="M7 27C5.5 27.5 5 29 6 30C7 31 8.5 30 7.5 32"
            stroke="#0B0B14"
            strokeWidth="1.7"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={drawTransition(0.5)}
          />
        </svg>
      </motion.div>

      {/* 3. User avatar */}
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3.1, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
        className="w-10 h-10 flex items-center justify-center text-[#0B0B14]"
      >
        <svg width="34" height="34" viewBox="0 0 36 36" fill="none">
          {/* Head */}
          <motion.path
            d="M18 16C20.76 16 23 13.5 23 10.5C23 7.5 20.76 5 18 5C15.24 5 13 7.5 13 10.5C13 13.5 15.24 16 18 16Z"
            stroke="#0B0B14"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={drawTransition(0.4)}
          />
          {/* Torso / shoulders */}
          <motion.path
            d="M8.5 29C9 23.5 13 20.5 18 20.5C23 20.5 27 23.5 27.5 29"
            stroke="#0B0B14"
            strokeWidth="1.8"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={drawTransition(0.6)}
          />
        </svg>
      </motion.div>

      {/* 4. Chat bubbles */}
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1.1 }}
        className="w-10 h-10 flex items-center justify-center text-[#0B0B14]"
      >
        <svg width="34" height="34" viewBox="0 0 36 36" fill="none">
          {/* Back small bubble */}
          <motion.path
            d="M23 11H25.5C28 11 30 12.8 30 15C30 16.5 29 17.8 27.5 18.5V20.5L25 19H23"
            stroke="#0B0B14"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={drawTransition(0.55)}
          />
          {/* Front main speech bubble */}
          <motion.path
            d="M8.5 13C8.5 9.7 11.2 7 14.5 7H21.5C24.8 7 27.5 9.7 27.5 13V18C27.5 21.3 24.8 24 21.5 24H16.5L11.5 27.5V24C9.5 23 8.5 20.8 8.5 18V13Z"
            stroke="#0B0B14"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={drawTransition(0.7)}
          />
          {/* 3 speech dots */}
          <motion.circle
            cx="13.5"
            cy="15.5"
            r="1"
            fill="#0B0B14"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.9, duration: 0.2 }}
          />
          <motion.circle
            cx="18"
            cy="15.5"
            r="1"
            fill="#0B0B14"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 1.0, duration: 0.2 }}
          />
          <motion.circle
            cx="22.5"
            cy="15.5"
            r="1"
            fill="#0B0B14"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 1.1, duration: 0.2 }}
          />
        </svg>
      </motion.div>
    </div>
  );
};
