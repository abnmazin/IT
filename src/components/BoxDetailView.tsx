"use client";

import { useState } from "react";
import { Box, Category } from "@/types";
import { ArrowRight, Package, Tag, Minus, Plus } from "lucide-react";

interface BoxDetailViewProps {
  box: Box;
  visitName: string;
  categories: Category[];
  onBack: () => void;
  onUpdateItemQty: (boxId: string, warehouseItemId: string, delta: number) => void;
}

export default function BoxDetailView({
  box,
  visitName,
  categories,
  onBack,
  onUpdateItemQty,
}: BoxDetailViewProps) {
  const [items, setItems] = useState(
    box.items.map((i) => ({ ...i }))
  );

  const totalQty = items.reduce((a, i) => a + i.qty, 0);
  const catLabel = (key: string) => categories.find((c) => c.key === key)?.label || key;

  const handleDelta = (warehouseItemId: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.warehouseItemId !== warehouseItemId) return item;
        const newQty = Math.max(0, item.qty + delta);
        return { ...item, qty: newQty };
      })
    );
    onUpdateItemQty(box.id, warehouseItemId, delta);
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">{box.name}</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {visitName} · {totalQty} قطعة · {items.length} صنف
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {items.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-400">الصندوق فارغ</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((item) => (
              <div
                key={item.warehouseItemId}
                className="flex items-center justify-between gap-3 px-3 sm:px-5 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-800 truncate">{item.name}</span>
                      {item.serialNumber && (
                        <span className="text-[11px] text-sky-600 font-mono bg-sky-50 px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0">
                          <Tag className="w-3 h-3" />
                          {item.serialNumber}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-slate-400">{catLabel(item.category)}</span>
                      <span className="text-[11px] text-slate-300">·</span>
                      <span className={`text-[11px] font-medium ${
                        item.qty === 0 ? "text-red-500" : "text-slate-600"
                      }`}>
                        {item.qty} قطعة
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleDelta(item.warehouseItemId, -1)}
                    disabled={item.qty <= 0}
                    className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-300 disabled:opacity-30 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-slate-900">{item.qty}</span>
                  <button
                    onClick={() => handleDelta(item.warehouseItemId, 1)}
                    className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 hover:bg-emerald-200 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
