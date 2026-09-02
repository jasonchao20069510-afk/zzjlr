import React, { useState } from 'react';
import { GameKey } from '../types';
import { PlusCircle, X, Upload } from 'lucide-react';

interface ManualImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportRawLines: (lines: string[], gameKey: GameKey) => void;
}

export const ManualImportModal: React.FC<ManualImportModalProps> = ({
  isOpen,
  onClose,
  onImportRawLines,
}) => {
  if (!isOpen) return null;

  const [rawText, setRawText] = useState('');
  const [importedCount, setImportedCount] = useState<number | null>(null);

  const handleImport = () => {
    const lines = rawText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) return;

    onImportRawLines(lines, 'linerangers');
    setImportedCount(lines.length);
    setTimeout(() => {
      onClose();
      setImportedCount(null);
      setRawText('');
    }, 1200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRawText(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">手動貼上 / 匯入 LINE Rangers 庫存清單</h2>
              <p className="text-xs text-slate-500">
                貼上帳號 ID 代碼或文字檔，系統將自動解析角色陣容
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Text Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-slate-800">
                貼上帳號代碼清單 (一行一組):
              </label>
              <label className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer inline-flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" />
                上傳 .txt 檔
                <input
                  type="file"
                  accept=".txt,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            <textarea
              rows={8}
              placeholder="例:&#10;TH001_Anya_Kafka_RB2000_TK50_stage100&#10;TH002_Gintoki_Power_RB1500_TK30"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {importedCount !== null && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-medium">
              ✓ 成功解析並匯入 {importedCount} 組帳號！
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {rawText.split('\n').filter((l) => l.trim()).length} 組待解析帳號
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition"
            >
              取消
            </button>
            <button
              onClick={handleImport}
              disabled={!rawText.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg text-xs font-semibold shadow-xs transition"
            >
              確認匯入
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
