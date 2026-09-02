import React from 'react';
import { RefreshCw } from 'lucide-react';

interface HeaderProps {
  totalAccounts: number;
  filteredCount: number;
  lastSyncTime: Date | null;
  isLoading: boolean;
  onSync: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalAccounts,
  filteredCount,
  lastSyncTime,
  isLoading,
  onSync,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs font-bold text-lg">
              庫
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 tracking-tight">
                  LINE Rangers
                </h1>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                <span>
                  {lastSyncTime
                    ? `最後同步: ${lastSyncTime.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
                    : '尚未同步'}
                </span>
                <span>•</span>
                <span>在庫 {totalAccounts} 組 (符合篩選: {filteredCount} 組)</span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              id="sync-inventory-btn"
              onClick={onSync}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition disabled:opacity-50 shadow-2xs"
              title="重新同步遠端最新庫存"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
              {isLoading ? '同步中...' : '重新抓取'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
