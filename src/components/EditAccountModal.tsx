import React, { useState, useRef } from 'react';
import { InventoryAccount } from '../types';
import {
  X,
  Upload,
  Image as ImageIcon,
  Check,
  RotateCcw,
  Sparkles,
  Tag,
  FileEdit,
  Trash2
} from 'lucide-react';

interface EditAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: InventoryAccount | null;
  onSave: (
    id: string,
    data: {
      customName?: string;
      customImage?: string;
      customPrice?: string;
      customNotes?: string;
    }
  ) => void;
}

export const EditAccountModal: React.FC<EditAccountModalProps> = ({
  isOpen,
  onClose,
  account,
  onSave,
}) => {
  if (!isOpen || !account) return null;

  const [nameInput, setNameInput] = useState(account.customName || '');
  const [imageInput, setImageInput] = useState(account.customImage || '');
  const [priceInput, setPriceInput] = useState(account.customPrice || '');
  const [notesInput, setNotesInput] = useState(account.notes || '');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Suggested auto-generated title based on characters & resources
  const suggestedTitle = React.useMemo(() => {
    const chars = account.characters
      .map((c) => `${c.chineseName || c.name}${c.count > 1 ? `x${c.count}` : ''}`)
      .slice(0, 3)
      .join(' + ');
    const collab = account.collabSeries[0] ? `【${account.collabSeries[0]}】` : '';
    const rubies = account.resources.rubies ? `💎${account.resources.rubies}鑽` : '';
    return `${collab} ${chars} ${rubies}`.trim();
  }, [account]);

  // Handle local image file upload (converts to base64 data URL)
  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('請上傳圖片格式檔案 (JPG, PNG, WebP)');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageInput(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSave = () => {
    onSave(account.id, {
      customName: nameInput.trim() || undefined,
      customImage: imageInput.trim() || undefined,
      customPrice: priceInput.trim() || undefined,
      customNotes: notesInput.trim() || undefined,
    });
    onClose();
  };

  const handleClearAll = () => {
    setNameInput('');
    setImageInput('');
    setPriceInput('');
    setNotesInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <FileEdit className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <span>編輯選號商品 · #{account.displayId}</span>
              </h2>
              <p className="text-xs text-slate-500">
                上架專屬圖片、自訂商品吸睛標題與台幣售價
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

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-700">
          {/* 1. Custom Title / Name */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-800 flex items-center gap-1.5">
                <span>商品展示標題 / 自訂名稱</span>
              </label>
              <button
                type="button"
                onClick={() => setNameInput(suggestedTitle)}
                className="text-blue-600 hover:text-blue-700 text-[11px] font-medium flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                帶入建議標題
              </button>
            </div>
            <input
              id="custom-name-input"
              type="text"
              placeholder={`預設: 編號 #${account.displayId}`}
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 2. Image Upload / URL */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-800 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>上架選號圖片 (支援電腦上傳或貼上圖片網址)</span>
            </label>

            {/* Drop Zone & Preview */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition ${
                isDragOver
                  ? 'border-blue-500 bg-blue-50/50'
                  : imageInput
                  ? 'border-emerald-300 bg-emerald-50/20'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100/70'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />

              {imageInput ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="relative group/img">
                    <img
                      src={imageInput}
                      alt="Preview"
                      className="max-h-40 max-w-full rounded-lg object-contain shadow-xs border border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageInput('');
                      }}
                      className="absolute -top-2 -right-2 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-md"
                      title="移除圖片"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-medium">
                    ✓ 已載入圖片 (點擊或拖曳可更換)
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5 py-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="font-medium text-slate-800">
                    點擊上傳 或 將選號截圖拖曳至此
                  </div>
                  <div className="text-[11px] text-slate-400">
                    支援 JPG, PNG, WebP 圖片格式
                  </div>
                </div>
              )}
            </div>

            {/* Direct Image URL input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="或直接貼上圖片網址 (https://...)"
                value={imageInput.startsWith('data:') ? '' : imageInput}
                onChange={(e) => setImageInput(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-[11px]"
              />
              {imageInput && !imageInput.startsWith('data:') && (
                <button
                  type="button"
                  onClick={() => setImageInput('')}
                  className="px-2 py-1.5 text-slate-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* 3. Custom Price & Remarks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div className="space-y-1">
              <label className="font-semibold text-slate-800 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-500" />
                <span>自訂售價標籤 (NT$)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono">
                  NT$
                </span>
                <input
                  id="custom-price-input"
                  type="number"
                  placeholder="如: 180"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  className="w-full pl-10 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-800 flex items-center gap-1">
                <span>備註 / 賣場說明</span>
              </label>
              <input
                type="text"
                placeholder="如: 送5張卷、可議價、現貨即發"
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={handleClearAll}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-slate-500 hover:text-red-600 text-xs transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>還原預設</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition"
            >
              取消
            </button>
            <button
              type="button"
              id="save-account-edit-btn"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
            >
              <Check className="w-4 h-4" />
              <span>儲存上架設定</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
