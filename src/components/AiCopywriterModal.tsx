import React, { useState } from 'react';
import { InventoryAccount } from '../types';
import {
  Sparkles,
  X,
  Copy,
  Check,
  RefreshCw,
  Send,
  Flame,
  Star,
  Layers
} from 'lucide-react';

interface AiCopywriterModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: InventoryAccount[];
  gameName: string;
}

export const AiCopywriterModal: React.FC<AiCopywriterModalProps> = ({
  isOpen,
  onClose,
  accounts,
  gameName,
}) => {
  if (!isOpen) return null;

  const [style, setStyle] = useState<'social' | 'discord' | 'highlights'>('social');
  const [shopName, setShopName] = useState('LINE Rangers 特攻隊現貨專賣');
  const [contactInfo, setContactInfo] = useState('私訊問價 / 帶編號截圖即可秒查');
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sampleAccounts = accounts.slice(0, 25);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ai/generate-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accounts: sampleAccounts,
          gameName,
          style,
          customPrompt,
          shopName,
          contactInfo,
        }),
      });

      const data = await response.json();
      if (data.success && data.text) {
        setGeneratedText(data.text);
      } else {
        setError(data.error || '生成失敗，請稍後重試');
      }
    } catch (err: any) {
      setError(err.message || '網路連線異常');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                AI 號商文案生成精靈
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                智能分析當前 {accounts.length} 組庫存帳號特點，自動提煉吸睛賣點與繁中發文格式
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

        {/* Controls Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Style Selector */}
          <div>
            <label className="block font-semibold text-slate-800 mb-2">
              文案宣傳風格:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setStyle('social')}
                className={`p-3 rounded-xl border text-left transition ${
                  style === 'social'
                    ? 'bg-blue-50 border-blue-500 text-blue-950 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
                  <Flame className="w-4 h-4 text-orange-500" />
                  LINE / FB 社團熱銷風
                </div>
                <div className="text-[11px] text-slate-500 leading-normal">
                  豐富 Emoji、吸睛標題、聯動限定高光標註
                </div>
              </button>

              <button
                type="button"
                onClick={() => setStyle('discord')}
                className={`p-3 rounded-xl border text-left transition ${
                  style === 'discord'
                    ? 'bg-blue-50 border-blue-500 text-blue-950 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
                  <Layers className="w-4 h-4 text-blue-600" />
                  Discord / 乾淨列表風
                </div>
                <div className="text-[11px] text-slate-500 leading-normal">
                  Markdown 代碼塊、對齊整潔、適合買家快查
                </div>
              </button>

              <button
                type="button"
                onClick={() => setStyle('highlights')}
                className={`p-3 rounded-xl border text-left transition ${
                  style === 'highlights'
                    ? 'bg-blue-50 border-blue-500 text-blue-950 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
                  <Star className="w-4 h-4 text-amber-500" />
                  頂級神號重點推廣
                </div>
                <div className="text-[11px] text-slate-500 leading-normal">
                  挑選最具價值的聯動帳號做深度陣容推薦
                </div>
              </button>
            </div>
          </div>

          {/* Details Config */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 mb-1 font-medium">店名標題</label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 mb-1 font-medium">聯繫與購買方式說明</label>
              <input
                type="text"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Custom Instruction Prompt */}
          <div>
            <label className="block text-slate-700 mb-1 font-medium">
              額外補充指令 (可選填，例如: 強調怪獸8號/間諜家家酒特價、現貨即發)
            </label>
            <input
              type="text"
              placeholder="例: 強調全網最低價、送首抽資源、多買有優惠..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action Generate Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold flex items-center justify-center gap-2 shadow-xs transition"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Gemini AI 正在撰寫吸睛繁中文案中...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>一鍵生成號商宣傳文案</span>
                </>
              )}
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs">
              {error}
            </div>
          )}

          {/* Generated Result Preview */}
          {generatedText && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">生成文案預覽:</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">已複製</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>複製文案</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed max-h-[260px] overflow-y-auto select-all">
                {generatedText}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-medium transition"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
