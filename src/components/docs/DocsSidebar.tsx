import { useState } from 'react';
import { BookOpen, ChevronDown } from 'lucide-react';

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
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  // Find active label
  const activeItem = sections
    .flatMap((s) => s.items)
    .find((item) => item.id === activeId);

  const handleItemClick = (id: string) => {
    onSelect(id);
    setIsOpenMobile(false);
  };

  return (
    <aside className="w-full lg:w-[260px] shrink-0 select-none">
      {/* MOBILE STICKY ACCORDION BAR (< 1024px) */}
      <div className="lg:hidden sticky top-[72px] z-30 mb-6 bg-white/95 backdrop-blur-md rounded-xl border border-black/[0.08] shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setIsOpenMobile((prev) => !prev)}
          className="w-full min-h-[48px] px-4 py-2.5 flex items-center justify-between gap-3 text-left cursor-pointer"
        >
          <div className="flex items-center gap-2 truncate">
            <BookOpen className="w-4 h-4 text-[#4F8FF7] shrink-0" />
            <span className="text-[12px] text-gray-500 font-medium">On this page:</span>
            <span className="text-[13px] font-semibold text-[#0B0B14] truncate">
              {activeItem?.label || docTitle}
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-gray-500 shrink-0 transition-transform duration-200 ${
              isOpenMobile ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isOpenMobile && (
          <nav className="p-4 pt-2 border-t border-black/[0.06] max-h-[60vh] overflow-y-auto space-y-4 text-[13px] font-sans">
            {sections.map((sec) => (
              <div key={sec.title}>
                <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400 font-semibold block mb-1.5 px-2">
                  {sec.title}
                </span>
                <ul className="space-y-1">
                  {sec.items.map((item) => {
                    const isActive = activeId === item.id;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => handleItemClick(item.id)}
                          className={`w-full text-left px-3 min-h-[44px] rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
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
        )}
      </div>

      {/* DESKTOP SIDEBAR (>= 1024px) */}
      <div className="hidden lg:block sticky top-28 bg-white rounded-2xl border border-black/[0.06] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
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
