import { useState } from 'react';
import { ThumbsUp, ThumbsDown, CheckCircle2 } from 'lucide-react';

export const DocsFeedback = () => {
  const [feedback, setFeedback] = useState<'yes' | 'no' | null>(null);

  return (
    <div className="my-10 p-5 rounded-2xl bg-[#F8F9FD] border border-black/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
      <div>
        <span className="font-headline font-semibold text-[15px] text-[#0B0B14] block">
          Was this documentation helpful?
        </span>
        <span className="text-[12px] text-gray-500 font-sans">
          Your feedback directly guides updates to our OSINT operational guides.
        </span>
      </div>

      {feedback ? (
        <div className="flex items-center gap-2 text-emerald-600 font-sans text-[13px] font-medium bg-emerald-50 px-4 py-2 rounded-xl">
          <CheckCircle2 className="w-4 h-4" />
          <span>Thank you for your feedback!</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFeedback('yes')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-black/[0.08] hover:border-[#4F8FF7] text-[#0B0B14] hover:text-[#4F8FF7] text-[13px] font-sans font-medium transition-all shadow-sm cursor-pointer"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>Yes</span>
          </button>
          <button
            type="button"
            onClick={() => setFeedback('no')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-black/[0.08] hover:border-rose-400 text-[#0B0B14] hover:text-rose-600 text-[13px] font-sans font-medium transition-all shadow-sm cursor-pointer"
          >
            <ThumbsDown className="w-3.5 h-3.5" />
            <span>No</span>
          </button>
        </div>
      )}
    </div>
  );
};
