import { Shield, Terminal, Globe, Activity, CheckCircle2, AlertTriangle } from 'lucide-react';

export const AboutDashboardMock = () => {
  return (
    <div className="w-full h-full bg-[#0B0F19] text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8 select-none relative overflow-hidden font-mono border-t border-x border-white/10 rounded-t-[24px]">
      {/* Background Cyber Grid Accent */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(rgba(79, 143, 247, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(79, 143, 247, 0.15) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Top Header Bar */}
      <div className="relative z-10 flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
          <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
          <span className="ml-3 text-[12px] sm:text-[13px] text-gray-400 font-sans font-medium hidden sm:inline">
            spidydashboard.internal // osint-recon-hub
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] sm:text-[12px] font-sans font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>200+ MODULES ACTIVE</span>
          </div>

          <div className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[11px] font-sans">
            <Shield className="w-3 h-3" />
            <span>SOC ANALYST BUILD</span>
          </div>
        </div>
      </div>

      {/* 4 Metric Badges */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 sm:my-5">
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 flex flex-col">
          <div className="flex items-center justify-between text-gray-400 text-[11px] font-sans">
            <span>Subdomains Mapped</span>
            <Globe className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <span className="text-[20px] sm:text-[24px] font-bold text-white mt-1">418</span>
        </div>

        <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 flex flex-col">
          <div className="flex items-center justify-between text-gray-400 text-[11px] font-sans">
            <span>Exposed Ports</span>
            <Activity className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <span className="text-[20px] sm:text-[24px] font-bold text-white mt-1">19</span>
        </div>

        <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 flex flex-col">
          <div className="flex items-center justify-between text-gray-400 text-[11px] font-sans">
            <span>SSL Certificate</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <span className="text-[18px] sm:text-[22px] font-bold text-emerald-400 mt-1">Grade A+</span>
        </div>

        <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 flex flex-col">
          <div className="flex items-center justify-between text-gray-400 text-[11px] font-sans">
            <span>Critical CVEs</span>
            <AlertTriangle className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <span className="text-[20px] sm:text-[24px] font-bold text-blue-400 mt-1">0 Found</span>
        </div>
      </div>

      {/* Main Console Split: Module Queue & Live Terminal */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 overflow-hidden">
        {/* Left: Active Module Streams */}
        <div className="hidden md:flex flex-col gap-2 bg-white/[0.03] border border-white/[0.06] rounded-xl p-3.5">
          <span className="text-[12px] font-sans font-semibold text-gray-300 uppercase tracking-wider mb-1">
            Running Modules
          </span>

          <div className="flex items-center justify-between text-[12px] py-1.5 border-b border-white/[0.05]">
            <span className="text-gray-300">Shodan Intelligence</span>
            <span className="text-emerald-400 text-[11px]">COMPLETED</span>
          </div>
          <div className="flex items-center justify-between text-[12px] py-1.5 border-b border-white/[0.05]">
            <span className="text-gray-300">VirusTotal Correlator</span>
            <span className="text-emerald-400 text-[11px]">COMPLETED</span>
          </div>
          <div className="flex items-center justify-between text-[12px] py-1.5 border-b border-white/[0.05]">
            <span className="text-gray-300">Sublist3r DNS Map</span>
            <span className="text-blue-400 text-[11px] animate-pulse">SCANNING</span>
          </div>
          <div className="flex items-center justify-between text-[12px] py-1.5">
            <span className="text-gray-300">HaveIBeenPwned Audit</span>
            <span className="text-emerald-400 text-[11px]">COMPLETED</span>
          </div>
        </div>

        {/* Center / Right: Terminal Output */}
        <div className="col-span-1 md:col-span-2 bg-black/40 border border-white/[0.08] rounded-xl p-3.5 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06] text-gray-400 text-[12px]">
            <Terminal className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-sans font-medium text-gray-300">Reconnaissance Audit Stream</span>
          </div>

          <div className="space-y-1.5 text-[11px] sm:text-[12px] text-gray-300 font-mono py-2">
            <div className="text-emerald-400/90">[INFO] SpidyDashboard engine initialized by Parth Arora (SOC Analyst)</div>
            <div className="text-gray-400">[OSINT] Ingesting telemetry across 200+ automated threat modules...</div>
            <div className="text-blue-400">[CORRELATION] 418 DNS records resolved — 19 public endpoints monitored</div>
            <div className="text-emerald-400/90">[CLEAN] No compromised credential leaks identified on darknet repositories</div>
            <div className="text-gray-400 flex items-center gap-1">
              <span>&gt; Ready for deep scan inquiry</span>
              <span className="w-2 h-3.5 bg-blue-400 inline-block animate-pulse ml-1" />
            </div>
          </div>

          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-gray-500 font-sans">
            <span>Target: internal-recon.local</span>
            <span className="text-blue-400 font-medium">SpidyDashboard Core</span>
          </div>
        </div>
      </div>
    </div>
  );
};
