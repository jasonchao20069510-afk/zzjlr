import React, { useState, useMemo } from 'react';
import { Search, X, Sparkles } from 'lucide-react';
import { COLLAB_MAPPING, COOKIERUN_CHINESE } from '../utils/gameData';

interface CharacterDictionaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  charLookup: Record<string, any>;
  onSelectCharacterFilter: (charName: string) => void;
  currentStockCounts: Record<string, number>;
}

export const CharacterDictionaryModal: React.FC<CharacterDictionaryModalProps> = ({
  isOpen,
  onClose,
  charLookup,
  onSelectCharacterFilter,
  currentStockCounts,
}) => {
  if (!isOpen) return null;

  const [search, setSearch] = useState('');
  const [selectedCollabGroup, setSelectedCollabGroup] = useState('');

  // Extract all characters from charLookup
  const characterList = useMemo(() => {
    const list = Object.entries(charLookup).map(([key, rawVal]) => {
      const val = rawVal as any;
      const collabInfo = COLLAB_MAPPING[key.toLowerCase()];
      const chName =
        collabInfo?.chineseName ||
        val?.chineseName ||
        COOKIERUN_CHINESE[key.toLowerCase()] ||
        val?.name ||
        key;
      const collab = collabInfo?.collab || val?.collab || '常駐/其他';
      const count = currentStockCounts[key.toLowerCase()] || (val?.name ? currentStockCounts[val.name.toLowerCase()] : 0) || 0;

      return {
        key,
        name: val?.name || key,
        chineseName: chName,
        img: val?.img,
        collab,
        featured: Boolean(val?.featured),
        inStockCount: count,
      };
    });

    return list;
  }, [charLookup, currentStockCounts]);

  const collabGroups = useMemo(() => {
    const groups = new Set<string>();
    characterList.forEach((c) => {
      if (c.collab) groups.add(c.collab);
    });
    return Array.from(groups);
  }, [characterList]);

  const filteredList = useMemo(() => {
    return characterList.filter((c) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.chineseName.toLowerCase().includes(q) ||
        c.key.toLowerCase().includes(q);

      const matchesGroup = !selectedCollabGroup || c.collab === selectedCollabGroup;

      return matchesSearch && matchesGroup;
    });
  }, [characterList, search, selectedCollabGroup]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              LINE Rangers 角色中英文圖鑑與現貨庫
            </h2>
            <p className="text-xs text-slate-500">
              包含各大動漫聯動（間諜家家酒、怪獸8號、銀魂、鏈鋸人等）中文對照與在庫數量
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Collab Group Filter */}
        <div className="p-4 border-b border-slate-100 bg-white space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜尋角色 (如: 安妮亞, Kafka, 帕瓦, Gintoki...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            <button
              onClick={() => setSelectedCollabGroup('')}
              className={`px-2.5 py-1 rounded-md text-xs shrink-0 transition ${
                !selectedCollabGroup
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              全部系列 ({characterList.length})
            </button>
            {collabGroups.map((grp) => (
              <button
                key={grp}
                onClick={() => setSelectedCollabGroup(grp === selectedCollabGroup ? '' : grp)}
                className={`px-2.5 py-1 rounded-md text-xs shrink-0 transition ${
                  selectedCollabGroup === grp
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {grp}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="p-5 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 bg-slate-50/50">
          {filteredList.map((char) => (
            <div
              key={char.key}
              onClick={() => {
                onSelectCharacterFilter(char.key);
                onClose();
              }}
              className="group p-3 rounded-xl bg-white hover:border-blue-500 border border-slate-200 shadow-2xs hover:shadow-xs transition cursor-pointer flex flex-col items-center text-center justify-between"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden mb-2 shadow-2xs group-hover:scale-105 transition-transform">
                {char.img ? (
                  <img
                    src={char.img.startsWith('http') ? char.img : `https://ledger-live-nine.vercel.app/${char.img.replace(/^\/+/, '')}`}
                    alt={char.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <Sparkles className="w-5 h-5 text-blue-500" />
                )}
              </div>

              <div className="w-full">
                <div className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600">
                  {char.chineseName}
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate">
                  {char.name}
                </div>
                {char.collab && (
                  <span className="inline-block mt-1 text-[9px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200 truncate max-w-full">
                    {char.collab}
                  </span>
                )}
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-100 w-full flex items-center justify-between text-[10px]">
                <span className="text-slate-400">在庫:</span>
                <span className={`font-mono font-bold ${char.inStockCount > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {char.inStockCount} 組
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            顯示 {filteredList.length} 位角色（點選任意角色可直接加入需求篩選）
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium transition"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
