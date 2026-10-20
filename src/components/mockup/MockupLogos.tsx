interface MockupLogosProps {
  opacity?: string;
  className?: string;
}

export const MockupLogos = ({
  opacity = 'opacity-70',
  className = '',
}: MockupLogosProps) => {
  return (
    <div className={`flex items-center justify-between gap-3 select-none text-[#0B0B14] ${opacity} ${className}`}>
      {/* Shodan */}
      <div className="flex items-center gap-1">
        <span className="text-[9px] font-bold tracking-tight bg-red-600 text-white px-1 py-0.2 rounded-xs">S</span>
        <span className="text-[11px] font-bold tracking-tight">Shodan</span>
      </div>

      {/* VirusTotal */}
      <div className="flex items-center gap-1">
        <span className="text-[11px] font-semibold tracking-tight">VirusTotal</span>
      </div>

      {/* HaveIBeenPwned */}
      <div className="flex items-center gap-1">
        <span className="text-[11px] font-semibold tracking-tight">HIBP</span>
      </div>

      {/* Censys */}
      <div className="flex items-center gap-1">
        <span className="text-[11px] font-bold tracking-tight">Censys</span>
      </div>

      {/* AbuseIPDB */}
      <div className="flex items-center gap-1">
        <span className="text-[11px] font-semibold tracking-tight">AbuseIPDB</span>
      </div>
    </div>
  );
};
