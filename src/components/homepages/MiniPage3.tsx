import { motion } from 'framer-motion';
import { ChevronRight, ShieldCheck, Star, Check } from 'lucide-react';
import { MockupLogos } from '../mockup/MockupLogos';
import { SpidyLogo } from '../SpidyLogo';

interface MiniPage3Props {
  inView?: boolean;
}

export const MiniPage3 = ({ inView = true }: MiniPage3Props) => {
  return (
    <div className="w-[1200px] min-h-[1600px] bg-white text-[#0B0B14] p-12 font-sans select-none relative overflow-hidden">
      {/* 1. Mini Navbar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between pb-6 border-b border-gray-100"
      >
        <div>
          <SpidyLogo size={24} withWordmark wordmarkSize={20} animateEntrance={false} interactive={false} />
        </div>

        <div className="flex items-center gap-8 text-[16px] font-medium text-[#111111]">
          <span>Features</span>
          <span>Modules</span>
          <span>Docs</span>
          <span>Reports</span>
          <span>Contact</span>
        </div>

        <div className="flex items-center gap-5">
          <span className="text-[16px] font-medium text-[#0B0B14]">Log in</span>
          <span className="bg-[#4F8FF7] text-white text-[16px] font-semibold px-6 py-2.5 rounded-full shadow-[0_4px_14px_rgba(79,143,247,0.35)]">
            Start scan
          </span>
        </div>
      </motion.div>

      {/* 2. Split Hero Section */}
      <div className="grid grid-cols-2 gap-12 pt-14 pb-12 items-center">
        {/* Left Column: Heading, Subtext, Buttons, Social proof */}
        <div className="flex flex-col">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={inView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="font-headline text-[48px] font-semibold leading-[1.12] text-[#0B0B14] tracking-[-0.03em]"
          >
            Discover every digital
            <br />
            footprint around
            <br />
            your target
          </motion.h1>

          <motion.p
            initial={{ y: 15, opacity: 0 }}
            animate={inView ? { y: 0, opacity: 1 } : { y: 15, opacity: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="text-[18px] text-[#111111]/80 mt-5 leading-relaxed font-normal max-w-[460px]"
          >
            Scan domains, IPs, emails, usernames and phone numbers with one click. Every module runs automatically and reports back in real time.
          </motion.p>

          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={inView ? { y: 0, opacity: 1 } : { y: 15, opacity: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex items-center gap-4 mt-8"
          >
            <button className="bg-gradient-to-b from-[#5B9BFA] to-[#3B7FF0] text-white text-[16px] font-medium px-8 py-3.5 rounded-full shadow-[0_8px_20px_rgba(59,127,240,0.35)]">
              Start free scan
            </button>
            <button className="text-[#0B0B14] text-[16px] font-medium flex items-center gap-1.5 px-4 py-3.5">
              Read the docs
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex items-center gap-3 mt-8"
          >
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 bg-[#00B67A] rounded-sm flex items-center justify-center text-white">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <span className="text-[14px] font-bold text-[#0B0B14]">4.9</span>
            </div>

            <div className="flex items-center gap-0.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-[#0B0B14] text-[#0B0B14]" />
              ))}
            </div>

            <span className="text-[14px] text-gray-500 font-medium">546 security teams</span>
          </motion.div>
        </div>

        {/* Right Column: Floating Scan results + Active Recon modules */}
        <div className="relative flex flex-col gap-6 items-end">
          {/* 1. Floating Scan results Card */}
          <motion.div
            initial={{ x: 40, opacity: 0 }}
            animate={inView ? { x: 0, opacity: 1 } : { x: 40, opacity: 0 }}
            transition={{ delay: 0.45, type: 'spring', stiffness: 90, damping: 18 }}
            className="w-[380px] bg-white rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-gray-400">Scan results</span>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                +18% this week
              </span>
            </div>

            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-[28px] font-bold text-[#0B0B14]">1,284 findings</span>
              <span className="text-[12px] text-gray-400">200+ sources</span>
            </div>

            {/* Blue bar chart inside card */}
            <div className="mt-4 flex items-end justify-between gap-2 h-20 pt-2 border-t border-gray-100">
              {[35, 50, 75, 45, 90, 60, 80, 100].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <div
                    style={{ height: `${h}%` }}
                    className={`w-full rounded-t-md ${
                      i === 4 ? 'bg-blue-600' : 'bg-blue-300'
                    }`}
                  />
                  <span className="text-[9px] text-gray-400">0{i + 1}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* 2. Active Recon Modules Card */}
          <motion.div
            initial={{ x: 40, opacity: 0 }}
            animate={inView ? { x: 0, opacity: 1 } : { x: 40, opacity: 0 }}
            transition={{ delay: 0.6, type: 'spring', stiffness: 90, damping: 18 }}
            className="w-[360px] bg-white rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-gray-100 -mt-2 mr-6"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="text-[14px] font-bold text-[#0B0B14]">Active Recon Modules</span>
              <span className="text-[11px] text-gray-400">Live</span>
            </div>

            <div className="space-y-3 mt-3">
              <div className="flex items-center justify-between text-[13px] bg-gray-50 p-2.5 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-md bg-blue-600 flex items-center justify-center text-white">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span className="font-medium text-gray-800">Shodan Host Lookup</span>
                </div>
                <span className="font-bold text-emerald-600">42 hosts</span>
              </div>

              <div className="flex items-center justify-between text-[13px] bg-gray-50 p-2.5 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-md bg-blue-600 flex items-center justify-center text-white">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span className="font-medium text-gray-800">DNS Subdomain Brute</span>
                </div>
                <span className="font-bold text-emerald-600">118 subs</span>
              </div>

              <div className="flex items-center justify-between text-[13px] bg-gray-50 p-2.5 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-md bg-blue-600 flex items-center justify-center text-white">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span className="font-medium text-gray-800">HIBP Breach Correlation</span>
                </div>
                <span className="font-bold text-rose-600">14 leaks</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 3. Below Hero: Trusted Logos and Centered Heading */}
      <div className="pt-14 text-center max-w-[960px] mx-auto">
        <p className="text-[14px] text-gray-400 font-medium mb-4">
          Integrated with 200+ intelligence sources and tools
        </p>

        <MockupLogos opacity="opacity-75" className="w-full px-4" />

        <h3 className="font-headline text-[32px] font-semibold text-[#0B0B14] leading-tight mt-10">
          Reconnaissance that handles it all.
        </h3>

        {/* 4. OSINT Intelligence Engine Card */}
        <div className="mt-8 bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-white rounded-3xl p-8 border border-blue-100/60 shadow-[0_16px_40px_rgba(0,0,0,0.04)] flex items-center justify-between gap-8 text-left">
          <div className="max-w-[420px]">
            <span className="text-[12px] font-bold text-blue-600 uppercase tracking-wider block mb-2">
              Integrated OSINT
            </span>
            <h4 className="font-headline text-[24px] font-semibold text-[#0B0B14]">
              Spidy Intelligence Engine
            </h4>
            <p className="text-[14px] text-gray-600 mt-2 leading-relaxed">
              Correlates findings across all 200+ active modules to deliver a comprehensive attack surface report.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button className="bg-[#0B0B14] text-white text-[14px] font-medium px-6 py-3 rounded-full hover:bg-black transition-colors">
              Explore modules
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
