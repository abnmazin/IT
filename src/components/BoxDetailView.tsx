"use client";

import { useState, useEffect, useMemo } from "react";
import { Box, Category, WarehouseItem } from "@/types";
import { ArrowRight, Package, Tag, Minus, Plus, Search, X, Send, FileSpreadsheet } from "lucide-react";
import { exportBoxToExcel } from "@/lib/exportExcel";

interface BoxDetailViewProps {
  box: Box;
  visitName: string;
  categories: Category[];
  warehouseItems: WarehouseItem[];
  readonly?: boolean;
  onBack: () => void;
  onUpdateItemQty: (boxId: string, warehouseItemId: string, delta: number) => void;
  onAddItemToBox?: (visitId: string, boxId: string, warehouseItemId: string, qty: number) => void;
  visitId?: string;
}

export default function BoxDetailView({
  box,
  visitName,
  categories,
  warehouseItems,
  readonly = false,
  onBack,
  onUpdateItemQty,
  onAddItemToBox,
  visitId,
}: BoxDetailViewProps) {
  const [currentQty, setCurrentQty] = useState<Record<string, number>>(
    () => Object.fromEntries(box.items.map((i) => [i.warehouseItemId, i.qty]))
  );
  const [showAddItem, setShowAddItem] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("All");

  useEffect(() => {
    setCurrentQty(Object.fromEntries(box.items.map((i) => [i.warehouseItemId, i.qty])));
  }, [box]);

  const totalQty = box.items.reduce((a, i) => a + i.qty, 0);
  const catLabel = (key: string) => categories.find((c) => c.key === key)?.label || key;

  const handleDelta = (warehouseItemId: string, max: number, delta: number) => {
    setCurrentQty((prev) => {
      const cur = prev[warehouseItemId] ?? 0;
      const next = Math.max(0, Math.min(max, cur + delta));
      return { ...prev, [warehouseItemId]: next };
    });
    onUpdateItemQty(box.id, warehouseItemId, delta);
  };

  // Filtered warehouse items for adding
  const availableItems = useMemo(() => {
    let result = warehouseItems.filter((i) => i.totalQty > 0);
    if (filterCategory !== "All") {
      result = result.filter((i) => i.category === filterCategory);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          (i.serialNumber && i.serialNumber.toLowerCase().includes(q))
      );
    }
    return result;
  }, [warehouseItems, search, filterCategory]);

  const handleAddItem = (warehouseItemId: string) => {
    if (visitId && onAddItemToBox) {
      onAddItemToBox(visitId, box.id, warehouseItemId, 1);
    }
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
            {visitName} · {totalQty} قطعة · {box.items.length} صنف
          </p>
        </div>
        {box.items.length > 0 && (
          <button
            onClick={() => exportBoxToExcel(box, visitName, categories)}
            className="flex items-center gap-2 px-3 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-medium hover:bg-emerald-100 transition-colors shrink-0 min-h-[44px]"
          >
            <FileSpreadsheet className="w-4 h-4" />
            تصدير Excel
          </button>
        )}
      </div>

      {!readonly && onAddItemToBox && visitId && (
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddItem(!showAddItem)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[44px] ${
              showAddItem ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Plus className="w-4 h-4" />
            إضافة صنف
          </button>
        </div>
      )}

      {showAddItem && (
        <div className="bg-white rounded-xl border border-sky-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">إضافة صنف من المخزن</h3>
            <button onClick={() => setShowAddItem(false)} className="p-2 rounded-lg hover:bg-slate-100 min-w-[36px] min-h-[36px] flex items-center justify-center">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="بحث..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-3 pr-10 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300 bg-white"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="py-2.5 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300 bg-white"
            >
              <option value="All">كل الفئات</option>
              {categories.map((c) => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {availableItems.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">لا توجد عناصر متاحة</p>
            ) : (
              availableItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-800 truncate">{item.name}</span>
                      {item.serialNumber && (
                        <span className="text-[10px] text-sky-600 font-mono bg-sky-50 px-1.5 py-0.5 rounded">{item.serialNumber}</span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">{catLabel(item.category)} · متوفر: {item.totalQty}</span>
                  </div>
                  <button
                    onClick={() => handleAddItem(item.id)}
                    className="flex items-center gap-1 px-3 py-2 bg-sky-500 text-white rounded-lg text-xs font-medium hover:bg-sky-600 transition-colors min-h-[36px] shrink-0"
                  >
                    <Send className="w-3 h-3" />
                    إضافة
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {box.items.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-400">الصندوق فارغ</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {box.items.map((item) => {
              const qty = currentQty[item.warehouseItemId] ?? item.qty;
              const whItem = warehouseItems.find((w) => w.id === item.warehouseItemId);
              const max = item.qty + (whItem?.totalQty || 0);
              return (
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
                        <span className="text-[11px] text-slate-500 font-medium">{item.qty} / {max} قطعة</span>
                      </div>
                    </div>
                  </div>
                  {!readonly && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleDelta(item.warehouseItemId, max, -1)}
                        disabled={qty <= 0}
                        className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-300 disabled:opacity-30 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className={`w-8 text-center text-sm font-bold ${
                        qty === 0 ? "text-red-500" : qty < max ? "text-amber-600" : "text-slate-900"
                      }`}>
                        {qty}
                      </span>
                      <button
                        onClick={() => handleDelta(item.warehouseItemId, max, 1)}
                        disabled={qty >= max}
                        className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 hover:bg-emerald-200 disabled:opacity-30 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  {readonly && (
                    <span className={`text-sm font-bold ${
                      qty === 0 ? "text-red-500" : qty < max ? "text-amber-600" : "text-slate-900"
                    }`}>
                      {qty}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}