import { type ReactNode } from 'react';
import { AlertTriangle, ShieldAlert, Info } from 'lucide-react';

export type CalloutType = 'note' | 'warning' | 'authorized';

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: ReactNode;
}

export const Callout = ({ type = 'note', title, children }: CalloutProps) => {
  if (type === 'authorized') {
    return (
      <div className="my-6 p-5 sm:p-6 rounded-[18px] bg-[#F0FDF4] border border-[#10B981]/30 text-[#14532D] shadow-sm select-none">
        <div className="flex items-start gap-3.5">
          <div className="p-1.5 rounded-lg bg-[#10B981]/20 text-[#10B981] mt-0.5 shrink-0">
            <ShieldAlert className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h4 className="font-headline font-semibold text-[16px] text-[#064E3B] leading-tight">
              {title || 'Authorized & Legal Scanning Notice'}
            </h4>
            <div className="mt-2 text-[14px] sm:text-[15px] leading-[24px] text-[#166534] font-sans">
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'warning') {
    return (
      <div className="my-6 p-5 sm:p-6 rounded-[18px] bg-[#FFFBEB] border border-[#F59E0B]/35 text-[#78350F] shadow-sm select-none">
        <div className="flex items-start gap-3.5">
          <div className="p-1.5 rounded-lg bg-[#F59E0B]/20 text-[#D97706] mt-0.5 shrink-0">
            <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h4 className="font-headline font-semibold text-[16px] text-[#92400E] leading-tight">
              {title || 'Important Security Caution'}
            </h4>
            <div className="mt-2 text-[14px] sm:text-[15px] leading-[24px] text-[#78350F] font-sans">
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default: note
  return (
    <div className="my-6 p-5 sm:p-6 rounded-[18px] bg-[#F2F4FD] border border-[#4F8FF7]/30 text-[#1E293B] shadow-sm select-none">
      <div className="flex items-start gap-3.5">
        <div className="p-1.5 rounded-lg bg-[#4F8FF7]/15 text-[#4F8FF7] mt-0.5 shrink-0">
          <Info className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <h4 className="font-headline font-semibold text-[16px] text-[#0B0B14] leading-tight">
            {title || 'Technical Note'}
          </h4>
          <div className="mt-2 text-[14px] sm:text-[15px] leading-[24px] text-[#334155] font-sans">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
