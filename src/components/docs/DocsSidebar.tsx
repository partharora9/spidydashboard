import { BookOpen } from 'lucide-react';

export interface NavSection {
  title: string;
  items: {
    id: string;
    label: string;
  }[];
}

interface DocsSidebarProps {
  sections: NavSection[];
  activeId: string;
  onSelect: (id: string) => void;
  docTitle?: string;
}

export const DocsSidebar = ({
  sections,
  activeId,
  onSelect,
  docTitle = 'Documentation',
}: DocsSidebarProps) => {
  return (
    <aside className="w-full lg:w-[260px] shrink-0 select-none">
      <div className="sticky top-28 bg-white rounded-2xl border border-black/[0.06] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-2 pb-4 mb-4 border-b border-black/[0.06]">
          <BookOpen className="w-4 h-4 text-[#4F8FF7]" />
          <span className="font-headline font-semibold text-[14px] text-[#0B0B14]">
            {docTitle}
          </span>
        </div>

        <nav className="space-y-6 text-[13px] font-sans">
          {sections.map((sec) => (
            <div key={sec.title}>
              <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400 font-semibold block mb-2 px-2">
                {sec.title}
              </span>
              <ul className="space-y-1">
                {sec.items.map((item) => {
                  const isActive = activeId === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => onSelect(item.id)}
                        className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                          isActive
                            ? 'bg-[#F2F4FD] text-[#4F8FF7] font-semibold'
                            : 'text-[#555555] hover:text-[#0B0B14] hover:bg-gray-50'
                        }`}
                      >
                        <span>{item.label}</span>
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#4F8FF7]" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
};
