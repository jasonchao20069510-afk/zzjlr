import React, { useState } from 'react';
import { InventoryAccount } from '../types';
import {
  Copy,
  Check,
  Sparkles,
  Gem,
  Ticket,
  MapPin,
  Tag,
  Coins,
  Edit2,
  ImageIcon,
  FileEdit
} from 'lucide-react';

interface AccountCardProps {
  account: InventoryAccount;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onUpdatePrice: (id: string, price: string) => void;
  onQuickCopy: (account: InventoryAccount) => void;
  onOpenEditModal: (account: InventoryAccount) => void;
}

export const AccountCard: React.FC<AccountCardProps> = ({
  account,
  isSelected,
  onToggleSelect,
  onUpdatePrice,
  onQuickCopy,
  onOpenEditModal,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [priceInput, setPriceInput] = useState(account.customPrice || '');

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickCopy(account);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleSavePrice = () => {
    onUpdatePrice(account.id, priceInput.trim());
    setIsEditingPrice(false);
  };

  return (
    <div
      onClick={() => onToggleSelect(account.id)}
      className={`group relative rounded-xl border p-4 transition-all duration-150 cursor-pointer flex flex-col justify-between bg-white ${
        isSelected
          ? 'border-blue-600 shadow-md ring-2 ring-blue-600/20'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
      }`}
    >
      {/* Top Section: Uploaded Image Banner (if provided by user) */}
      {account.customImage && (
        <div className="relative mb-3 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 h-36 flex items-center justify-center">
          <img
            src={account.customImage}
            alt={account.customName || account.displayId}
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenEditModal(account);
            }}
            className="absolute top-2 right-2 px-2 py-1 bg-black/60 hover:bg-black/80 text-white rounded text-[10px] font-medium backdrop-blur-xs flex items-center gap-1"
          >
            <ImageIcon className="w-3 h-3" />
            換圖
          </button>
        </div>
      )}

      {/* Top Header: Selection + Account ID + Custom Name + Actions */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(account.id)}
              onClick={(e) => e.stopPropagation()}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 bg-white cursor-pointer"
            />
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-mono text-sm font-bold text-slate-900">
                  #{account.displayId}
                </span>
                {account.customName && (
                  <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 truncate max-w-[180px]">
                    {account.customName}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons: Edit Modal & Quick Copy */}
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onOpenEditModal(account)}
              className="p-1.5 rounded-md bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-blue-600 border border-slate-200 transition"
              title="上架選號圖片與改名字"
            >
              <FileEdit className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleCopy}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition ${
                copied
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
              title="一鍵複製此帳號簡潔清單"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span className="text-[11px]">已複製</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-[11px] hidden sm:inline">複製</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Characters Grid / Avatars (Images Only) */}
        <div className="mt-3">
          <div className="text-[11px] font-medium text-slate-500 mb-2 flex items-center justify-between">
            <span>陣容包含 ({account.characterCount} 隻角色):</span>
          </div>

          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {account.characters.length > 0 ? (
              account.characters.map((char, i) => (
                <div
                  key={i}
                  className={`relative group/char flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 p-1 rounded-xl border-2 bg-white transition-all hover:scale-105 shadow-2xs select-none ${
                    char.collab
                      ? 'border-slate-900 ring-1 ring-slate-900/10'
                      : 'border-slate-900/90'
                  }`}
                  title={`${char.chineseName || char.name}${char.count > 1 ? ` x${char.count}` : ''}`}
                >
                  {char.img ? (
                    <img
                      src={char.img}
                      alt={char.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full max-w-[34px] max-h-[34px] sm:max-w-[38px] sm:max-h-[38px] object-contain drop-shadow-xs"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="w-full h-full rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-[11px] text-center"
                    style={{ display: char.img ? 'none' : 'flex' }}
                  >
                    {(char.chineseName || char.name).slice(0, 2)}
                  </div>
                  {char.count > 1 && (
                    <span className="absolute -top-1.5 -right-1.5 z-10 text-[10px] font-bold font-mono px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 border border-amber-300 shadow-2xs">
                      x{char.count}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">無特定標註角色</span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Footer: Resources + Price Setting */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap text-xs">
        {/* Resource Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {account.resources.rubies !== undefined && account.resources.rubies > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 shadow-2xs">
              <Gem className="w-3 h-3 text-purple-600 shrink-0" />
              {account.resources.rubies.toLocaleString()} 鑽
            </span>
          )}
          {account.resources.tickets !== undefined && account.resources.tickets > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs">
              <Ticket className="w-3 h-3 text-amber-600 shrink-0" />
              {account.resources.tickets} 券
            </span>
          )}
          {account.resources.stage !== undefined && account.resources.stage > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
              <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
              第 {account.resources.stage} 關
            </span>
          )}
        </div>

        {/* Custom Price / Inquire Tag */}
        <div onClick={(e) => e.stopPropagation()}>
          {isEditingPrice ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                placeholder="售價 NT$"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                className="w-20 px-2 py-0.5 text-xs bg-white border border-blue-500 rounded text-slate-900 focus:outline-none"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSavePrice();
                  if (e.key === 'Escape') setIsEditingPrice(false);
                }}
              />
              <button
                onClick={handleSavePrice}
                className="px-1.5 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded"
              >
                儲存
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingPrice(true)}
              className={`flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-md border transition ${
                account.customPrice
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                  : 'bg-slate-50 text-slate-500 hover:text-slate-800 border-slate-200'
              }`}
              title="點擊設定此號專屬售價"
            >
              <Tag className="w-3 h-3 text-slate-400" />
              <span>{account.customPrice ? `NT$ ${account.customPrice}` : '私訊問價'}</span>
              <Edit2 className="w-2.5 h-2.5 opacity-60 ml-0.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
