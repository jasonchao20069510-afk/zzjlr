import React from 'react';
import {
  Shield,
  Gem,
  Sparkles,
} from 'lucide-react';

interface ScrapeControlPanelProps {
  totalInStock: number;
  collabCount: number;
  resourceCount: number;
  activeFilterMode?: 'all' | 'collabs' | 'resources';
  onSelectFilterMode?: (mode: 'all' | 'collabs' | 'resources') => void;
}

export const ScrapeControlPanel: React.FC<ScrapeControlPanelProps> = ({
  totalInStock,
  collabCount,
  resourceCount,
  activeFilterMode = 'all',
  onSelectFilterMode,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
      {/* Top Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>LINE Rangers 銀河特攻隊 在庫庫存</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              支援即時多角需求篩選、上架圖片與一鍵格式化匯出
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Key Stats Bar (Click to switch to Ruby/Ticket, Collab, or All) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3.5">
        {/* All In-stock */}
        <button
          type="button"
          onClick={() => onSelectFilterMode?.('all')}
          className={`text-left rounded-xl p-3 flex items-center justify-between border transition-all cursor-pointer group ${
            activeFilterMode === 'all'
              ? 'bg-blue-50/60 border-blue-400 ring-2 ring-blue-200 shadow-xs'
              : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-slate-100/60'
          }`}
        >
          <div>
            <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
              <span>在庫帳號總數</span>
              {activeFilterMode === 'all' && (
                <span className="text-[10px] font-semibold text-blue-600 bg-blue-100/80 px-1.5 py-0.2 rounded">
                  顯示中
                </span>
              )}
            </div>
            <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
              {totalInStock.toLocaleString()} <span className="text-xs text-slate-400 font-normal">組</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center group-hover:scale-105 transition">
            <Shield className="w-4 h-4 text-blue-600" />
          </div>
        </button>

        {/* Collab Series */}
        <button
          type="button"
          onClick={() => onSelectFilterMode?.('collabs')}
          className={`text-left rounded-xl p-3 flex items-center justify-between border transition-all cursor-pointer group ${
            activeFilterMode === 'collabs'
              ? 'bg-amber-50/60 border-amber-400 ring-2 ring-amber-200 shadow-xs'
              : 'bg-slate-50/70 border-slate-200 hover:border-amber-300 hover:bg-amber-50/30'
          }`}
        >
          <div>
            <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
              <span>動漫聯動 / 限定神角</span>
              {activeFilterMode === 'collabs' && (
                <span className="text-[10px] font-semibold text-amber-700 bg-amber-100/80 px-1.5 py-0.2 rounded">
                  顯示中
                </span>
              )}
            </div>
            <div className="text-xl font-bold font-mono text-blue-700 mt-0.5">
              {collabCount.toLocaleString()} <span className="text-xs text-slate-400 font-normal">組</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center group-hover:scale-105 transition">
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
        </button>

        {/* Ruby & Tickets Resource Accounts (Direct Clickable Jump) */}
        <button
          id="stat-card-resources"
          type="button"
          onClick={() => onSelectFilterMode?.('resources')}
          className={`text-left rounded-xl p-3 flex items-center justify-between border transition-all cursor-pointer group relative overflow-hidden ${
            activeFilterMode === 'resources'
              ? 'bg-purple-50/80 border-purple-500 ring-2 ring-purple-300 shadow-sm'
              : 'bg-slate-50/70 border-slate-200 hover:border-purple-400 hover:bg-purple-50/40 hover:shadow-2xs'
          }`}
        >
          <div className="z-10">
            <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
              <span className="font-semibold text-purple-900">紅寶石 / 轉蛋券資源號</span>
              <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.2 rounded-full border border-purple-200 animate-pulse">
                點此選寶石券 ➔
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-purple-700 mt-0.5">
              {resourceCount.toLocaleString()} <span className="text-xs text-slate-400 font-normal">組</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-purple-100/80 border border-purple-300 flex items-center justify-center group-hover:scale-110 transition z-10">
            <Gem className="w-4 h-4 text-purple-600" />
          </div>
        </button>
      </div>
    </div>
  );
};
