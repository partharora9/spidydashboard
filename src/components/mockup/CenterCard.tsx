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
    <div className="w-[410px] max-w-[92vw] bg-white rounded-[24px] shadow-[0_30px_80px_rgba(20,30,60,0.12)] border border-black/[0.04] p-4 relative overflow-visible select-none text-[#0B0B14] shrink-0">
      {/* Soft blue glow behind center card: blurred radial-gradient with inset -120px, pointer-events-none, z-0, unclipped */}
      <motion.div
        animate={{
          opacity: [0.65, 0.9, 0.65],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -inset-[120px] rounded-full blur-[40px] pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(207, 226, 255, 0.65) 0%, rgba(226, 237, 253, 0.3) 50%, rgba(255, 255, 255, 0) 75%)',
        }}
      />

      <div className="relative z-10 flex flex-col gap-3">
        {/* Mini Navbar: perfectly fits inside 410px card on one single line */}
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-gray-100 flex-nowrap whitespace-nowrap overflow-visible">
          {/* Logo with SpidyLogo */}
          <div className="shrink-0 flex items-center">
            <SpidyLogo size={13} withWordmark wordmarkSize={10} animateEntrance={false} interactive={false} />
          </div>

          {/* Links: Home, Features, Modules, Docs, Pricing (10.5px, 9px gap) */}
          <div className="flex items-center gap-[9px] text-gray-500 font-medium text-[10.5px] shrink-0 whitespace-nowrap">
            <span>Home</span>
            <span>Features</span>
            <span>Modules</span>
            <span>Docs</span>
            <span>Pricing</span>
          </div>

          {/* Actions: Log in and Sign up with flex-shrink: 0 */}
          <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
            <span className="text-gray-700 font-medium text-[10.5px] shrink-0 whitespace-nowrap">
              Log in
            </span>
            <span className="bg-[#4F8FF7] text-white text-[10.5px] font-semibold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap shadow-sm">
              Sign up
            </span>
          </div>
        </div>

        {/* Mini Hero Header */}
        <div className="text-center pt-1 px-2 flex flex-col items-center">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-[8px] font-semibold tracking-wider text-blue-600 uppercase mb-1.5">
            OSINT AUTOMATION PLATFORM
          </span>
          <h2 className="text-[19px] sm:text-[21px] font-semibold leading-[1.2] text-[#0B0B14] max-w-[340px]">
            Map your attack surface<br />before attackers do
          </h2>
          <p className="text-[10.5px] text-gray-500 leading-normal mt-1.5 max-w-[320px]">
            SpidyDashboard automates reconnaissance across 200+ data sources, so you can find exposed assets, leaked data and hidden risks in minutes.
          </p>

          <div className="flex items-center gap-2.5 mt-2.5">
            <button className="bg-[#4F8FF7] text-white text-[10px] font-medium px-3.5 py-1.5 rounded-full shadow-sm hover:bg-blue-600 transition-colors">
              Start free scan
            </button>
            <button className="text-gray-700 text-[10px] font-medium flex items-center gap-0.5 hover:text-black">
              View live demo
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Real Video Screen Preview (SpidyDashboard Discovery Inventory) */}
        <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-[0_12px_30px_rgba(0,0,0,0.08)] mt-1 w-full relative bg-slate-900">
          <CardVideo
            id="center"
            src="/videos/center.mp4"
            poster="/videos/center-poster.jpg"
            registerVideo={registerVideo}
            allowPlay={allowPlay}
            aspectRatio="aspect-[16/10]"
          />
        </div>

        {/* Brand Logos Row at the bottom */}
        <div className="pt-2 flex flex-col items-center text-center">
          <p className="text-[9px] text-gray-400 font-medium mb-1.5">
            INTEGRATED WITH YOUR STACK
          </p>
          <MockupLogos />
        </div>
      </div>
    </div>
  );
};
