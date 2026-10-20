import { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  highlightLines?: number[];
  showLineNumbers?: boolean;
}

export const CodeBlock = ({
  code,
  language = 'python',
  filename,
  highlightLines = [],
  showLineNumbers = true,
}: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const lines = code.trimEnd().split('\n');

  return (
    <div className="w-full bg-[#0B0F19] rounded-[18px] border border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.25)] overflow-hidden my-4 text-white">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#141824] border-b border-white/[0.08] text-[12px] font-mono select-none">
        <div className="flex items-center gap-2 text-gray-300">
          <Terminal className="w-3.5 h-3.5 text-[#4F8FF7]" />
          <span>{filename || `${language}`}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="uppercase text-[10px] tracking-wider font-semibold px-2 py-0.5 rounded bg-white/10 text-gray-300">
            {language}
          </span>
          <button
            type="button"
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Copy code to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-sans">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="font-sans">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Area */}
      <div className="p-4 overflow-x-auto text-[13px] sm:text-[14px] font-mono leading-[22px]">
        <table className="w-full">
          <tbody>
            {lines.map((line, index) => {
              const lineNum = index + 1;
              const isHighlighted = highlightLines.includes(lineNum);

              return (
                <tr
                  key={lineNum}
                  className={isHighlighted ? 'bg-[#4F8FF7]/15 border-l-2 border-[#4F8FF7]' : ''}
                >
                  {showLineNumbers && (
                    <td className="table-cell select-none pr-4 text-right text-gray-600 text-[12px] w-8">
                      {lineNum}
                    </td>
                  )}
                  <td className="table-cell whitespace-pre font-mono text-[#E2E8F0]">
                    {line}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
