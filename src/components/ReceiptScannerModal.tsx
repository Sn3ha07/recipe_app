import React, { useState, useRef } from 'react';
import { 
  ScanLine, 
  Upload, 
  FileText, 
  Sparkles, 
  Check, 
  X, 
  Clock, 
  Refrigerator, 
  AlertCircle,
  Camera
} from 'lucide-react';
import { ReceiptScanItem, FridgeItem } from '../types';
import { calculateExpiryDate } from '../utils/expiryRules';

interface ReceiptScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddScannedItemsToFridge: (items: Omit<FridgeItem, 'id'>[]) => void;
}

// Shrinks a photo to a JPEG (longest side 2200px) so it uploads quickly and fits the server's size limit
const downscaleImage = (file: File, maxSide = 2200, quality = 0.8): Promise<string> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      URL.revokeObjectURL(url);
      if (!ctx) {
        reject(new Error('no canvas'));
        return;
      }
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('unreadable'));
    };
    img.src = url;
  });

export const ReceiptScannerModal: React.FC<ReceiptScannerModalProps> = ({
  isOpen,
  onClose,
  onAddScannedItemsToFridge,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [textReceipt, setTextReceipt] = useState<string>('');
  const [activeMode, setActiveMode] = useState<'upload' | 'text'>('upload');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [extractedItems, setExtractedItems] = useState<ReceiptScanItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [noItemsFound, setNoItemsFound] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await downscaleImage(file);
      setMimeType('image/jpeg');
      setImagePreview(dataUrl);
      setErrorMessage(null);
      setNoItemsFound(false);
    } catch {
      setErrorMessage("This photo can't be read here. Try a JPG or PNG, or paste the receipt text instead.");
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleScan = async () => {
    if (!imagePreview && !textReceipt.trim()) {
      setErrorMessage('Please upload a receipt image or paste text receipt lines.');
      return;
    }

    setIsScanning(true);
    setErrorMessage(null);
    setNoItemsFound(false);

    const controller = new AbortController();
    const abortTimer = setTimeout(() => controller.abort(), 55000);

    try {
      const payload: any = {};
      if (activeMode === 'upload' && imagePreview) {
        payload.imageBase64 = imagePreview;
        payload.mimeType = mimeType;
      } else {
        payload.textReceipt = textReceipt;
      }

      const res = await fetch('/api/scan-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify(payload),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }
      if (!res.ok || !data) {
        throw new Error(
          data?.error ||
            (res.status === 404
              ? "The receipt scanner isn't available on this site yet."
              : 'Could not read the receipt right now.')
        );
      }

      const items: ReceiptScanItem[] = (data.items || []).map((item: any) => ({
        ...item,
        selected: true,
      }));

      setExtractedItems(items);
      setNoItemsFound(items.length === 0);
    } catch (err: any) {
      console.error('Scan error:', err);
      setErrorMessage(
        err?.name === 'AbortError'
          ? 'Gemini took too long to read the receipt. Please try again.'
          : err?.message || 'Could not read the receipt right now.'
      );
    } finally {
      clearTimeout(abortTimer);
      setIsScanning(false);
    }
  };

  const handleToggleItem = (index: number) => {
    setExtractedItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleAddSelected = () => {
    const selected = extractedItems.filter((i) => i.selected);
    if (selected.length === 0) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const fridgePayload: Omit<FridgeItem, 'id'>[] = selected.map((item) => ({
      name: item.name,
      quantity: item.quantity || '1 unit',
      category: item.category,
      addedDate: todayStr,
      expiryDate: calculateExpiryDate(item.estimatedShelfLifeDays || 7),
      estimatedDays: item.estimatedShelfLifeDays || 7,
      storageTip: item.storageTip,
    }));

    onAddScannedItemsToFridge(fridgePayload);
    onClose();
  };

  const loadSampleReceipt = () => {
    setActiveMode('text');
    setTextReceipt(`ORGANIC HARVEST MARKET
1x Organic Firm Tofu 400g - $2.99
1x Fresh Baby Spinach Tub - $3.49
2x Hass Avocado - $2.50
1x Cremini Mushrooms 8oz - $2.29
1x Oat Milk Unsweetened 32oz - $3.99
1x Greek Yogurt Whole Milk - $4.19
1x Sourdough Loaf - $4.50
1x Dish Soap - $3.99 (Non-food)
TOTAL: $27.94`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        id="receipt-scanner-modal"
        className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 font-bold">
              <ScanLine className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-stone-900">
                Receipt Scanner (Stretch Goal)
              </h2>
              <p className="text-xs text-stone-500">
                Auto-extract vegetarian groceries and estimate shelf-life
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Mode Switcher */}
          <div className="flex items-center gap-2 p-1 bg-stone-100 rounded-xl text-xs font-semibold text-stone-600">
            <button
              onClick={() => setActiveMode('upload')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeMode === 'upload' ? 'bg-white text-stone-900 shadow-xs' : 'hover:text-stone-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Receipt Photo</span>
            </button>
            <button
              onClick={() => setActiveMode('text')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeMode === 'text' ? 'bg-white text-stone-900 shadow-xs' : 'hover:text-stone-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Paste Text / E-Receipt</span>
            </button>
          </div>

          {/* Upload Area */}
          {activeMode === 'upload' ? (
            <div className="space-y-3">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {imagePreview ? (
                <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-50 max-h-56 flex items-center justify-center">
                  <img
                    src={imagePreview}
                    alt="Receipt preview"
                    className="max-h-56 object-contain"
                  />
                  <button
                    onClick={() => {
                      setImagePreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-stone-900/80 text-white rounded-lg text-xs"
                  >
                    Change photo
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-stone-300 hover:border-emerald-500 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-stone-50/60 hover:bg-emerald-50/30"
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 text-stone-400 mx-auto flex items-center justify-center mb-2">
                    <Camera className="w-5 h-5 text-emerald-600" />
                  </div>
                  <p className="text-xs font-semibold text-stone-800">
                    Click to upload receipt photo
                  </p>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Supports JPG, PNG, WEBP from grocery stores or mobile cameras
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <textarea
                rows={5}
                placeholder="Paste receipt text or grocery email confirmation here..."
                value={textReceipt}
                onChange={(e) => setTextReceipt(e.target.value)}
                className="w-full p-3 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={loadSampleReceipt}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold underline underline-offset-2 cursor-pointer"
                >
                  Paste sample grocery receipt
                </button>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {noItemsFound && extractedItems.length === 0 && (
            <div className="p-3 rounded-xl bg-stone-100 text-xs text-ink/75">
              No vegetarian food items were found on this receipt. Try a clearer photo, or paste the item lines as text.
            </div>
          )}

          {/* Action Trigger */}
          {extractedItems.length === 0 && (
            <button
              onClick={handleScan}
              disabled={isScanning || (!imagePreview && !textReceipt.trim())}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              {isScanning ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Scanning with Gemini Vision...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Scan & Extract Vegetarian Items</span>
                </>
              )}
            </button>
          )}

          {/* Extracted Items Review List */}
          {extractedItems.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-stone-200">
              <div className="flex items-center justify-between">
                <h4 className="font-serif font-bold text-stone-900 text-sm">
                  Extracted Vegetarian Items ({extractedItems.filter((i) => i.selected).length} selected)
                </h4>
                <button
                  onClick={() => {
                    setExtractedItems([]);
                    setImagePreview(null);
                    setTextReceipt('');
                  }}
                  className="text-xs text-stone-500 hover:text-stone-700"
                >
                  Scan another
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {extractedItems.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleToggleItem(idx)}
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                      item.selected
                        ? 'bg-emerald-50/80 border-emerald-300 text-stone-900'
                        : 'bg-stone-50/50 border-stone-200 text-stone-400 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center shrink-0 ${
                          item.selected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-stone-300'
                        }`}
                      >
                        {item.selected && <Check className="w-3 h-3" />}
                      </div>
                      <div>
                        <div className="font-semibold text-stone-900">{item.name}</div>
                        <div className="text-[11px] text-stone-500">
                          Qty: {item.quantity} • {item.storageTip}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                        <Clock className="w-3 h-3 text-emerald-600" />
                        ~{item.estimatedShelfLifeDays}d
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleAddSelected}
                disabled={extractedItems.filter((i) => i.selected).length === 0}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <Refrigerator className="w-4 h-4" />
                <span>Add Selected ({extractedItems.filter((i) => i.selected).length}) to Virtual Fridge</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
