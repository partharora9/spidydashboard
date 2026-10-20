import { useState, useEffect } from 'react';
import { CheckSquare, Square } from 'lucide-react';

interface ChecklistItem {
  id: string;
  label: string;
}

interface DocsChecklistProps {
  storageKey: string;
  title?: string;
  items: ChecklistItem[];
}

export const DocsChecklist = ({
  storageKey,
  title = 'Your Recon Deployment Checklist',
  items,
}: DocsChecklistProps) => {
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`spidy_docs_${storageKey}`);
      if (saved) {
        setCompleted(JSON.parse(saved));
      }
    } catch {
      // Ignore
    }
  }, [storageKey]);

  const toggleItem = (id: string) => {
    setCompleted((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(`spidy_docs_${storageKey}`, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  const completedCount = items.filter((it) => completed[it.id]).length;
  const progressPercent = Math.round((completedCount / items.length) * 100);

  return (
    <div className="my-8 p-6 rounded-[22px] bg-white border border-black/[0.08] shadow-[0_8px_30px_rgba(20,30,60,0.05)] select-none">
      <div className="flex items-center justify-between pb-4 border-b border-black/[0.06]">
        <div>
          <h4 className="font-headline font-semibold text-[17px] text-[#0B0B14]">
            {title}
          </h4>
          <span className="text-[12px] text-gray-500 font-sans">
            {completedCount} of {items.length} steps completed
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[13px] font-mono font-bold text-[#4F8FF7]">
            {progressPercent}%
          </span>
          <div className="w-16 h-2 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full bg-[#4F8FF7] rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        {items.map((it) => {
          const isDone = Boolean(completed[it.id]);
          return (
            <button
              key={it.id}
              type="button"
              onClick={() => toggleItem(it.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all cursor-pointer ${
                isDone
                  ? 'bg-[#F0FDF4] text-[#166534] border border-[#10B981]/20'
                  : 'bg-[#F8F9FD] text-[#334155] border border-black/[0.04] hover:bg-gray-100'
              }`}
            >
              {isDone ? (
                <CheckSquare className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <Square className="w-5 h-5 text-gray-400 shrink-0" />
              )}
              <span className={`text-[14px] font-sans ${isDone ? 'line-through text-gray-400' : ''}`}>
                {it.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
