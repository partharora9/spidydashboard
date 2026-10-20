import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';

export const CorrelationBoard = () => {
  const prefersReduced = useReducedMotion();
  const [selectedSeverity, setSelectedSeverity] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');

  const sources = [
    {
      name: 'VirusTotal API',
      module: 'sfp_virustotal',
      evidence: '14/88 engines flagged host as malicious C2 endpoint',
      score: '14 detections',
      color: '#EF4444',
    },
    {
      name: 'AbuseIPDB Feed',
      module: 'sfp_abuseipdb',
      evidence: 'Confidence of Abuse: 84% based on 126 user reports (SSH brute force)',
      score: '84% Confidence',
      color: '#F59E0B',
    },
    {
      name: 'Shodan Intelligence',
      module: 'sfp_shodan',
      evidence: 'Port 22 & 3389 open with outdated OpenSSH 7.4p1 (CVE-2018-15473)',
      score: 'CVE-2018-15473',
      color: '#4F8FF7',
    },
  ];

  return (
    <section className="relative w-full max-w-[1200px] mx-auto px-6 mt-20 sm:mt-28 overflow-visible select-none">
      {/* Header */}
      <div className="flex flex-col items-center text-center max-w-[800px] mx-auto mb-12">
        <div className="inline-flex items-center gap-2 border border-[#0B0B14] rounded-full px-3.5 py-1 mb-4 bg-transparent">
          <span className="font-sans text-[12px] font-medium tracking-[0.06em] uppercase text-[#0B0B14]">
            CORRELATION ENGINE
          </span>
        </div>
        <h2 className="font-headline font-semibold text-[32px] sm:text-[44px] text-[#0B0B14] tracking-[-0.03em] leading-tight">
          Multi-Source Consensus &amp; Risk Rating
        </h2>
        <p className="mt-3 font-sans text-[16px] text-[#555555]">
          SpiderFoot correlation rules combine independent findings from threat feeds, blacklists, and port scans into high-confidence incidents.
        </p>

        {/* Severity Legend */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-6">
          {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((sev) => (
            <button
              key={sev}
              type="button"
              onClick={() => setSelectedSeverity(sev)}
              className={`px-3 py-1 rounded-full text-[12px] font-mono font-semibold transition-all cursor-pointer ${
                selectedSeverity === sev
                  ? sev === 'CRITICAL'
                    ? 'bg-[#EF4444] text-white shadow-md'
                    : sev === 'HIGH'
                    ? 'bg-[#F97316] text-white shadow-md'
                    : sev === 'MEDIUM'
                    ? 'bg-[#F59E0B] text-white shadow-md'
                    : 'bg-[#10B981] text-white shadow-md'
                  : 'bg-[#F5F5F7] text-gray-600 hover:bg-[#EBEBEF]'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Correlation Board Container */}
      <div className="w-full bg-[#0B0F19] rounded-[24px] border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.3)] p-6 sm:p-9 text-white">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: 3 Source Modules */}
          <div className="lg:col-span-5 space-y-4">
            <span className="text-[12px] font-mono uppercase tracking-wider text-gray-400 block mb-2">
              1. Independent Threat Data Sources
            </span>

            {sources.map((src, idx) => (
              <motion.div
                key={src.name}
                initial={{ opacity: 0, x: prefersReduced ? 0 : -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="p-4 sm:p-5 rounded-2xl bg-[#141824] border border-white/[0.08] hover:border-[#4F8FF7]/40 transition-colors relative"
              >
                <div className="flex items-center justify-between">
                  <span className="font-headline font-semibold text-[16px] text-white">
                    {src.name}
                  </span>
                  <span className="text-[11px] font-mono text-[#4F8FF7] bg-[#4F8FF7]/15 px-2 py-0.5 rounded">
                    {src.module}.py
                  </span>
                </div>
                <p className="mt-2 text-[13px] text-gray-300 font-sans leading-relaxed">
                  {src.evidence}
                </p>
                <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono text-gray-400">
                  <span>Score indicator</span>
                  <span className="font-semibold text-white">{src.score}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Center Connector Indicator */}
          <div className="lg:col-span-2 hidden lg:flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-[#4F8FF7]/20 border border-[#4F8FF7] text-[#4F8FF7] flex items-center justify-center font-bold">
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400 mt-2 block">
              CORRELATION RULE
            </span>
            <span className="text-[10px] font-mono text-[#38BDF8] mt-0.5">
              SF_CORR_084
            </span>
          </div>

          {/* Right Column: Correlated Finding Incident Card */}
          <div className="lg:col-span-5 bg-[#141824] p-6 sm:p-7 rounded-2xl border-2 border-[#F97316]/50 shadow-[0_0_30px_rgba(249,115,22,0.15)] relative">
            {/* Top Badge */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#F97316]" />
                <span className="font-headline font-semibold text-[17px] text-white">
                  Correlated Security Finding
                </span>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#F97316] text-white font-mono text-[12px] font-bold tracking-wider">
                {selectedSeverity}
              </span>
            </div>

            {/* Asset Target */}
            <div className="mt-5 space-y-4 text-[13px] font-mono">
              <div>
                <span className="text-[11px] text-gray-400 uppercase tracking-wider block">
                  Identified Asset
                </span>
                <span className="text-[16px] text-white font-bold block mt-0.5">
                  vpn.target.com (198.51.100.44)
                </span>
              </div>

              <div>
                <span className="text-[11px] text-gray-400 uppercase tracking-wider block">
                  Correlation Summary
                </span>
                <p className="font-sans text-[14px] text-gray-200 mt-1 leading-relaxed">
                  Host confirmed active on known malicious botnet lists, reported repeatedly for brute force activity, and exposing an unpatched OpenSSH management service.
                </p>
              </div>

              <div className="pt-3 border-t border-white/[0.08]">
                <span className="text-[11px] text-gray-400 uppercase tracking-wider block">
                  Consensus Proof
                </span>
                <div className="mt-2 space-y-1.5 text-gray-300 font-sans text-[13px]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>3 independent modules confirmed risk</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>False positive check evaluated (score 0.0)</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.08]">
                <span className="text-[11px] text-gray-400 uppercase tracking-wider block">
                  Suggested Action
                </span>
                <span className="font-sans text-[13px] text-amber-300 font-medium block mt-1">
                  Restrict inbound port 22/8443 access via security group and review perimeter firewall rules immediately.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
