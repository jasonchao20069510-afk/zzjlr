import React, { useState } from 'react';
import { InventoryAccount } from '../types';
import {
  Copy,
  Check,
  Sparkles,
  Gem,
  Ticket,
  Tag,
  Edit2,
  FileEdit,
  ImageIcon
} from 'lucide-react';

interface AccountTableViewProps {
  accounts: InventoryAccount[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onUpdatePrice: (id: string, price: string) => void;
  onQuickCopy: (account: InventoryAccount) => void;
  onOpenEditModal: (account: InventoryAccount) => void;
}

export const AccountTableView: React.FC<AccountTableViewProps> = ({
  accounts,
  selectedIds,
  onToggleSelect,
  onUpdatePrice,
  onQuickCopy,
  onOpenEditModal,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (account: InventoryAccount, e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickCopy(account);
    setCopiedId(account.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
              <th className="py-3 px-3 w-12 text-center">選取</th>
              <th className="py-3 px-3 w-16 text-center">圖片</th>
              <th className="py-3 px-3 w-28">編號 / 自訂名</th>
              <th className="py-3 px-4">包含角色陣容</th>
              <th className="py-3 px-3 w-36">資源 (鑽/券/關卡)</th>
              <th className="py-3 px-3 w-28 text-right">自訂售價</th>
              <th className="py-3 px-3 w-24 text-center">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {accounts.map((acc) => {
              const isSelected = selectedIds.has(acc.id);
              const isCopied = copiedId === acc.id;

              return (
                <tr
                  key={acc.id}
                  onClick={() => onToggleSelect(acc.id)}
                  className={`hover:bg-slate-50/80 transition cursor-pointer ${
                    isSelected ? 'bg-blue-50/50' : ''
                  }`}
                >
                  {/* Selection Checkbox */}
                  <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(acc.id)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 bg-white cursor-pointer"
                    />
                  </td>

                  {/* Thumbnail Image */}
                  <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                    {acc.customImage ? (
                      <img
                        src={acc.customImage}
                        alt=""
                        className="w-10 h-10 rounded-md object-cover border border-slate-200 inline-block shadow-2xs"
                      />
                    ) : (
                      <button
                        onClick={() => onOpenEditModal(acc)}
                        className="w-8 h-8 rounded-md bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-200 inline-flex items-center justify-center text-slate-400 hover:text-blue-600 transition"
                        title="上架選號圖片"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>

                  {/* ID & Custom Name */}
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <div className="font-mono font-bold text-slate-900">
                      #{acc.displayId}
                    </div>
                    {acc.customName && (
                      <div className="text-[11px] font-semibold text-blue-700 truncate max-w-[130px]">
                        {acc.customName}
                      </div>
                    )}
                  </td>

                  {/* Characters (Images Only) */}
                  <td className="py-2.5 px-4">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {acc.characters.map((char, i) => (
                        <div
                          key={i}
                          className="relative flex items-center justify-center w-8 h-8 p-0.5 rounded-lg border-2 border-slate-900 bg-white transition hover:scale-110 shadow-2xs"
                          title={`${char.chineseName || char.name}${char.count > 1 ? ` x${char.count}` : ''}`}
                        >
                          {char.img ? (
                            <img
                              src={char.img}
                              alt={char.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                const target = e.currentTarget;
                                target.style.display = 'none';
                                const fallback = target.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div
                            className="w-full h-full rounded bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-[10px]"
                            style={{ display: char.img ? 'none' : 'flex' }}
                          >
                            {(char.chineseName || char.name).slice(0, 1)}
                          </div>
                          {char.count > 1 && (
                            <span className="absolute -top-1 -right-1 z-10 text-[9px] font-mono text-slate-950 font-bold bg-amber-500 border border-amber-300 px-1 rounded-full shadow-2xs">
                              x{char.count}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* Resources */}
                  <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px]">
                    <div className="flex flex-col gap-0.5 text-slate-600">
                      {acc.resources.rubies ? (
                        <span className="text-purple-800 font-bold flex items-center gap-1 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                          <Gem className="w-3 h-3 text-purple-600" />
                          {acc.resources.rubies.toLocaleString()} 鑽
                        </span>
                      ) : null}
                      {acc.resources.tickets ? (
                        <span className="text-amber-900 font-bold flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          <Ticket className="w-3 h-3 text-amber-600" />
                          {acc.resources.tickets} 券
                        </span>
                      ) : null}
                      {acc.resources.stage ? (
                        <span className="text-slate-600 text-[10px]">第 {acc.resources.stage} 關</span>
                      ) : null}
                    </div>
                  </td>

                  {/* Price */}
                  <td className="py-2.5 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <span
                      className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                        acc.customPrice
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'text-slate-400'
                      }`}
                    >
                      {acc.customPrice ? `NT$ ${acc.customPrice}` : '私訊問價'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onOpenEditModal(acc)}
                        className="p-1.5 rounded bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-blue-600 border border-slate-200 transition"
                        title="編輯上架圖片與改名字"
                      >
                        <FileEdit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleCopy(acc, e)}
                        className={`p-1.5 rounded text-xs transition ${
                          isCopied
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                        title="複製此帳號資訊"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
