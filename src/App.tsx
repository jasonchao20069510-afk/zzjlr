/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { InventoryAccount } from './types';
import { parseRawAccountToken, COLLAB_MAPPING, getCleanImageUrl } from './utils/gameData';
import { fetchFullInventory } from './utils/syncService';
import { Header } from './components/Header';
import { ScrapeControlPanel } from './components/ScrapeControlPanel';
import { FilterToolbar, CharacterRequirement } from './components/FilterToolbar';
import { AccountCard } from './components/AccountCard';
import { AccountTableView } from './components/AccountTableView';
import { EditAccountModal } from './components/EditAccountModal';
import { BatchExportModal } from './components/BatchExportModal';
import { AiCopywriterModal } from './components/AiCopywriterModal';
import { CharacterDictionaryModal } from './components/CharacterDictionaryModal';
import { ManualImportModal } from './components/ManualImportModal';
import {
  RefreshCw,
  Copy,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Inbox
} from 'lucide-react';

const ITEMS_PER_PAGE = 36;
const LOCAL_STORAGE_PRICES_KEY = 'line_rangers_custom_prices_v1';
const LOCAL_STORAGE_OVERRIDES_KEY = 'line_rangers_custom_overrides_v1';

export default function App() {
  // Main Data States (Dedicated exclusively to LINE Rangers)
  const [rawAccounts, setRawAccounts] = useState<string[]>([]);
  const [charLookup, setCharLookup] = useState<Record<string, any>>({});
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Custom User Overrides (Price, Custom Name, Uploaded Image) with LocalStorage persistence
  const [customPrices, setCustomPrices] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PRICES_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [customOverrides, setCustomOverrides] = useState<
    Record<
      string,
      {
        customName?: string;
        customImage?: string;
        customPrice?: string;
        customNotes?: string;
      }
    >
  >(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_OVERRIDES_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filter & Search States
  const [filterTab, setFilterTab] = useState<'characters' | 'resources'>('characters');
  const [minRubies, setMinRubies] = useState<number>(0);
  const [minTickets, setMinTickets] = useState<number>(0);
  const [selectedStage, setSelectedStage] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [characterRequirements, setCharacterRequirements] = useState<CharacterRequirement>({});
  const [sortBy, setSortBy] = useState('default');
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'preview'>('grid');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [editingAccount, setEditingAccount] = useState<InventoryAccount | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isAiCopyOpen, setIsAiCopyOpen] = useState(false);
  const [isDictOpen, setIsDictOpen] = useState(false);
  const [isManualImportOpen, setIsManualImportOpen] = useState(false);
  const [orderedGameCharacters, setOrderedGameCharacters] = useState<
    Array<{ name: string; img?: string; featured?: boolean }>
  >([]);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2200);
  };

  // Sync inventory with multi-tier fail-safe sync (local API -> direct remote -> local cache)
  const fetchInventory = useCallback(async () => {
    setIsLoading(true);
    setSyncError(null);
    try {
      const data = await fetchFullInventory();
      if (data.success && data.accounts) {
        // Collect LINE Rangers accounts & Kaibee resource accounts
        const combined = [
          ...(data.accounts.linerangers || []),
          ...(data.accounts.kaibee || []),
        ];
        setRawAccounts(combined);

        const lookup: Record<string, any> = {};
        if (data.gameData?.characters) {
          if (Array.isArray(data.gameData.characters.linerangers)) {
            setOrderedGameCharacters(data.gameData.characters.linerangers);
          }
          Object.keys(data.gameData.characters).forEach((cat) => {
            const list = data.gameData.characters[cat];
            if (Array.isArray(list)) {
              list.forEach((char: any) => {
                const key = (char.name || '').toLowerCase();
                lookup[key] = {
                  ...char,
                  category: cat,
                };
              });
            }
          });
        }
        setCharLookup(lookup);
        setLastSyncTime(new Date(data.timestamp));
      } else {
        setSyncError('無法載入遠端庫存資料');
      }
    } catch (err: any) {
      setSyncError(err.message || '網路連線失敗，請稍後重試');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Save custom prices & overrides to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_PRICES_KEY, JSON.stringify(customPrices));
    } catch {
      // ignore
    }
  }, [customPrices]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_OVERRIDES_KEY, JSON.stringify(customOverrides));
    } catch {
      // ignore
    }
  }, [customOverrides]);

  // Parse raw strings into structured accounts with price stripped & custom overrides applied
  const parsedAccounts = useMemo(() => {
    return rawAccounts.map((rawId, index) => {
      const acc = parseRawAccountToken(rawId, index, 'linerangers', charLookup);
      // Merge overrides (custom name, image, notes, price)
      const override = customOverrides[acc.id];
      if (override) {
        if (override.customName) acc.customName = override.customName;
        if (override.customImage) acc.customImage = override.customImage;
        if (override.customPrice) acc.customPrice = override.customPrice;
        if (override.customNotes) acc.notes = override.customNotes;
      }
      if (customPrices[acc.id] && !acc.customPrice) {
        acc.customPrice = customPrices[acc.id];
      }
      return acc;
    });
  }, [rawAccounts, charLookup, customPrices, customOverrides]);

  // Compute characters in the EXACT original game-data order (196 items as shown in screenshots)
  const allAvailableCharacters = useMemo(() => {
    // 1. Calculate counts for every character in in-stock parsed accounts
    const stockMap = new Map<string, number>();
    parsedAccounts.forEach((acc) => {
      acc.characters.forEach((c) => {
        const k = c.name.toLowerCase();
        stockMap.set(k, (stockMap.get(k) || 0) + 1);
      });
    });

    const result: Array<{
      id: string;
      name: string;
      chineseName?: string;
      img?: string;
      count: number;
      collab?: string;
      featured?: boolean;
    }> = [];

    const seen = new Set<string>();

    // 2. Add characters in the EXACT order from orderedGameCharacters (game-data.json)
    if (orderedGameCharacters && orderedGameCharacters.length > 0) {
      orderedGameCharacters.forEach((item) => {
        const k = item.name.toLowerCase();
        seen.add(k);
        const collabInfo = COLLAB_MAPPING[k];
        const chName = collabInfo?.chineseName || item.name;
        const imgUrl = item.img ? getCleanImageUrl(item.img) : undefined;
        const count = stockMap.get(k) || 0;

        result.push({
          id: item.name,
          name: item.name,
          chineseName: chName,
          img: imgUrl,
          count: count,
          collab: collabInfo?.collab,
          featured: Boolean(item.featured),
        });
      });
    }

    // 3. If there are any characters in parsedAccounts not present in orderedGameCharacters, append them
    stockMap.forEach((count, k) => {
      if (!seen.has(k)) {
        const collabInfo = COLLAB_MAPPING[k];
        const lookupItem = charLookup[k];
        result.push({
          id: lookupItem?.name || k,
          name: lookupItem?.name || k,
          chineseName: collabInfo?.chineseName || lookupItem?.chineseName || k,
          img: lookupItem?.img ? getCleanImageUrl(lookupItem.img) : undefined,
          count: count,
          collab: collabInfo?.collab || lookupItem?.collab,
        });
      }
    });

    return result;
  }, [orderedGameCharacters, parsedAccounts, charLookup]);

  // Stock count mapping for CharacterDictionaryModal
  const currentStockCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allAvailableCharacters.forEach((c) => {
      counts[c.name.toLowerCase()] = c.count;
    });
    return counts;
  }, [allAvailableCharacters]);

  // Character requirement handlers (點 1 次 = 要 1 隻，點擊可累加)
  const handleAddCharacterRequirement = (charName: string) => {
    const key = charName.toLowerCase();
    setCharacterRequirements((prev) => {
      const current = prev[key] || 0;
      const next = current + 1;
      showToast(`已設定 ${charName} 需求 x${next}`);
      return {
        ...prev,
        [key]: next,
      };
    });
  };

  const handleRemoveCharacterRequirement = (charName: string) => {
    const key = charName.toLowerCase();
    setCharacterRequirements((prev) => {
      const current = prev[key] || 0;
      if (current <= 1) {
        const copy = { ...prev };
        delete copy[key];
        showToast(`已移除 ${charName} 需求`);
        return copy;
      }
      showToast(`已調整 ${charName} 需求為 x${current - 1}`);
      return {
        ...prev,
        [key]: current - 1,
      };
    });
  };

  const handleClearCharacterRequirements = () => {
    setCharacterRequirements({});
    showToast('已清除所有指定角色需求');
  };

  // Save full account override (Image, Custom Name, Price, Notes)
  const handleSaveAccountOverride = (
    id: string,
    data: {
      customName?: string;
      customImage?: string;
      customPrice?: string;
      customNotes?: string;
    }
  ) => {
    setCustomOverrides((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        ...data,
      },
    }));
    if (data.customPrice !== undefined) {
      setCustomPrices((prev) => ({
        ...prev,
        [id]: data.customPrice || '',
      }));
    }
    showToast(`已成功儲存 #${id} 上架圖片與商品資訊！`);
  };

  // Filter & Sort Logic
  const filteredAccounts = useMemo(() => {
    const requiredEntries = (Object.entries(characterRequirements) as [string, number][]).filter(
      ([, reqCount]) => typeof reqCount === 'number' && reqCount > 0
    );

    return parsedAccounts
      .filter((acc) => {
        // When in resources tab or when ruby/ticket filter is applied
        if (filterTab === 'resources') {
          const isResourceAcc =
            (acc.resources.rubies && acc.resources.rubies > 0) ||
            (acc.resources.tickets && acc.resources.tickets > 0) ||
            Boolean(acc.resources.stage) ||
            acc.gameKey === 'kaibee';
          if (!isResourceAcc) return false;
        }

        // Min Rubies Filter
        if (minRubies > 0) {
          if (!acc.resources.rubies || acc.resources.rubies < minRubies) {
            return false;
          }
        }

        // Min Tickets Filter
        if (minTickets > 0) {
          if (!acc.resources.tickets || acc.resources.tickets < minTickets) {
            return false;
          }
        }

        // Stage Filter
        if (selectedStage) {
          if (String(acc.resources.stage || '') !== String(selectedStage)) {
            return false;
          }
        }

        // Search query filter (Account ID, custom name, character names, or raw text)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesId = acc.displayId.toLowerCase().includes(q);
          const matchesCustomName = acc.customName && acc.customName.toLowerCase().includes(q);
          const matchesRaw = acc.rawString.toLowerCase().includes(q);
          const matchesChar = acc.characters.some(
            (c) =>
              c.name.toLowerCase().includes(q) ||
              (c.chineseName && c.chineseName.toLowerCase().includes(q))
          );
          const matchesCollab = acc.collabSeries.some((collab) =>
            collab.toLowerCase().includes(q)
          );
          if (!matchesId && !matchesCustomName && !matchesRaw && !matchesChar && !matchesCollab) {
            return false;
          }
        }

        // Multi-character count requirements
        if (requiredEntries.length > 0) {
          for (const [charKey, reqCount] of requiredEntries) {
            const charInAcc = acc.characters.find(
              (c) =>
                c.name.toLowerCase() === charKey ||
                c.id.toLowerCase() === charKey ||
                (c.chineseName && c.chineseName.toLowerCase() === charKey)
            );
            const actualCount = charInAcc ? charInAcc.count : 0;
            if (actualCount < reqCount) {
              return false;
            }
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'id_asc') {
          return a.displayId.localeCompare(b.displayId);
        }
        if (sortBy === 'id_desc') {
          return b.displayId.localeCompare(a.displayId);
        }
        if (sortBy === 'chars_desc') {
          return b.characterCount - a.characterCount;
        }
        if (sortBy === 'rubies_desc') {
          return (b.resources.rubies || 0) - (a.resources.rubies || 0);
        }
        if (sortBy === 'tickets_desc') {
          return (b.resources.tickets || 0) - (a.resources.tickets || 0);
        }
        return a.index - b.index;
      });
  }, [
    parsedAccounts,
    filterTab,
    minRubies,
    minTickets,
    selectedStage,
    searchQuery,
    characterRequirements,
    sortBy,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, characterRequirements, sortBy, filterTab, minRubies, minTickets, selectedStage]);

  const totalPages = Math.ceil(filteredAccounts.length / ITEMS_PER_PAGE) || 1;
  const paginatedAccounts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAccounts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAccounts, currentPage]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const isAllSelected = useMemo(() => {
    if (filteredAccounts.length === 0) return false;
    return filteredAccounts.every((acc) => selectedIds.has(acc.id));
  }, [filteredAccounts, selectedIds]);

  const handleToggleSelectAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (isAllSelected) {
        filteredAccounts.forEach((acc) => next.delete(acc.id));
      } else {
        filteredAccounts.forEach((acc) => next.add(acc.id));
      }
      return next;
    });
  };

  const handleUpdatePrice = (id: string, price: string) => {
    setCustomPrices((prev) => ({
      ...prev,
      [id]: price,
    }));
    setCustomOverrides((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        customPrice: price,
      },
    }));
    showToast(`已更新編號 #${id} 自訂售價為 NT$ ${price || '私訊問價'}`);
  };

  const handleApplyBatchMarkup = (price: string) => {
    const newPrices = { ...customPrices };
    const newOverrides = { ...customOverrides };
    filteredAccounts.forEach((acc) => {
      newPrices[acc.id] = price;
      newOverrides[acc.id] = {
        ...newOverrides[acc.id],
        customPrice: price,
      };
    });
    setCustomPrices(newPrices);
    setCustomOverrides(newOverrides);
    showToast(`已將當前篩選 ${filteredAccounts.length} 組帳號設定為 NT$ ${price}`);
  };

  const handleClearCustomPrices = () => {
    setCustomPrices({});
    showToast('已清空所有自訂售價標籤');
  };

  const handleQuickCopyAccount = (acc: InventoryAccount) => {
    const charSummary = acc.characters
      .map((c) => `${c.chineseName || c.name}${c.count > 1 ? `x${c.count}` : ''}`)
      .join(' + ');
    const nameText = acc.customName ? `【${acc.customName}】 ` : '';
    const collabText = acc.collabSeries.length > 0 ? `【${acc.collabSeries.join(' | ')}】 ` : '';
    const resText = [
      acc.resources.rubies ? `💎${acc.resources.rubies}鑽` : '',
      acc.resources.tickets ? `🎫${acc.resources.tickets}券` : '',
      acc.resources.stage ? `🚩第${acc.resources.stage}關` : '',
    ]
      .filter(Boolean)
      .join(' ');

    const text = `🔹 編號 #${acc.displayId} ${nameText || collabText}\n   陣容: ${charSummary || '標準配置'}${resText ? `\n   資源: ${resText}` : ''}${acc.customPrice ? `\n   售價: NT$ ${acc.customPrice}` : ''}`;

    navigator.clipboard.writeText(text);
    showToast(`已複製編號 #${acc.displayId} 清單到剪貼簿！`);
  };

  const handleBatchCopy = () => {
    const targets =
      selectedIds.size > 0
        ? parsedAccounts.filter((a) => selectedIds.has(a.id))
        : filteredAccounts;

    const lines = targets.map((acc) => {
      const charSummary = acc.characters
        .map((c) => `${c.chineseName || c.name}${c.count > 1 ? `x${c.count}` : ''}`)
        .join(' + ');
      const titleTag = acc.customName ? `【${acc.customName}】` : acc.collabSeries.length > 0 ? `【${acc.collabSeries[0]}】` : '';
      return `[#${acc.displayId}] ${titleTag} ${charSummary}${acc.customPrice ? ` | NT$${acc.customPrice}` : ''}`;
    });

    const fullText = `📋【LINE Rangers 現貨清單 · 共 ${targets.length} 組】\n\n${lines.join('\n')}\n\n💬 詢問/購買請直接報編號！`;
    navigator.clipboard.writeText(fullText);
    showToast(`已成功複製 ${targets.length} 組帳號清單！`);
  };

  const handleImportRawLines = (lines: string[]) => {
    setRawAccounts((prev) => [...lines, ...prev]);
    showToast(`已匯入 ${lines.length} 組 LINE Rangers 帳號！`);
  };

  const handleSelectFilterMode = (mode: 'all' | 'collabs' | 'resources') => {
    if (mode === 'resources') {
      setFilterTab('resources');
      setSortBy('rubies_desc');
      showToast('已切換至「💎 紅寶石 / 轉蛋券資源號」專屬選號區！');
    } else if (mode === 'collabs') {
      setFilterTab('characters');
      setSearchQuery('');
      showToast('已切換至「動漫聯動 / 限定神角」選號！');
    } else {
      setFilterTab('characters');
      setMinRubies(0);
      setMinTickets(0);
      setSelectedStage('');
      showToast('已顯示全部在庫帳號');
    }
    const elem = document.getElementById('filter-toolbar-section');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleResetResourceFilters = () => {
    setMinRubies(0);
    setMinTickets(0);
    setSelectedStage('');
    showToast('已重設紅寶石與轉蛋券門檻');
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setCharacterRequirements({});
    setSortBy('default');
    setMinRubies(0);
    setMinTickets(0);
    setSelectedStage('');
    showToast('已清除所有篩選條件');
  };

  const hasActiveFilters = Boolean(
    searchQuery ||
      Object.keys(characterRequirements).length > 0 ||
      sortBy !== 'default' ||
      filterTab === 'resources' ||
      minRubies > 0 ||
      minTickets > 0 ||
      selectedStage
  );

  const totalResourceAccounts = useMemo(() => {
    return parsedAccounts.filter(
      (a) =>
        (a.resources.rubies && a.resources.rubies > 0) ||
        (a.resources.tickets && a.resources.tickets > 0) ||
        Boolean(a.resources.stage) ||
        a.gameKey === 'kaibee'
    ).length;
  }, [parsedAccounts]);

  const exportTargetAccounts = useMemo(() => {
    if (selectedIds.size > 0) {
      return parsedAccounts.filter((a) => selectedIds.has(a.id));
    }
    return filteredAccounts;
  }, [selectedIds, parsedAccounts, filteredAccounts]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white font-medium px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 text-xs border border-slate-700 animate-in slide-in-from-bottom-5 fade-in duration-150">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        totalAccounts={parsedAccounts.length}
        filteredCount={filteredAccounts.length}
        lastSyncTime={lastSyncTime}
        isLoading={isLoading}
        onSync={fetchInventory}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        {/* Error Alert if Scrape Failed */}
        {syncError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between text-xs text-red-700">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
              <span>{syncError}</span>
            </div>
            <button
              onClick={fetchInventory}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition"
            >
              重試同步
            </button>
          </div>
        )}

        {/* LINE Rangers Dedicated Overview Panel */}
        <ScrapeControlPanel
          totalInStock={parsedAccounts.length}
          collabCount={parsedAccounts.filter((a) => a.collabSeries.length > 0).length}
          resourceCount={totalResourceAccounts}
          activeFilterMode={filterTab === 'resources' ? 'resources' : 'all'}
          onSelectFilterMode={handleSelectFilterMode}
        />

        {/* Character Pick & Count Filter Toolbar */}
        <FilterToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          characterRequirements={characterRequirements}
          onAddCharacterRequirement={handleAddCharacterRequirement}
          onRemoveCharacterRequirement={handleRemoveCharacterRequirement}
          onClearCharacterRequirements={handleClearCharacterRequirements}
          allAvailableCharacters={allAvailableCharacters}
          activeTab={filterTab}
          onChangeActiveTab={setFilterTab}
          minRubies={minRubies}
          onMinRubiesChange={setMinRubies}
          minTickets={minTickets}
          onMinTicketsChange={setMinTickets}
          selectedStage={selectedStage}
          onSelectedStageChange={setSelectedStage}
          onResetResourceFilters={handleResetResourceFilters}
          totalResourceAccountsCount={totalResourceAccounts}
          sortBy={sortBy}
          onChangeSortBy={setSortBy}
          viewMode={viewMode}
          onChangeViewMode={setViewMode}
          isAllSelected={isAllSelected}
          selectedCount={selectedIds.size}
          totalFilteredCount={filteredAccounts.length}
          onToggleSelectAll={handleToggleSelectAll}
          onBatchCopy={handleBatchCopy}
          onBatchAiCopy={() => setIsAiCopyOpen(true)}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Main List Rendering */}
        {isLoading ? (
          <div className="py-20 bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center text-center space-y-3 shadow-2xs">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            <div className="text-sm font-semibold text-slate-800">
              正在載入 LINE Rangers 遊戲庫存資料...
            </div>
            <div className="text-xs text-slate-500">
              連線至 河童 取得最新特攻隊在庫帳號...
            </div>
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div className="py-20 bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center text-center p-6 space-y-3 shadow-2xs">
            <Inbox className="w-10 h-10 text-slate-400" />
            <div className="text-base font-semibold text-slate-800">查無符合所選角色的特攻隊帳號</div>
            <div className="text-xs text-slate-500 max-w-sm">
              嘗試減少指定的角色數量、清除部分角色或點選「手動匯入」加入新代碼。
            </div>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium transition"
              >
                清除所有指定角色與篩選
              </button>
            )}
          </div>
        ) : (
          <div>
            {/* View Mode: Grid */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedAccounts.map((acc) => (
                  <AccountCard
                    key={acc.id}
                    account={acc}
                    isSelected={selectedIds.has(acc.id)}
                    onToggleSelect={handleToggleSelect}
                    onUpdatePrice={handleUpdatePrice}
                    onQuickCopy={handleQuickCopyAccount}
                    onOpenEditModal={(target) => setEditingAccount(target)}
                  />
                ))}
              </div>
            )}

            {/* View Mode: Table */}
            {viewMode === 'table' && (
              <AccountTableView
                accounts={paginatedAccounts}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onUpdatePrice={handleUpdatePrice}
                onQuickCopy={handleQuickCopyAccount}
                onOpenEditModal={(target) => setEditingAccount(target)}
              />
            )}

            {/* View Mode: Raw Text Preview */}
            {viewMode === 'preview' && (
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
                  <span>文字清單即時預覽 (共 {filteredAccounts.length} 組):</span>
                  <button
                    onClick={handleBatchCopy}
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    一鍵複製全部文字
                  </button>
                </div>
                <pre className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto select-all">
                  {filteredAccounts
                    .map((acc) => {
                      const chars = acc.characters
                        .map((c) => `${c.chineseName || c.name}${c.count > 1 ? `(x${c.count})` : ''}`)
                        .join(' + ');
                      const titleTag = acc.customName
                        ? `【${acc.customName}】`
                        : acc.collabSeries.length > 0
                        ? `【${acc.collabSeries.join(' | ')}】`
                        : '';
                      return `[#${acc.displayId}] ${titleTag} ${chars || '標準配置'}${acc.resources.rubies ? ` | 💎${acc.resources.rubies}鑽` : ''}${acc.customPrice ? ` | NT$${acc.customPrice}` : ''}`;
                    })
                    .join('\n')}
                </pre>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 pt-4 border-t border-slate-200">
                <div>
                  顯示第 <strong>{(currentPage - 1) * ITEMS_PER_PAGE + 1}</strong> 至{' '}
                  <strong>
                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredAccounts.length)}
                  </strong>{' '}
                  組（共 {filteredAccounts.length} 組）
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 disabled:opacity-30 disabled:pointer-events-none transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1 font-mono text-xs">
                    <span className="px-2.5 py-1 rounded bg-blue-600 text-white font-medium">
                      {currentPage}
                    </span>
                    <span className="text-slate-400">/</span>
                    <span className="px-2 py-1 text-slate-600">{totalPages}</span>
                  </div>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 disabled:opacity-30 disabled:pointer-events-none transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            LINE Rangers 在庫帳號: <span className="font-semibold text-slate-800">{parsedAccounts.length.toLocaleString()}</span> 組
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              已即時同步
            </span>
          </div>
        </div>
      </footer>

      {/* Edit Account Modal (上架圖片與改名字) */}
      <EditAccountModal
        isOpen={Boolean(editingAccount)}
        onClose={() => setEditingAccount(null)}
        account={editingAccount}
        onSave={handleSaveAccountOverride}
      />

      {/* Modals */}
      <BatchExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        accounts={exportTargetAccounts}
        selectedCount={selectedIds.size}
      />

      <AiCopywriterModal
        isOpen={isAiCopyOpen}
        onClose={() => setIsAiCopyOpen(false)}
        accounts={exportTargetAccounts}
        gameName="LINE Rangers 銀河特攻隊"
      />

      <CharacterDictionaryModal
        isOpen={isDictOpen}
        onClose={() => setIsDictOpen(false)}
        charLookup={charLookup}
        onSelectCharacterFilter={(charId) => {
          handleAddCharacterRequirement(charId);
        }}
        currentStockCounts={currentStockCounts}
      />

      <ManualImportModal
        isOpen={isManualImportOpen}
        onClose={() => setIsManualImportOpen(false)}
        onImportRawLines={handleImportRawLines}
      />
    </div>
  );
}
