import React, { useState, useMemo } from 'react';
import {
  Search,
  CheckSquare,
  Square,
  LayoutGrid,
  List,
  FileText,
  Copy,
  Sparkles,
  X,
  ArrowUpDown,
  Plus,
  Minus,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronUp,
  Filter,
  Gem,
  Ticket,
  SlidersHorizontal,
  Flame
} from 'lucide-react';

export type CharacterRequirement = Record<string, number>;

export interface FilterToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  characterRequirements: CharacterRequirement;
  onAddCharacterRequirement: (charName: string) => void;
  onRemoveCharacterRequirement: (charName: string) => void;
  onClearCharacterRequirements: () => void;
  allAvailableCharacters: {
    id: string;
    name: string;
    chineseName?: string;
    img?: string;
    count: number;
    collab?: string;
    featured?: boolean;
  }[];
  // Resource filter props
  activeTab: 'characters' | 'resources';
  onChangeActiveTab: (tab: 'characters' | 'resources') => void;
  minRubies: number;
  onMinRubiesChange: (val: number) => void;
  minTickets: number;
  onMinTicketsChange: (val: number) => void;
  selectedStage: string;
  onSelectedStageChange: (stage: string) => void;
  onResetResourceFilters: () => void;
  totalResourceAccountsCount: number;

  sortBy: string;
  onChangeSortBy: (sort: string) => void;
  viewMode: 'grid' | 'table' | 'preview';
  onChangeViewMode: (mode: 'grid' | 'table' | 'preview') => void;
  isAllSelected: boolean;
  selectedCount: number;
  totalFilteredCount: number;
  onToggleSelectAll: () => void;
  onBatchCopy: () => void;
  onBatchAiCopy: () => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  searchQuery,
  onSearchChange,
  characterRequirements,
  onAddCharacterRequirement,
  onRemoveCharacterRequirement,
  onClearCharacterRequirements,
  allAvailableCharacters,
  activeTab,
  onChangeActiveTab,
  minRubies,
  onMinRubiesChange,
  minTickets,
  onMinTicketsChange,
  selectedStage,
  onSelectedStageChange,
  onResetResourceFilters,
  totalResourceAccountsCount,
  sortBy,
  onChangeSortBy,
  viewMode,
  onChangeViewMode,
  isAllSelected,
  selectedCount,
  totalFilteredCount,
  onToggleSelectAll,
  onBatchCopy,
  onBatchAiCopy,
  onClearFilters,
  hasActiveFilters,
}) => {
  const [charSearch, setCharSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'in_stock' | 'gear'>('all');
  const [isExpanded, setIsExpanded] = useState(true);

  // Filter available characters by search & category while STRICTLY maintaining original order
  const displayedCharacters = useMemo(() => {
    return allAvailableCharacters.filter((c) => {
      // 1. Search Query Filter
      if (charSearch.trim()) {
        const q = charSearch.toLowerCase().trim();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesCh = c.chineseName && c.chineseName.toLowerCase().includes(q);
        if (!matchesName && !matchesCh) return false;
      }

      // 2. Category Filter
      if (categoryFilter === 'in_stock') {
        return c.count > 0;
      }
      if (categoryFilter === 'gear') {
        const lower = c.name.toLowerCase();
        return (
          lower.startsWith('xmas') ||
          lower.startsWith('leo') ||
          lower.includes('fan') ||
          lower.includes('boot') ||
          lower.includes('bow') ||
          lower.includes('hammer') ||
          lower.includes('axe') ||
          lower.includes('shield') ||
          lower.includes('ring') ||
          lower.includes('sword') ||
          lower.includes('helm')
        );
      }

      return true;
    });
  }, [allAvailableCharacters, charSearch, categoryFilter]);

  const activeRequiredEntries = (
    Object.entries(characterRequirements) as [string, number][]
  ).filter(([, count]) => typeof count === 'number' && count > 0);

  const totalDesiredCharsCount = activeRequiredEntries.reduce(
    (sum: number, [, count]: [string, number]) => sum + count,
    0
  );

  const rubyPresets = [0, 500, 1000, 1500, 1800, 1900, 2000];
  const ticketPresets = [0, 50, 70, 80, 90, 100, 110];

  const hasActiveResourceFilters = minRubies > 0 || minTickets > 0 || Boolean(selectedStage);

  return (
    <div
      id="filter-toolbar-section"
      className="space-y-3.5 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs transition-all"
    >
      {/* Top Main Mode Switch: Characters vs Rubies & Tickets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            id="tab-characters-btn"
            onClick={() => onChangeActiveTab('characters')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'characters'
                ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>限定角色選號 (頭像圖鑑)</span>
          </button>
          <button
            type="button"
            id="tab-resources-btn"
            onClick={() => onChangeActiveTab('resources')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'resources'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-purple-700 hover:text-purple-900 hover:bg-purple-50'
            }`}
          >
            <Gem className="w-3.5 h-3.5" />
            <span>💎 紅寶石 / 轉蛋券資源號選號</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                activeTab === 'resources'
                  ? 'bg-purple-800 text-purple-100'
                  : 'bg-purple-100 text-purple-700'
              }`}
            >
              {totalResourceAccountsCount}組
            </span>
          </button>
        </div>

        {/* Mode info hint */}
        <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
          {activeTab === 'resources' ? (
            <span className="text-purple-700 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-500" />
              已進入資源號選號模式：可依紅寶石、轉蛋券數量及搭配角色精確篩選
            </span>
          ) : (
            <span>點擊角色頭像即可快速指定陣容需求數量</span>
          )}
        </div>
      </div>

      {/* Top Controls: Search, Sort, View Modes */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Main Search Bar (Account ID, code, etc.) */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="search-input"
            type="text"
            placeholder={
              activeTab === 'resources'
                ? '搜尋資源號編號、RB紅寶石數、關卡 (如: 0014114, RB1958, stage151...)'
                : '搜尋帳號編號、特定代碼 (如: 0003668, Zanka_67...)'
            }
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs transition"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort & View Mode Switches */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Sort Dropdown */}
          <div className="relative flex items-center">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => onChangeSortBy(e.target.value)}
              className="pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs cursor-pointer font-medium"
            >
              <option value="default">預設排序 (庫存順序)</option>
              <option value="rubies_desc">💎 紅寶石最多 (由多到少)</option>
              <option value="tickets_desc">🎫 轉蛋券最多 (由多到少)</option>
              <option value="id_asc">帳號編號 (由小到大)</option>
              <option value="id_desc">帳號編號 (由大到小)</option>
              <option value="chars_desc">角色數量最多</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              id="view-mode-grid"
              onClick={() => onChangeViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="卡片網格視圖"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              id="view-mode-table"
              onClick={() => onChangeViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="詳細表格視圖"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              id="view-mode-preview"
              onClick={() => onChangeViewMode('preview')}
              className={`p-1.5 rounded-lg text-xs transition ${
                viewMode === 'preview'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="文字清單預覽"
            >
              <FileText className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* DEDICATED RESOURCE ACCOUNT FILTER PANEL (When activeTab === 'resources') */}
      {activeTab === 'resources' && (
        <div className="p-4 bg-purple-50/50 border-2 border-purple-200 rounded-2xl space-y-3.5 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-100 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                <Gem className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-purple-950">
                紅寶石 & 轉蛋券數量快速篩選
              </span>
              <span className="text-[11px] text-purple-700 font-mono">
                (當前庫存資源號: {totalResourceAccountsCount} 組)
              </span>
            </div>

            {hasActiveResourceFilters && (
              <button
                type="button"
                onClick={onResetResourceFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-lg text-xs font-medium transition shadow-2xs self-start sm:self-auto"
              >
                <RotateCcw className="w-3 h-3" />
                <span>重設資源門檻</span>
              </button>
            )}
          </div>

          {/* Ruby (紅寶石) Quick Presets */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Gem className="w-3.5 h-3.5 text-purple-600" />
                <span>最低紅寶石 (Ruby):</span>
                {minRubies > 0 && (
                  <span className="text-purple-700 font-mono font-bold bg-purple-100 px-1.5 py-0.2 rounded text-[11px]">
                    ≥ {minRubies.toLocaleString()} 鑽
                  </span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {rubyPresets.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => onMinRubiesChange(val)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                    minRubies === val
                      ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300 hover:bg-purple-50/50'
                  }`}
                >
                  {val === 0 ? '不限 (全部)' : `💎 ${val.toLocaleString()}+ 鑽`}
                </button>
              ))}
              <div className="relative flex items-center ml-1">
                <input
                  type="number"
                  placeholder="自訂鑽數"
                  value={minRubies || ''}
                  onChange={(e) => onMinRubiesChange(parseInt(e.target.value, 10) || 0)}
                  className="w-24 px-2.5 py-1 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Tickets (轉蛋券) Quick Presets */}
          <div className="space-y-1.5 pt-2 border-t border-purple-100/70">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Ticket className="w-3.5 h-3.5 text-amber-600" />
                <span>最低轉蛋券 (Gacha Tickets):</span>
                {minTickets > 0 && (
                  <span className="text-amber-700 font-mono font-bold bg-amber-100 px-1.5 py-0.2 rounded text-[11px]">
                    ≥ {minTickets} 張
                  </span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {ticketPresets.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => onMinTicketsChange(val)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                    minTickets === val
                      ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs font-bold'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300 hover:bg-amber-50/50'
                  }`}
                >
                  {val === 0 ? '不限 (全部)' : `🎫 ${val}+ 券`}
                </button>
              ))}
              <div className="relative flex items-center ml-1">
                <input
                  type="number"
                  placeholder="自訂券數"
                  value={minTickets || ''}
                  onChange={(e) => onMinTicketsChange(parseInt(e.target.value, 10) || 0)}
                  className="w-24 px-2.5 py-1 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Stage Progress (關卡進度) */}
          <div className="space-y-1.5 pt-2 border-t border-purple-100/70">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-red-500" />
              <span>關卡進度 (Stage):</span>
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => onSelectedStageChange('')}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition ${
                  !selectedStage
                    ? 'bg-slate-800 text-white border-slate-900 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                全部關卡
              </button>
              <button
                type="button"
                onClick={() => onSelectedStageChange('151')}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition ${
                  selectedStage === '151'
                    ? 'bg-slate-800 text-white border-slate-900 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                🚩 Stage 151 資源初始
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selected Required Characters Summary Bar */}
      {activeRequiredEntries.length > 0 && (
        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex flex-wrap items-center justify-between gap-2.5 animate-in fade-in duration-150">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <Check className="w-4 h-4 text-amber-600" />
              已指定選號陣容 ({totalDesiredCharsCount} 隻):
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {activeRequiredEntries.map(([charKey, count]) => {
                const charObj = allAvailableCharacters.find(
                  (c) => c.name.toLowerCase() === charKey
                );
                return (
                  <span
                    key={charKey}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white text-slate-800 border border-amber-300 text-xs font-medium shadow-2xs"
                  >
                    {charObj?.img && (
                      <img
                        src={charObj.img}
                        alt={charKey}
                        className="w-4 h-4 object-contain"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <span className="font-semibold">{charObj?.chineseName || charKey}</span>
                    <span className="font-mono font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded text-[11px]">
                      x{count}
                    </span>
                    <button
                      onClick={() => onRemoveCharacterRequirement(charKey)}
                      className="text-slate-400 hover:text-red-500 ml-0.5 p-0.5 transition"
                      title="減少 1 隻"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onAddCharacterRequirement(charKey)}
                      className="text-slate-400 hover:text-amber-700 p-0.5 transition"
                      title="再加 1 隻"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          </div>

          <button
            onClick={onClearCharacterRequirements}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-xs font-medium transition shadow-2xs"
          >
            <RotateCcw className="w-3 h-3" />
            <span>重設角色選號</span>
          </button>
        </div>
      )}

      {/* Character Selector Section (Large Image Grid, No Text, Strict Order) */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        {/* Selector Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-blue-600" />
              {activeTab === 'resources'
                ? '搭配指定限定角色/裝備 (點選頭像):'
                : '點選頭像進行選號 (點擊累加需求數量):'}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              共 {displayedCharacters.length} 款
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Category Quick Filter Pills */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setCategoryFilter('all')}
                className={`px-2.5 py-1 rounded-md transition ${
                  categoryFilter === 'all'
                    ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                全部
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('in_stock')}
                className={`px-2.5 py-1 rounded-md transition ${
                  categoryFilter === 'in_stock'
                    ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                在庫現貨
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('gear')}
                className={`px-2.5 py-1 rounded-md transition ${
                  categoryFilter === 'gear'
                    ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                裝備道具
              </button>
            </div>

            {/* Quick search input */}
            <div className="relative">
              <input
                type="text"
                placeholder="搜尋角色/裝備..."
                value={charSearch}
                onChange={(e) => setCharSearch(e.target.value)}
                className="pl-2.5 pr-6 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 w-32 sm:w-36"
              />
              {charSearch && (
                <button
                  onClick={() => setCharSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Expand / Collapse toggle */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 transition"
              title={isExpanded ? '收合頭像選號區' : '展開頭像選號區'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 6-Columns Avatar Grid (Images Only, Large & Clean, Exact Order) */}
        {isExpanded && (
          <div className="max-h-[380px] overflow-y-auto p-3 sm:p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 scrollbar-thin">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 xl:grid-cols-6 gap-2.5 sm:gap-3.5">
              {displayedCharacters.map((char) => {
                const key = char.name.toLowerCase();
                const currentSelectedCount = characterRequirements[key] || 0;
                const isSelected = currentSelectedCount > 0;

                return (
                  <div
                    key={char.id}
                    className="relative group flex items-center justify-center select-none"
                  >
                    {/* Main Square Card (No text, Large Picture, Rounded 2xl with Black Border) */}
                    <button
                      type="button"
                      onClick={() => onAddCharacterRequirement(char.name)}
                      title={`${char.chineseName || char.name} (現貨: ${char.count} 組)`}
                      className={`w-full aspect-square flex items-center justify-center p-2 rounded-2xl transition-all duration-150 ${
                        isSelected
                          ? 'bg-amber-50/40 border-[3px] border-amber-500 shadow-md ring-2 ring-amber-400/40 scale-[1.02]'
                          : 'bg-white border-2 border-slate-900/90 hover:border-blue-600 hover:shadow-sm hover:scale-[1.03] active:scale-95'
                      }`}
                    >
                      {char.img ? (
                        <img
                          src={char.img}
                          alt={char.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full max-w-[72px] max-h-[72px] sm:max-w-[80px] sm:max-h-[80px] object-contain drop-shadow-xs transition-transform group-hover:scale-105"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            const fallback = target.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className="w-full h-full rounded-xl bg-slate-100 flex flex-col items-center justify-center text-slate-700 font-bold text-xs p-1 text-center"
                        style={{ display: char.img ? 'none' : 'flex' }}
                      >
                        <span className="text-xs">{char.chineseName || char.name}</span>
                      </div>
                    </button>

                    {/* Quantity Badge on Top-Right Corner (When Selected) */}
                    {isSelected && (
                      <div className="absolute -top-1.5 -right-1.5 z-10 flex items-center shadow-xs">
                        <span className="font-mono font-bold text-[11px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full border border-amber-300 shadow-xs">
                          x{currentSelectedCount}
                        </span>
                      </div>
                    )}

                    {/* Hover Minus / Decrement Button */}
                    {isSelected && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveCharacterRequirement(char.name);
                        }}
                        className="absolute -bottom-1.5 -left-1.5 z-10 w-5 h-5 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-xs transition"
                        title="減少 1 隻"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Batch Select & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-3">
          <button
            id="select-all-btn"
            onClick={onToggleSelectAll}
            className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900 font-medium transition"
          >
            {isAllSelected ? (
              <CheckSquare className="w-4 h-4 text-blue-600" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span>
              {isAllSelected ? '取消全選' : '選取當前篩選'} ({totalFilteredCount}組)
            </span>
          </button>

          {selectedCount > 0 && (
            <span className="text-blue-700 font-semibold bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
              已選取 {selectedCount} 組
            </span>
          )}

          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-slate-400 hover:text-blue-600 text-xs underline"
            >
              清除所有篩選條件
            </button>
          )}
        </div>

        {/* Batch Quick Operations */}
        {selectedCount > 0 && (
          <div className="flex items-center gap-2">
            <button
              id="batch-copy-btn"
              onClick={onBatchCopy}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg font-medium transition shadow-2xs"
            >
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              複製已選清單 ({selectedCount})
            </button>
            <button
              id="batch-ai-copy-btn"
              onClick={onBatchAiCopy}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI 文案包裝
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
