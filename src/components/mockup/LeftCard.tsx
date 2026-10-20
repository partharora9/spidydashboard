import { Star, ChevronRight, ShieldCheck, TrendingUp } from 'lucide-react';
import { CardVideo } from './CardVideo';
import { MockupLogos } from './MockupLogos';
import { SpidyLogo } from '../SpidyLogo';

interface LeftCardProps {
  allowPlay?: boolean;
  registerVideo?: (id: string, el: HTMLVideoElement | null) => void;
}

export const LeftCard = ({
  allowPlay = true,
  registerVideo,
}: LeftCardProps) => {
  return (
    <div className="w-[410px] max-w-[92vw] bg-white rounded-[24px] shadow-[0_30px_80px_rgba(20,30,60,0.12)] border border-black/[0.04] p-6 relative overflow-hidden select-none text-[#0B0B14]">
      {/* Mini top bar */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 text-[10px]">
        <div className="shrink-0">
          <SpidyLogo size={14} withWordmark wordmarkSize={12} animateEntrance={false} interactive={false} />
        </div>
        <div className="flex items-center gap-2.5 text-gray-400 font-medium text-[9px]">
          <span>Features</span>
          <span>Modules</span>
          <span>Docs</span>
          <span>Contact</span>
        </div>
      </div>

      {/* Hero content area */}
      <div className="mt-5 space-y-3.5">
        {/* Left-aligned 2-line heading */}
        <h2 className="text-[25px] font-semibold tracking-[-0.03em] leading-[1.18] text-[#0B0B14]">
          Discover every digital footprint<br />around your target
        </h2>

        {/* 2-line subtext */}
        <p className="text-[12px] text-gray-500 leading-relaxed max-w-[320px]">
          Scan domains, IPs, emails, usernames and phone numbers with one click. Every module runs automatically and reports back in real time.
        </p>

        {/* Buttons */}
        <div className="flex items-center gap-3 pt-0.5">
          <button className="bg-[#4F8FF7] text-white text-[12px] font-medium px-4 py-2 rounded-full shadow-[0_4px_12px_rgba(79,143,247,0.3)] hover:bg-blue-600 transition-colors">
            Start free scan
          </button>
          <button className="text-gray-700 text-[12px] font-medium flex items-center gap-1 hover:text-black">
            Read the docs
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Social proof row: green shield + 4.9 + 5 black stars + 546 security teams */}
        <div className="flex items-center gap-3 pt-1">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 bg-[#00B67A] rounded-sm flex items-center justify-center text-white">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <span className="text-[13px] font-bold text-[#0B0B14]">4.9</span>
          </div>

          <div className="flex items-center gap-0.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-[#0B0B14] text-[#0B0B14]" />
            ))}
          </div>

          <span className="text-[12px] text-gray-500 font-medium">546 security teams</span>
        </div>

        {/* Floating mini card: Scan results / 1,284 findings */}
        <div className="relative pt-1">
          <div className="w-full bg-[#F8FAFC] rounded-2xl p-3 shadow-[0_8px_20px_rgba(0,0,0,0.05)] border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-gray-500 block">Scan results</span>
                <span className="text-[16px] font-bold text-[#0B0B14]">1,284 findings</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                +18% this week
              </span>
              <div className="mt-1 w-16 h-4">
                <svg width="100%" height="100%" viewBox="0 0 64 16" fill="none">
                  <path d="M0 12 Q 16 4, 32 8 T 64 2" stroke="#3B82F6" strokeWidth="2" fill="none" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Real Video Screen Preview (SpidyDashboard Recon Scan) */}
        <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-[0_12px_30px_rgba(0,0,0,0.08)] mt-2 w-full relative bg-slate-900">
          <CardVideo
            id="left"
            src="/videos/left.mp4"
            poster="/videos/left-poster.jpg"
            registerVideo={registerVideo}
            allowPlay={allowPlay}
            aspectRatio="aspect-[16/10]"
          />
        </div>

        {/* Bottom logos row: INTEGRATED WITH YOUR STACK */}
        <div className="pt-2">
          <p className="text-[9px] text-gray-400 uppercase tracking-wider mb-1.5 font-semibold">
            INTEGRATED WITH YOUR STACK
          </p>
          <MockupLogos />
        </div>

        {/* Cut-off heading near the bottom */}
        <div className="pt-2 border-t border-gray-100">
          <h3 className="text-[15px] font-semibold text-[#0B0B14] truncate">
            Reconnaissance that handl…
          </h3>
          <p className="text-[10px] text-gray-400 mt-0.5">
            Real-time scans across all your assets…
          </p>
        </div>
      </div>
    </div>
  );
};
