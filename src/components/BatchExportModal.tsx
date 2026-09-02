import React, { useState, useMemo } from 'react';
import { InventoryAccount, ExportPreset, ExportTemplateConfig } from '../types';
import { formatAccountsToText } from '../utils/gameData';
import {
  X,
  Copy,
  Check,
  Download,
  FileSpreadsheet,
  MessageSquare,
  Hash,
  ShoppingBag,
  Code
} from 'lucide-react';

interface BatchExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: InventoryAccount[];
  selectedCount: number;
}

export const BatchExportModal: React.FC<BatchExportModalProps> = ({
  isOpen,
  onClose,
  accounts,
  selectedCount,
}) => {
  if (!isOpen) return null;

  const [preset, setPreset] = useState<ExportPreset>('line_bullet');
  const [shopTitle, setShopTitle] = useState('LINE Rangers 特攻隊現貨專賣');
  const [contactLine, setContactLine] = useState('私訊問價 / 帶編號報價秒發');
  const [includeCustomPrice, setIncludeCustomPrice] = useState(true);
  const [customTemplateString, setCustomTemplateString] = useState(
    '【#{id}】 {name} {collabs} 陣容: {characters} | {resources} | {price}'
  );
  const [copied, setCopied] = useState(false);

  const exportConfig: ExportTemplateConfig = useMemo(
    () => ({
      preset,
      includeId: true,
      includeGameName: true,
      includeCollabs: true,
      includeCharacters: true,
      includeResources: true,
      includeCustomPrice,
      includeContact: true,
      shopTitle,
      contactLine,
      customTemplateString,
    }),
    [preset, includeCustomPrice, shopTitle, contactLine, customTemplateString]
  );

  const formattedText = useMemo(() => {
    return formatAccountsToText(accounts, exportConfig);
  }, [accounts, exportConfig]);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([formattedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LINE_Rangers_庫存清單_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCsv = () => {
    const csvContent = formatAccountsToText(accounts, {
      ...exportConfig,
      preset: 'compact_csv',
    });
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LINE_Rangers_帳號清單_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Download className="w-5 h-5 text-blue-600" />
              匯出易讀清單格式
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              共計匯出 <strong>{accounts.length}</strong> 組帳號
              {selectedCount > 0 ? ` (已篩選勾選 ${selectedCount} 組)` : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selectors */}
        <div className="p-3 sm:p-4 border-b border-slate-100 bg-white flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 mr-1">選擇排版格式:</span>

          <button
            id="preset-line"
            onClick={() => setPreset('line_bullet')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              preset === 'line_bullet'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            LINE / 社群條列式 (買家最愛)
          </button>

          <button
            id="preset-discord"
            onClick={() => setPreset('discord_box')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              preset === 'discord_box'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            Discord 代碼塊版
          </button>

          <button
            id="preset-8591"
            onClick={() => setPreset('forum_8591')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              preset === 'forum_8591'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            8591 / 巴哈賣場版
          </button>

          <button
            id="preset-custom"
            onClick={() => setPreset('custom')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              preset === 'custom'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            自訂模板格式
          </button>
        </div>

        {/* Customization Options Bar */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-slate-500 mb-1 font-medium">店名 / 標題抬頭</label>
            <input
              type="text"
              value={shopTitle}
              onChange={(e) => setShopTitle(e.target.value)}
              placeholder="例: LINE Rangers 特攻隊現貨專賣"
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-500 mb-1 font-medium">聯繫/購買引導</label>
            <input
              type="text"
              value={contactLine}
              onChange={(e) => setContactLine(e.target.value)}
              placeholder="例: 私訊LINE: @xxx / 帶編號問價"
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
            />
          </div>

          <div className="flex items-center sm:justify-center pt-3">
            <label className="flex items-center gap-2 cursor-pointer text-slate-700 select-none">
              <input
                type="checkbox"
                checked={includeCustomPrice}
                onChange={(e) => setIncludeCustomPrice(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 bg-white"
              />
              <span>顯示自訂售價（無則顯示私訊）</span>
            </label>
          </div>
        </div>

        {/* Custom Template Editor */}
        {preset === 'custom' && (
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 text-xs">
            <div className="flex items-center justify-between mb-1 text-slate-700 font-medium">
              <span>自訂變數佔位符:</span>
              <span className="text-[11px] text-slate-500">
                可使用 {'{id}'}, {'{name}'}, {'{characters}'}, {'{collabs}'}, {'{resources}'}, {'{price}'}, {'{num}'}
              </span>
            </div>
            <input
              type="text"
              value={customTemplateString}
              onChange={(e) => setCustomTemplateString(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Real-time Preview Area */}
        <div className="flex-1 p-5 overflow-y-auto bg-slate-50/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600">即時清單預覽:</span>
            <span className="text-xs text-slate-400">字數: {formattedText.length} 字</span>
          </div>
          <pre className="w-full p-4 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 whitespace-pre-wrap select-all leading-relaxed max-h-[360px] overflow-y-auto shadow-2xs">
            {formattedText}
          </pre>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              下載 Excel / CSV 檔
            </button>
            <button
              onClick={handleDownloadTxt}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition"
            >
              <Download className="w-4 h-4 text-blue-600" />
              下載 TXT 文字檔
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition"
            >
              關閉
            </button>
            <button
              id="copy-all-export-btn"
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  已複製到剪貼簿！
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  一鍵複製全部清單
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
