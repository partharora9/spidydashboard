import { useRef, useState, type MouseEvent } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  useReducedMotion,
  type Variants,
} from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import type { BlogPost } from '../data/blogs';
import { BlogCover } from './blogs/BlogCovers';
import { BlogAvatar } from './blogs/BlogAvatars';

export interface BlogCardProps {
  post: BlogPost;
  index: number;
}

export const BlogCard = ({ post, index }: BlogCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const prefersReduced = useReducedMotion();

  // Column and Row indices for staggered entrance delay
  const col = index % 3;
  const row = Math.floor(index / 3);
  const entranceDelay = col * 0.12 + row * 0.1;

  // Scroll Parallax: cover moves +/-12px inside its overflow-hidden container
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'end start'],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [-12, 12]);

  // 3D Tilt with useMotionValue and useSpring (max 3 degrees, perspective 1000px)
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const rotateXRaw = useTransform(mouseY, [0, 1], [3, -3]);
  const rotateYRaw = useTransform(mouseX, [0, 1], [-3, 3]);

  const springConfig = { stiffness: 280, damping: 25 };
  const rotateX = useSpring(rotateXRaw, springConfig);
  const rotateY = useSpring(rotateYRaw, springConfig);

  // Soft white glare reflection tracking cursor over the cover (0% to 100%)
  const glareX = useSpring(useTransform(mouseX, [0, 1], [0, 100]), springConfig);
  const glareY = useSpring(useTransform(mouseY, [0, 1], [0, 100]), springConfig);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (prefersReduced || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  // Card Outer Entrance Variants
  const cardVariants: Variants = {
    hidden: {
      y: prefersReduced ? 0 : 70,
      opacity: 0,
      scale: prefersReduced ? 1 : 0.96,
    },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.9,
        delay: entranceDelay,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  // Content fade-up sequence (stagger 0.07s after card enters)
  const contentFadeVariants: Variants = {
    hidden: {
      y: prefersReduced ? 0 : 16,
      opacity: 0,
    },
    visible: (customIndex: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: entranceDelay + 0.3 + customIndex * 0.07,
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    }),
  };

  return (
    <motion.article
      ref={cardRef}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 1000,
        rotateX: prefersReduced ? 0 : rotateX,
        rotateY: prefersReduced ? 0 : rotateY,
        transformStyle: 'preserve-3d',
      }}
      className="group relative w-full max-w-[380px] bg-white rounded-[20px] overflow-hidden flex flex-col cursor-pointer transition-shadow duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]"
      animate={{
        y: isHovered && !prefersReduced ? -8 : 0,
        boxShadow: isHovered
          ? '0 24px 60px rgba(20, 30, 60, 0.14)'
          : '0 10px 40px rgba(20, 30, 60, 0.08)',
      }}
      transition={{
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1] as const,
      }}
    >
      {/* Cover Image Container (220px mobile, 280px desktop height, overflow hidden) */}
      <div className="relative w-full h-[220px] sm:h-[280px] overflow-hidden rounded-t-[20px] bg-slate-50 select-none">
        {/* Clip-path reveal wipe (inset(0 0 100% 0) to inset(0)) + scale 1.15 to 1.0 */}
        <motion.div
          initial={{
            clipPath: prefersReduced ? 'inset(0)' : 'inset(0 0 100% 0)',
            scale: prefersReduced ? 1 : 1.15,
          }}
          whileInView={{
            clipPath: 'inset(0 0 0% 0)',
            scale: 1,
          }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{
            duration: 1.1,
            delay: entranceDelay + 0.1,
            ease: [0.22, 1, 0.36, 1] as const,
          }}
          style={{ y: prefersReduced ? 0 : parallaxY }}
          className="w-full h-full"
        >
          {/* Zoom cover image to scale 1.06 on card hover */}
          <motion.div
            animate={{
              scale: isHovered && !prefersReduced ? 1.06 : 1,
            }}
            transition={{
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1] as const,
            }}
            className="w-full h-full"
          >
            <BlogCover type={post.coverType} />
          </motion.div>
        </motion.div>

        {/* Soft white light reflection overlay tracking cursor */}
        {!prefersReduced && (
          <motion.div
            style={{
              background: `radial-gradient(circle 180px at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0) 80%)`,
            }}
            animate={{
              opacity: isHovered ? 0.7 : 0,
            }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 pointer-events-none z-10"
          />
        )}

        {/* Top-Right Circular Arrow Button (fades and slides in on hover) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7, x: 8, y: -8 }}
          animate={{
            opacity: isHovered ? 1 : 0,
            scale: isHovered ? 1 : 0.7,
            x: isHovered ? 0 : 8,
            y: isHovered ? 0 : -8,
          }}
          transition={{
            duration: 0.35,
            ease: [0.22, 1, 0.36, 1] as const,
          }}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white text-[#0B0B14] shadow-md flex items-center justify-center pointer-events-none"
        >
          <ArrowUpRight className="w-5 h-5 stroke-[2.2]" />
        </motion.div>
      </div>

      {/* Content Container (padding 24px) */}
      <div className="p-6 flex flex-col flex-1">
        {/* Category Tag */}
        <motion.div
          custom={0}
          variants={contentFadeVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          className="mt-1"
        >
          <motion.span
            animate={{
              y: isHovered && !prefersReduced ? -2 : 0,
            }}
            transition={{ duration: 0.25 }}
            style={{ backgroundColor: post.categoryBg }}
            className="inline-block px-3 py-1.5 rounded-[6px] text-[14px] font-medium text-[#0B0B14] tracking-wide uppercase select-none"
          >
            {post.category}
          </motion.span>
        </motion.div>

        {/* Blog Title: 2 lines, clamped */}
        <motion.h3
          custom={1}
          variants={contentFadeVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          className="mt-4 font-headline text-[20px] sm:text-[24px] font-medium leading-[30px] sm:leading-[36px] tracking-[-0.015em] transition-colors duration-300 line-clamp-2"
          animate={{
            color: isHovered ? '#4F8FF7' : '#0B0B14',
          }}
        >
          {post.title}
        </motion.h3>

        {/* Excerpt: clamped to 3 lines */}
        <motion.p
          custom={2}
          variants={contentFadeVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          className="mt-3 text-[15px] sm:text-[16px] leading-[26px] sm:leading-[28px] text-[#4A4A55] line-clamp-3"
        >
          {post.excerpt}
        </motion.p>

        {/* Author Row: margin-top 24px */}
        <motion.div
          custom={3}
          variants={contentFadeVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          className="mt-6 flex items-center gap-3 pt-1"
        >
          {/* Avatar with gentle 1.08 scale on hover */}
          <motion.div
            animate={{
              scale: isHovered && !prefersReduced ? 1.08 : 1,
            }}
            transition={{
              duration: 0.3,
              ease: [0.22, 1, 0.36, 1] as const,
            }}
          >
            <BlogAvatar id={post.author.avatarId} name={post.author.name} />
          </motion.div>

          {/* Author Name and Date / Read Time */}
          <div className="flex flex-col justify-center">
            <span className="text-[16px] font-medium text-[#0B0B14] leading-tight">
              {post.author.name}
            </span>
            <span className="text-[14px] text-[#555560] leading-normal mt-0.5 font-normal">
              {post.author.date} <span className="mx-1 text-[#888]">•</span> {post.author.readTime}
            </span>
          </div>
        </motion.div>
      </div>
    </motion.article>
  );
};
