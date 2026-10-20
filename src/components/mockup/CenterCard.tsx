import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { CardVideo } from './CardVideo';
import { MockupLogos } from './MockupLogos';
import { SpidyLogo } from '../SpidyLogo';

interface CenterCardProps {
  allowPlay?: boolean;
  registerVideo?: (id: string, el: HTMLVideoElement | null) => void;
}

export const CenterCard = ({
  allowPlay = true,
  registerVideo,
}: CenterCardProps) => {
  return (
    <div className="w-full max-w-[410px] bg-white rounded-[20px] sm:rounded-[24px] shadow-[0_20px_60px_rgba(20,30,60,0.12)] border border-black/[0.04] p-3.5 sm:p-4 relative overflow-visible select-none text-[#0B0B14] shrink-0">
      {/* Soft blue glow behind center card */}
      <motion.div
        animate={{
          opacity: [0.65, 0.9, 0.65],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -inset-[80px] sm:-inset-[120px] rounded-full blur-[40px] pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(207, 226, 255, 0.65) 0%, rgba(226, 237, 253, 0.3) 50%, rgba(255, 255, 255, 0) 75%)',
        }}
      />

      <div className="relative z-10 flex flex-col gap-2.5 sm:gap-3">
        {/* Mini Navbar: fits neatly inside card header */}
        <div className="flex items-center justify-between gap-1.5 pb-2.5 border-b border-gray-100 flex-nowrap whitespace-nowrap overflow-visible">
          {/* Logo with SpidyLogo */}
          <div className="shrink-0 flex items-center">
            <SpidyLogo size={13} withWordmark wordmarkSize={10} animateEntrance={false} interactive={false} />
          </div>

          {/* Links: Home, Features, Modules, Docs, Pricing */}
          <div className="hidden xs:flex sm:flex items-center gap-[7px] sm:gap-[9px] text-gray-500 font-medium text-[11px] sm:text-[11.5px] shrink-0 whitespace-nowrap">
            <span>Features</span>
            <span>Modules</span>
            <span>Pricing</span>
          </div>

          {/* Actions: Log in and Sign up with flex-shrink: 0 */}
          <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
            <span className="text-gray-700 font-medium text-[11px] sm:text-[11.5px] shrink-0 whitespace-nowrap">
              Log in
            </span>
            <span className="bg-[#4F8FF7] text-white text-[11px] sm:text-[11.5px] font-semibold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap shadow-sm">
              Sign up
            </span>
          </div>
        </div>

        {/* Video Canvas: Clean 16/10 screen recording of SpidyDashboard overview */}
        <CardVideo
          id="center-video"
          src="/videos/center.mp4"
          poster="/videos/center-poster.jpg"
          aspectRatio="aspect-[16/10]"
          allowPlay={allowPlay}
          registerVideo={registerVideo}
          className="rounded-[14px] sm:rounded-[16px] shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
        />

        {/* Card Footer: Headline, Subheadline & Secondary CTA pill */}
        <div className="flex items-center justify-between pt-1 overflow-visible gap-2">
          <div className="min-w-0 pr-1">
            <div className="font-headline font-semibold text-[#0B0B14] text-[14px] sm:text-[15px] leading-tight truncate">
              Continuous Intelligence
            </div>
            <div className="text-gray-500 text-[12px] sm:text-[12.5px] mt-0.5 leading-snug line-clamp-1">
              Live attack surface telemetry across 200+ sources
            </div>
          </div>

          {/* Secondary CTA Button */}
          <a
            href="/pricing"
            className="shrink-0 flex items-center gap-1 bg-[#F5F5F7] hover:bg-gray-200/80 text-[#0B0B14] text-[12px] font-semibold px-3 py-1.5 rounded-full transition-colors group cursor-pointer"
          >
            <span>Run</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
          </a>
        </div>

        {/* Brand Logos Bar */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between overflow-visible">
          <MockupLogos />
        </div>
      </div>
    </div>
  );
};
