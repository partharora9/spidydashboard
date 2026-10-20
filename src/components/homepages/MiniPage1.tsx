import { motion } from 'framer-motion';
import { Search, Bell, ChevronRight, BarChart3, PieChart, Users, Settings } from 'lucide-react';
import { MockupLogos } from '../mockup/MockupLogos';
import { SpidyLogo } from '../SpidyLogo';

interface MiniPage1Props {
  inView?: boolean;
}

export const MiniPage1 = ({ inView = true }: MiniPage1Props) => {
  const barHeights = [40, 65, 50, 85, 70, 95, 60, 80, 55, 90, 75, 85];
  const tableRows = [
    { name: 'example.com', role: 'Domain', date: '2 mins ago', progress: 100, avatarBg: 'bg-blue-600' },
    { name: '192.168.4.21', role: 'IPv4', date: '5 mins ago', progress: 100, avatarBg: 'bg-emerald-600' },
    { name: 'admin@company.io', role: 'Email', date: '12 mins ago', progress: 100, avatarBg: 'bg-indigo-600' },
    { name: '@darkhandle', role: 'Username', date: '18 mins ago', progress: 100, avatarBg: 'bg-amber-600' },
  ];

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
          <span>Home</span>
          <span>Features</span>
          <span>Modules</span>
          <span>Docs</span>
          <span>Pricing</span>
          <span>Contact</span>
        </div>

        <div className="flex items-center gap-5">
          <span className="text-[16px] font-medium text-[#0B0B14]">Log in</span>
          <span className="bg-[#4F8FF7] text-white text-[16px] font-semibold px-6 py-2.5 rounded-full shadow-[0_4px_14px_rgba(79,143,247,0.35)]">
            Start scan
          </span>
        </div>
      </motion.div>

      {/* 2. Centered Hero Header */}
      <div className="text-center pt-14 pb-8 flex flex-col items-center">
        <motion.span
          initial={{ scale: 0.8, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[13px] font-semibold tracking-wider text-blue-600 uppercase mb-4"
        >
          OSINT AUTOMATION PLATFORM
        </motion.span>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="font-headline text-[48px] font-semibold leading-[1.12] text-[#0B0B14] max-w-[760px] tracking-[-0.03em]"
        >
          Map your attack surface before attackers do
        </motion.h1>

        <motion.p
          initial={{ y: 15, opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : { y: 15, opacity: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="text-[18px] text-[#111111]/80 max-w-[620px] mt-4 leading-relaxed font-normal"
        >
          SpidyDashboard automates reconnaissance across 200+ data sources, so you can find exposed assets, leaked data and hidden risks in minutes.
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
            View live demo
            <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>

      {/* 3. Blue Gradient Glow Band behind Dashboard */}
      <div className="relative mt-8 max-w-[1020px] mx-auto">
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[850px] h-[400px] bg-gradient-to-b from-[#CFE2FF] via-[#E2EDFD]/70 to-white rounded-full blur-[60px] pointer-events-none -z-0" />

        {/* 4. OSINT Dashboard Preview */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="relative z-10 bg-white/95 backdrop-blur-md rounded-3xl border border-gray-100 shadow-[0_24px_60px_rgba(0,0,0,0.08)] p-6"
        >
          {/* Dashboard Header Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-[12px] font-bold">
                S
              </div>
              <span className="text-[17px] font-bold text-[#0B0B14]">SpidyDashboard</span>
            </div>

            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-100 text-[13px] text-gray-400 w-[280px]">
              <Search className="w-4 h-4" />
              <span>Search target (domain, IP, email)...</span>
            </div>

            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-400" />
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center text-[12px] font-semibold">
                P
              </div>
            </div>
          </div>

          {/* Main Dashboard Layout */}
          <div className="flex gap-6">
            {/* Sidebar icons */}
            <div className="w-12 flex flex-col items-center gap-5 py-3 border-r border-gray-100 text-gray-400">
              <div className="relative p-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-blue-500" />
              </div>
              <div className="p-2">
                <PieChart className="w-5 h-5" />
              </div>
              <div className="p-2">
                <Users className="w-5 h-5" />
              </div>
              <div className="p-2 mt-auto">
                <Settings className="w-5 h-5" />
              </div>
            </div>

            {/* Content area */}
            <div className="flex-1 flex flex-col gap-5">
              {/* 3 Stat blocks */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-gray-100">
                  <span className="text-[13px] text-gray-400 block font-medium">Assets found</span>
                  <span className="text-[22px] font-bold text-[#0B0B14] block mt-1">12,480</span>
                  <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-1">
                    +18% this week
                  </span>
                </div>

                <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-gray-100">
                  <span className="text-[13px] text-gray-400 block font-medium">Risks detected</span>
                  <span className="text-[22px] font-bold text-rose-600 block mt-1">342</span>
                  <span className="text-[11px] text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded-md inline-block mt-1">
                    42 critical
                  </span>
                </div>

                <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-gray-100">
                  <span className="text-[13px] text-gray-400 block font-medium">Modules run</span>
                  <span className="text-[22px] font-bold text-blue-600 block mt-1">218</span>
                  <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-1">
                    Active
                  </span>
                </div>
              </div>

              {/* Risk score gauge & Scan activity bar chart */}
              <div className="grid grid-cols-2 gap-4">
                {/* Risk score 75% Gauge */}
                <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-gray-100 flex flex-col items-center justify-center">
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="text-[14px] font-bold text-[#0B0B14]">Risk score 75%</span>
                    <span className="text-[12px] text-gray-400">High / Low</span>
                  </div>

                  <div className="relative my-2">
                    <svg width="150" height="85" viewBox="0 0 150 85">
                      <path
                        d="M 12 75 A 62 62 0 0 1 138 75"
                        fill="none"
                        stroke="#E2E8F0"
                        strokeWidth="12"
                        strokeLinecap="round"
                      />
                      <motion.path
                        d="M 12 75 A 62 62 0 0 1 138 75"
                        fill="none"
                        stroke="#EF4444"
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray="194.8"
                        initial={{ strokeDashoffset: 194.8 }}
                        animate={inView ? { strokeDashoffset: 48.7 } : { strokeDashoffset: 194.8 }}
                        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] as const }}
                      />
                    </svg>
                    <div className="absolute bottom-2 inset-x-0 text-center">
                      <span className="text-[20px] font-bold text-[#0B0B14] block">75%</span>
                      <span className="text-[10px] text-gray-400 block">High exposure</span>
                    </div>
                  </div>
                </div>

                {/* Scan activity Bar Chart */}
                <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-gray-100 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-bold text-[#0B0B14]">Scan activity</span>
                    <span className="text-[12px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                      Live
                    </span>
                  </div>

                  <div className="flex items-end justify-between gap-2 h-20 pt-4">
                    {barHeights.map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={inView ? { height: `${h}%` } : { height: 0 }}
                        transition={{
                          delay: 0.6 + i * 0.04,
                          duration: 0.6,
                          ease: [0.22, 1, 0.36, 1] as const,
                        }}
                        className={`flex-1 rounded-t-sm ${
                          i === 5 || i === 9 ? 'bg-blue-600' : 'bg-blue-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Scans Table */}
              <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-gray-100">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-200/60 text-[12px] font-semibold text-gray-400">
                  <span>Recent scans</span>
                  <span>Status</span>
                </div>

                <div className="space-y-2">
                  {tableRows.map((row, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 8 }}
                      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                      transition={{ delay: 0.7 + idx * 0.1, duration: 0.4 }}
                      className="flex items-center justify-between text-[12px] bg-white p-2.5 rounded-xl border border-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full ${row.avatarBg} text-white flex items-center justify-center font-bold text-[10px]`}
                        >
                          {row.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-gray-800 font-mono">{row.name}</span>
                        <span className="bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 rounded-full font-medium">
                          {row.role}
                        </span>
                        <span className="text-gray-400 text-[11px]">{row.date}</span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={inView ? { width: `${row.progress}%` } : { width: 0 }}
                            transition={{ delay: 0.8 + idx * 0.08, duration: 0.7 }}
                            className="h-full bg-blue-500 rounded-full"
                          />
                        </div>
                        <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                          Completed
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 5. Below Dashboard: Trusted Logos and Cutoff Title */}
      <div className="pt-14 text-center max-w-[900px] mx-auto">
        <p className="text-[14px] text-gray-400 font-medium mb-4">
          Integrated with 200+ intelligence sources and tools
        </p>

        <MockupLogos opacity="opacity-75" className="w-full px-4" />

        <h3 className="font-headline text-[32px] font-semibold text-[#0B0B14] leading-tight mt-10">
          Cyber intelligence that works for you.
        </h3>
      </div>
    </div>
  );
};
