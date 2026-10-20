import { useState } from 'react';
import { Copy, Check, Terminal as TerminalIcon } from 'lucide-react';

export interface TerminalOutputLine {
  type: 'cmd' | 'info' | 'success' | 'warn' | 'error' | 'dim' | 'accent';
  text: string;
}

interface TerminalDemoProps {
  title?: string;
  command: string;
  outputLines: TerminalOutputLine[];
  badge?: string;
}

export const TerminalDemo = ({
  title = 'bash — 80x24',
  command,
  outputLines,
  badge = 'SCAN RUNTIME',
}: TerminalDemoProps) => {
  const [copied, setCopied] = useState(false);

  const copyCommand = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="w-full bg-[#0B0F19] rounded-[20px] border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden text-white my-6 select-none font-mono">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#141824] border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
          <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
          <span className="w-3 h-3 rounded-full bg-[#10B981]" />
          <span className="text-[12px] text-gray-400 font-mono ml-3">{title}</span>
        </div>

        <div className="flex items-center gap-3">
          {badge && (
            <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded bg-white/10 text-gray-300">
              {badge}
            </span>
          )}
          <button
            type="button"
            onClick={copyCommand}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white transition-colors text-[12px] cursor-pointer"
            aria-label="Copy terminal command"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 font-sans">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span className="font-sans">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="p-5 text-[13px] sm:text-[14px] leading-[22px] overflow-x-auto space-y-1.5">
        {/* Command line */}
        <div className="flex items-center gap-2 text-white font-semibold pb-2">
          <TerminalIcon className="w-4 h-4 text-[#4F8FF7] shrink-0" />
          <span className="text-[#4F8FF7]">$</span>
          <span className="text-[#38BDF8]">{command}</span>
        </div>

        {/* Output Stream */}
        {outputLines.map((line, idx) => {
          let colorClass = 'text-gray-300';
          if (line.type === 'cmd') colorClass = 'text-[#38BDF8]';
          if (line.type === 'info') colorClass = 'text-blue-300';
          if (line.type === 'success') colorClass = 'text-emerald-400';
          if (line.type === 'warn') colorClass = 'text-amber-400';
          if (line.type === 'error') colorClass = 'text-rose-400';
          if (line.type === 'dim') colorClass = 'text-gray-500';
          if (line.type === 'accent') colorClass = 'text-[#4F8FF7]';

          return (
            <div key={idx} className={`font-mono whitespace-pre ${colorClass}`}>
              {line.text}
            </div>
          );
        })}
      </div>
    </div>
  );
};
