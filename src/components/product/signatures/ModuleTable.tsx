import { useState, useMemo } from 'react';
import { Search, Key, Shield, ExternalLink, Filter, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { modulesList, ALL_CATEGORIES, TOTAL_MODULES_COUNT, KEY_REQUIRED_COUNT, FREE_MODULES_COUNT } from '../../../data/modulesData';

interface HighlightProps {
  text: string;
  query: string;
}

const Highlight = ({ text, query }: HighlightProps) => {
  if (!query.trim()) return <span>{text}</span>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-[#4F8FF7]/25 text-[#4F8FF7] px-0.5 rounded font-semibold">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
};

export const ModuleTable = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [keyFilter, setKeyFilter] = useState<'ALL' | 'FREE' | 'KEY_REQUIRED'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Filtered dataset
  const filtered = useMemo(() => {
    return modulesList.filter((m) => {
      // Category filter
      if (selectedCategory !== 'ALL' && !m.categories.includes(selectedCategory)) {
        return false;
      }

      // Key filter
      if (keyFilter === 'FREE' && m.needsKey) return false;
      if (keyFilter === 'KEY_REQUIRED' && !m.needsKey) return false;

      // Text query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = m.name.toLowerCase().includes(q);
        const matchesId = m.id.toLowerCase().includes(q);
        const matchesDesc = m.description.toLowerCase().includes(q);
        const matchesCat = m.categories.some((c) => c.toLowerCase().includes(q));
        if (!matchesName && !matchesId && !matchesDesc && !matchesCat) return false;
      }

      return true;
    });
  }, [searchQuery, selectedCategory, keyFilter]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const pagedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const handleKeyFilterChange = (val: 'ALL' | 'FREE' | 'KEY_REQUIRED') => {
    setKeyFilter(val);
    setCurrentPage(1);
  };

  return (
    <section className="relative w-full max-w-[1240px] mx-auto px-6 mt-16 sm:mt-24 overflow-visible select-none">
      {/* Top Controls: Search + Key Filters */}
      <div className="bg-white rounded-[24px] border border-black/[0.08] shadow-[0_10px_35px_rgba(20,30,60,0.06)] p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search 233 modules by name, keyword, or data source..."
              className="w-full h-12 pl-12 pr-4 rounded-xl bg-[#F5F5F7] text-[#0B0B14] placeholder-gray-400 text-[15px] font-sans outline-none focus:ring-2 focus:ring-[#4F8FF7]/40 border border-transparent focus:border-[#4F8FF7] transition-all"
            />
          </div>

          {/* Key Requirement Filter Segment */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#F5F5F7] border border-black/[0.04]">
            <button
              type="button"
              onClick={() => handleKeyFilterChange('ALL')}
              className={`px-3.5 py-2 rounded-lg font-sans text-[13px] font-medium transition-all cursor-pointer ${
                keyFilter === 'ALL'
                  ? 'bg-white text-[#4F8FF7] shadow-sm'
                  : 'text-[#555555] hover:text-[#0B0B14]'
              }`}
            >
              All ({TOTAL_MODULES_COUNT})
            </button>
            <button
              type="button"
              onClick={() => handleKeyFilterChange('FREE')}
              className={`px-3.5 py-2 rounded-lg font-sans text-[13px] font-medium transition-all cursor-pointer ${
                keyFilter === 'FREE'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-[#555555] hover:text-[#0B0B14]'
              }`}
            >
              Free / No Key ({FREE_MODULES_COUNT})
            </button>
            <button
              type="button"
              onClick={() => handleKeyFilterChange('KEY_REQUIRED')}
              className={`px-3.5 py-2 rounded-lg font-sans text-[13px] font-medium transition-all cursor-pointer ${
                keyFilter === 'KEY_REQUIRED'
                  ? 'bg-white text-amber-600 shadow-sm'
                  : 'text-[#555555] hover:text-[#0B0B14]'
              }`}
            >
              Key Required ({KEY_REQUIRED_COUNT})
            </button>
          </div>
        </div>

        {/* Category Pills Strip */}
        <div className="mt-6 pt-5 border-t border-black/[0.06] flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          <button
            type="button"
            onClick={() => handleCategoryChange('ALL')}
            className={`px-3 py-1.5 rounded-full text-[12px] font-sans font-medium whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-[#0B0B14] text-white shadow-sm'
                : 'bg-[#F5F5F7] text-gray-600 hover:bg-[#EBEBEF]'
            }`}
          >
            All Categories
          </button>
          {ALL_CATEGORIES.map((cat) => {
            const count = modulesList.filter((m) => m.categories.includes(cat)).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryChange(cat)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-sans font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#4F8FF7] text-white shadow-sm'
                    : 'bg-[#F5F5F7] text-gray-600 hover:bg-[#EBEBEF]'
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20' : 'bg-black/10'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Free API Key Note */}
      <div className="mt-4 px-4 py-2.5 rounded-xl bg-[#F2F4FD] border border-[#4F8FF7]/20 flex items-center gap-2 text-[13px] text-[#334155] font-sans">
        <CheckCircle2 className="w-4 h-4 text-[#4F8FF7] shrink-0" />
        <span>
          <strong>Pro-Tip:</strong> Over 149 modules require no authentication at all. For key-required modules (like Shodan &amp; VirusTotal), free community API tiers can be entered via the UI or <code>optsraw</code> endpoint.
        </span>
      </div>

      {/* Modules Table List */}
      <div className="mt-6 bg-white rounded-[24px] border border-black/[0.08] shadow-[0_10px_35px_rgba(20,30,60,0.06)] overflow-hidden">
        {pagedItems.length === 0 ? (
          <div className="p-12 text-center">
            <Filter className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h4 className="font-headline font-semibold text-[18px] text-[#0B0B14]">
              No modules matched your filter
            </h4>
            <p className="mt-1 text-[14px] text-gray-500 font-sans">
              Try adjusting your search terms or clearing the category and key filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
                setKeyFilter('ALL');
              }}
              className="mt-4 px-4 py-2 rounded-full bg-[#4F8FF7] text-white text-[13px] font-medium"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8F9FD] border-b border-black/[0.06] text-[12px] font-mono uppercase tracking-wider text-gray-500">
                  <th className="py-4 px-6">Module Name</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Data Source / URL</th>
                  <th className="py-4 px-6 text-center">API Key Required</th>
                  <th className="py-4 px-6 text-right">Module File</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] text-[14px] font-sans">
                {pagedItems.map((m) => (
                  <tr key={m.id} className="hover:bg-[#F8F9FD]/60 transition-colors">
                    {/* Module Name + Description */}
                    <td className="py-4 px-6 max-w-[320px]">
                      <div className="flex items-center gap-2">
                        <span className="font-headline font-semibold text-[15px] text-[#0B0B14]">
                          <Highlight text={m.name} query={searchQuery} />
                        </span>
                        {m.isPopular && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[10px] font-semibold">
                            POPULAR
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-[13px] text-gray-500 line-clamp-2 leading-relaxed">
                        <Highlight text={m.description} query={searchQuery} />
                      </p>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full bg-[#F5F5F7] text-[#0B0B14] text-[12px] font-medium">
                        {m.category}
                      </span>
                    </td>

                    {/* Base URL */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      {m.baseUrl ? (
                        <a
                          href={m.baseUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#4F8FF7] hover:underline font-mono text-[13px]"
                        >
                          <span>{m.baseUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '')}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-gray-400 font-mono text-[12px]">Internal / Engine</span>
                      )}
                    </td>

                    {/* Key Requirement */}
                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      {m.needsKey ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-mono font-medium">
                          <Key className="w-3 h-3 text-amber-600" />
                          <span>Key Required</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-mono font-medium">
                          <Shield className="w-3 h-3 text-emerald-600" />
                          <span>Free / Public</span>
                        </span>
                      )}
                    </td>

                    {/* Module File */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <code className="px-2 py-1 rounded bg-[#0B0F19] text-[#38BDF8] font-mono text-[12px]">
                        {m.id}.py
                      </code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#F8F9FD] border-t border-black/[0.06] text-[13px] text-gray-500 font-sans">
          <span>
            Showing <strong>{(currentPage - 1) * pageSize + 1}</strong> to{' '}
            <strong>{Math.min(currentPage * pageSize, filtered.length)}</strong> of{' '}
            <strong>{filtered.length}</strong> modules
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="p-1.5 rounded-lg border border-black/[0.08] bg-white text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 cursor-pointer"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-[12px] px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="p-1.5 rounded-lg border border-black/[0.08] bg-white text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 cursor-pointer"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
