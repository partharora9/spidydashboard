import { ChevronRight } from 'lucide-react';
import { CardVideo } from './CardVideo';
import { SpidyLogo } from '../SpidyLogo';

interface RightCardProps {
  allowPlay?: boolean;
  registerVideo?: (id: string, el: HTMLVideoElement | null) => void;
}

export const RightCard = ({
  allowPlay = true,
  registerVideo,
}: RightCardProps) => {
  const barHeights = [35, 55, 45, 75, 60, 90, 80, 85, 70, 95, 65, 88];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const recentScans = [
    { target: 'example.com', type: 'Domain', status: 'Completed', progress: 100 },
    { target: '192.168.4.21', type: 'IPv4', status: 'Completed', progress: 100 },
    { target: 'admin@company.io', type: 'Email', status: 'Completed', progress: 100 },
    { target: '@darkhandle', type: 'Username', status: 'Completed', progress: 100 },
  ];

  return (
    <div className="w-[410px] max-w-[92vw] bg-white rounded-[24px] shadow-[0_30px_80px_rgba(20,30,60,0.12)] border border-black/[0.04] p-6 relative overflow-hidden select-none text-[#0B0B14]">
      {/* Mini top bar */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 text-[10px]">
        <div className="shrink-0">
          <SpidyLogo size={14} withWordmark wordmarkSize={12} animateEntrance={false} interactive={false} />
        </div>
        <div className="flex items-center gap-2.5 text-gray-400 font-medium text-[9px]">
          <span>Modules</span>
          <span>Reports</span>
          <span>Contact</span>
        </div>
      </div>

      {/* Hero Content */}
      <div className="mt-5 space-y-4">
        {/* Left-aligned heading */}
        <h2 className="text-[25px] font-semibold tracking-[-0.03em] leading-[1.18] text-[#0B0B14]">
          Monitor threats and get<br />visibility on your exposure
        </h2>

        <p className="text-[12px] text-gray-500 leading-relaxed max-w-[320px]">
          Track new subdomains, open ports, leaked credentials and misconfigurations across your entire infrastructure in one unified workspace.
        </p>

        {/* Buttons */}
        <div className="flex items-center gap-3 pt-0.5">
          <button className="bg-[#4F8FF7] text-white text-[12px] font-medium px-4 py-2 rounded-full shadow-[0_4px_12px_rgba(79,143,247,0.3)] hover:bg-blue-600 transition-colors">
            Start free scan
          </button>
          <button className="text-gray-700 text-[12px] font-medium flex items-center gap-1 hover:text-black">
            Talk to sales
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Real Video Screen Preview */}
        <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-[0_12px_30px_rgba(0,0,0,0.08)] mt-3 w-full relative bg-slate-900">
          <CardVideo
            id="right"
            src="/videos/right.mp4"
            poster="/videos/right-poster.jpg"
            registerVideo={registerVideo}
            allowPlay={allowPlay}
            aspectRatio="aspect-[16/10]"
          />
        </div>

        {/* Mini Dashboard Metrics */}
        <div className="pt-2 space-y-3">
          {/* 3 Metric Cards */}
          <div className="grid grid-cols-3 gap-2 text-left">
            <div className="bg-[#F8FAFC] p-2.5 rounded-xl border border-gray-100">
              <span className="text-[10px] text-gray-400 font-medium block">Assets found</span>
              <span className="text-[15px] font-bold text-[#0B0B14] block mt-0.5">12,480</span>
            </div>

            <div className="bg-[#F8FAFC] p-2.5 rounded-xl border border-gray-100">
              <span className="text-[10px] text-gray-400 font-medium block">Risks detected</span>
              <span className="text-[15px] font-bold text-rose-600 block mt-0.5">342</span>
            </div>

            <div className="bg-[#F8FAFC] p-2.5 rounded-xl border border-gray-100">
              <span className="text-[10px] text-gray-400 font-medium block">Modules run</span>
              <span className="text-[15px] font-bold text-blue-600 block mt-0.5">218</span>
            </div>
          </div>

          {/* Scan Activity Bar Chart & Risk Score Gauge */}
          <div className="grid grid-cols-2 gap-2">
            {/* Risk Score 75% Gauge */}
            <div className="bg-[#F8FAFC] p-3 rounded-xl border border-gray-100 flex flex-col items-center justify-between">
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] font-bold text-[#0B0B14]">Risk score 75%</span>
                <div className="flex items-center gap-1.5 text-[8px] text-gray-400">
                  <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />High</span>
                  <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />Low</span>
                </div>
              </div>

              <div className="relative my-1 flex items-center justify-center">
                <svg width="100" height="55" viewBox="0 0 100 55">
                  <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="125.6"
                    strokeDashoffset="31.4"
                  />
                </svg>
                <div className="absolute bottom-0 text-center">
                  <span className="text-[13px] font-bold text-[#0B0B14]">75%</span>
                </div>
              </div>
            </div>

            {/* Scan Activity Bar Chart */}
            <div className="bg-[#F8FAFC] p-3 rounded-xl border border-gray-100 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#0B0B14]">Scan activity</span>
                <span className="text-[9px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">Active</span>
              </div>
              <div className="flex items-end justify-between gap-0.5 h-11 pt-2">
                {barHeights.map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div
                      style={{ height: `${h * 0.35}px` }}
                      className={`w-full rounded-t-xs ${i === 5 || i === 9 ? 'bg-blue-600' : 'bg-blue-300'}`}
                    />
                    <span className="text-[6px] text-gray-400 mt-0.5 leading-none">{months[i].charAt(0)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Scans Table */}
          <div className="bg-[#F8FAFC] p-3 rounded-xl border border-gray-100">
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-gray-200/60 text-[10px] font-semibold text-gray-500">
              <span>Recent scans</span>
              <span>Status</span>
            </div>
            <div className="space-y-1.5">
              {recentScans.map((scan, idx) => (
                <div key={idx} className="flex items-center justify-between text-[10px] bg-white px-2 py-1.5 rounded-lg border border-gray-50">
                  <span className="font-mono text-[#0B0B14] font-medium truncate max-w-[150px]">{scan.target}</span>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-50 text-emerald-600 text-[8px] px-1.5 py-0.5 rounded-full font-medium">
                      {scan.status}
                    </span>
                    <div className="w-10 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div style={{ width: `${scan.progress}%` }} className="h-full bg-blue-500 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom cut-off text */}
        <div className="pt-2 border-t border-gray-100">
          <p className="text-[12px] font-medium text-gray-400 italic">
            Cyber intelligence that works for you.
          </p>
        </div>
      </div>
    </div>
  );
};
