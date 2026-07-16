"use client";

import { useState } from "react";
import { InventoryItem, Site } from "@/types";
import { X, Truck, Tag } from "lucide-react";

interface TransferModalProps {
  items: InventoryItem[];
  fromSiteId: string;
  fromLocationId: string;
  allSites: Site[];
  onClose: () => void;
  onTransfer: (
    itemIds: string[],
    fromSiteId: string,
    toSiteId: string,
    fromLocationId: string
  ) => void;
}

export default function TransferModal({
  items,
  fromSiteId,
  fromLocationId,
  allSites,
  onClose,
  onTransfer,
}: TransferModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [toSiteId, setToSiteId] = useState(
    allSites.find((s) => s.id !== fromSiteId)?.id ?? ""
  );

  const availableItems = items.filter((i) => i.currentQty > 0 || i.serialNumber);

  const toggleItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === availableItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(availableItems.map((i) => i.id)));
    }
  };

  const handleSubmit = () => {
    if (selectedIds.size === 0 || !toSiteId) return;
    onTransfer(
      Array.from(selectedIds),
      fromSiteId,
      toSiteId,
      fromLocationId
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl w-full max-w-md sm:max-w-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-sky-500" />
            نقل عناصر إلى موقع آخر
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              الموقع المقصود *
            </label>
            <select
              value={toSiteId}
              onChange={(e) => setToSiteId(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 bg-white"
            >
              {allSites
                .filter((s) => s.id !== fromSiteId)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">
                اختر العناصر للنقل
              </label>
              <button
                onClick={toggleAll}
                className="text-xs text-sky-600 hover:text-sky-700 font-medium"
              >
                {selectedIds.size === availableItems.length
                  ? "إلغاء الكل"
                  : "تحديد الكل"}
              </button>
            </div>
            <div className="max-h-[300px] overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
              {availableItems.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-400">
                  لا توجد عناصر متاحة للنقل
                </div>
              ) : (
                availableItems.map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-center gap-3 px-3 py-3 cursor-pointer transition-colors ${
                      selectedIds.has(item.id)
                        ? "bg-sky-50"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(item.id)}
                      onChange={() => toggleItem(item.id)}
                      className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-400">
                          {item.category}
                        </span>
                        {item.serialNumber && (
                          <span className="flex items-center gap-1 text-xs text-sky-600 font-mono">
                            <Tag className="w-3 h-3" />
                            {item.serialNumber}
                          </span>
                        )}
                        {!item.serialNumber && (
                          <span className="text-xs text-slate-400">
                            الكمية: {item.currentQty}
                          </span>
                        )}
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSubmit}
              disabled={selectedIds.size === 0 || !toSiteId}
              className="flex-1 h-11 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Truck className="w-4 h-4" />
              تأكيد النقل ({selectedIds.size} صنف)
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium transition-colors"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
