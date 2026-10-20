import { List } from 'lucide-react';

export interface TocItem {
  id: string;
  label: string;
}

interface DocsTableOfContentsProps {
  items: TocItem[];
  activeId?: string;
  onSelect: (id: string) => void;
}

export const DocsTableOfContents = ({
  items,
  activeId,
  onSelect,
}: DocsTableOfContentsProps) => {
  return (
    <div className="hidden xl:block w-[220px] shrink-0 select-none">
      <div className="sticky top-28 p-4 rounded-2xl bg-[#F8F9FD] border border-black/[0.04]">
        <div className="flex items-center gap-2 text-[12px] font-mono uppercase tracking-wider text-gray-500 mb-3 pb-2 border-b border-black/[0.06]">
          <List className="w-3.5 h-3.5 text-[#4F8FF7]" />
          <span>On this page</span>
        </div>

        <ul className="space-y-1.5 text-[12px] font-sans">
          {items.map((it) => {
            const isActive = activeId === it.id;
            return (
              <li key={it.id}>
                <button
                  type="button"
                  onClick={() => onSelect(it.id)}
                  className={`w-full text-left transition-colors cursor-pointer py-1 ${
                    isActive
                      ? 'text-[#4F8FF7] font-semibold pl-2 border-l-2 border-[#4F8FF7]'
                      : 'text-gray-500 hover:text-[#0B0B14]'
                  }`}
                >
                  {it.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
