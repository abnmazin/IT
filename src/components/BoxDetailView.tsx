"use client";

import { useState, useEffect, useMemo } from "react";
import { Box, Category, WarehouseItem, VisitStatus, isSerialCategory, getItemSerials } from "@/types";
import { ArrowRight, Package, Tag, Minus, Plus, Search, X, Send, Check, FileSpreadsheet } from "lucide-react";
import { exportBoxToExcel } from "@/lib/exportExcel";
import ExportSettingsModal from "@/components/ExportSettingsModal";

interface BoxDetailViewProps {
  box: Box;
  visitName: string;
  categories: Category[];
  warehouseItems: WarehouseItem[];
  visits?: { id: string; status: string; boxes: Box[] }[];
  readonly?: boolean;
  visitStatus?: VisitStatus;
  onBack: () => void;
  onUpdateItemQty: (boxId: string, warehouseItemId: string, delta: number) => void;
  onToggleItemSerial?: (boxId: string, warehouseItemId: string, serial: string) => void;
  onAddItemToBox?: (visitId: string, boxId: string, warehouseItemId: string, qty: number, serials?: string[]) => void;
  onBulkAddItemsToBox?: (visitId: string, boxId: string, items: { warehouseItemId: string; qty: number; serials?: string[] }[]) => void;
  visitId?: string;
}

export default function BoxDetailView({
  box,
  visitName,
  categories,
  warehouseItems,
  visits,
  readonly = false,
  visitStatus,
  onBack,
  onUpdateItemQty,
  onToggleItemSerial,
  onAddItemToBox,
  onBulkAddItemsToBox,
  visitId,
}: BoxDetailViewProps) {
  const [currentQty, setCurrentQty] = useState<Record<string, number>>(
    () => Object.fromEntries(box.items.map((i) => [i.warehouseItemId, i.qty]))
  );
  const [showAddItem, setShowAddItem] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [addPicks, setAddPicks] = useState<Record<string, string[]>>({});
  const [qtyPicks, setQtyPicks] = useState<Record<string, number>>({});

  useEffect(() => {
    setCurrentQty(Object.fromEntries(box.items.map((i) => [i.warehouseItemId, i.qty])));
  }, [box]);

  const totalQty = box.items.reduce((a, i) => a + i.qty, 0);
  const catLabel = (key: string) => categories.find((c) => c.key === key)?.label || key;

  const deployedByItem = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const v of visits || []) {
      if (v.status !== "active" && v.status !== "collecting") continue;
      for (const b of v.boxes) {
        for (const bi of b.items) {
          const s = bi.serials || [];
          if (s.length === 0) continue;
          const set = map.get(bi.warehouseItemId) || new Set<string>();
          s.forEach((x) => set.add(x));
          map.set(bi.warehouseItemId, set);
        }
      }
    }
    return map;
  }, [visits]);

  const availableSerials = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const item of warehouseItems) {
      const all = getItemSerials(item);
      if (all.length === 0) continue;
      const deployed = deployedByItem.get(item.id);
      map.set(item.id, deployed ? all.filter((s) => !deployed.has(s)) : all);
    }
    return map;
  }, [warehouseItems, deployedByItem]);

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
          getItemSerials(i).some((s) => s.toLowerCase().includes(q))
      );
    }
    return result;
  }, [warehouseItems, search, filterCategory]);

  const handleAddItem = (item: WarehouseItem) => {
    if (visitId && onAddItemToBox) {
      if (isSerialCategory(categories, item.category)) {
        const picks = addPicks[item.id] || [];
        if (picks.length === 0) return;
        onAddItemToBox(visitId, box.id, item.id, picks.length, picks);
        setAddPicks((prev) => ({ ...prev, [item.id]: [] }));
      } else {
        const qty = qtyPicks[item.id] ?? 1;
        if (qty <= 0) return;
        onAddItemToBox(visitId, box.id, item.id, qty);
        setQtyPicks((prev) => ({ ...prev, [item.id]: 0 }));
      }
    }
  };

  const setRowQty = (itemId: string, qty: number, max: number) => {
    const clamped = Math.max(0, Math.min(max, Number.isFinite(qty) ? qty : 0));
    setQtyPicks((prev) => ({ ...prev, [itemId]: clamped }));
  };

  const totalToAdd = useMemo(() => {
    let n = 0;
    for (const item of availableItems) {
      if (isSerialCategory(categories, item.category)) {
        n += (addPicks[item.id] || []).length;
      } else {
        n += qtyPicks[item.id] ?? 1;
      }
    }
    return n;
  }, [availableItems, categories, addPicks, qtyPicks]);

  const handleAddAll = () => {
    if (!visitId || !onBulkAddItemsToBox) return;
    const items: { warehouseItemId: string; qty: number; serials?: string[] }[] = [];
    for (const item of availableItems) {
      if (isSerialCategory(categories, item.category)) {
        const picks = addPicks[item.id] || [];
        if (picks.length > 0) items.push({ warehouseItemId: item.id, qty: picks.length, serials: picks });
      } else {
        const qty = qtyPicks[item.id] ?? 1;
        if (qty > 0) items.push({ warehouseItemId: item.id, qty });
      }
    }
    if (items.length === 0) return;
    onBulkAddItemsToBox(visitId, box.id, items);
    setQtyPicks({});
    setAddPicks({});
  };

  const openAddPanel = () => {
    setQtyPicks({});
    setAddPicks({});
    setShowAddItem(true);
  };

  const closeAddPanel = () => setShowAddItem(false);

  const togglePick = (itemId: string, serial: string) => {
    setAddPicks((prev) => {
      const cur = prev[itemId] || [];
      const next = cur.includes(serial) ? cur.filter((s) => s !== serial) : [...cur, serial];
      return { ...prev, [itemId]: next };
    });
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
            onClick={() => setShowExport(true)}
            className="flex items-center gap-2 px-3 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-medium hover:bg-emerald-100 transition-colors shrink-0 min-h-[44px]"
          >
            <FileSpreadsheet className="w-4 h-4" />
            تصدير Excel
          </button>
        )}
      </div>

      {showExport && (
        <ExportSettingsModal
          title={`تصدير الصندوق: ${box.name}`}
          showFlatToggle={false}
          onExport={(opts) => {
            exportBoxToExcel(box, visitName, categories, opts);
            setShowExport(false);
          }}
          onClose={() => setShowExport(false)}
        />
      )}

      {!readonly && onAddItemToBox && visitId && (
        <div className="flex gap-2">
          <button
            onClick={showAddItem ? closeAddPanel : openAddPanel}
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
        <div className="card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">إضافة صنف من المخزن</h3>
            <button onClick={closeAddPanel} className="p-2 rounded-lg hover:bg-slate-100 min-w-[36px] min-h-[36px] flex items-center justify-center">
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
          <div className="max-h-72 overflow-y-auto space-y-1">
            {availableItems.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">لا توجد عناصر متاحة</p>
            ) : (
              availableItems.map((item) => {
                const serials = isSerialCategory(categories, item.category) ? (availableSerials.get(item.id) || []) : [];
                const picks = addPicks[item.id] || [];
                const isSerial = isSerialCategory(categories, item.category);
                return (
                  <div
                    key={item.id}
                    className="px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-800 truncate">{item.name}</span>
                        </div>
                        <span className="text-[11px] text-slate-400">{catLabel(item.category)} · متوفر: {item.totalQty}</span>
                      </div>
                      {!isSerial ? (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => setRowQty(item.id, (qtyPicks[item.id] ?? 1) - 1, item.totalQty)}
                            disabled={(qtyPicks[item.id] ?? 1) <= 0}
                            className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-300 disabled:opacity-30 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="number"
                            min={0}
                            max={item.totalQty}
                            value={qtyPicks[item.id] ?? 1}
                            onChange={(e) => setRowQty(item.id, Number(e.target.value), item.totalQty)}
                            className="w-14 text-center text-sm font-bold border border-slate-200 rounded-lg py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-400"
                          />
                          <button
                            onClick={() => setRowQty(item.id, (qtyPicks[item.id] ?? 1) + 1, item.totalQty)}
                            disabled={(qtyPicks[item.id] ?? 1) >= item.totalQty}
                            className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 hover:bg-emerald-200 disabled:opacity-30 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleAddItem(item)}
                            disabled={(qtyPicks[item.id] ?? 1) <= 0}
                            className="flex items-center gap-1 px-3 py-2 bg-sky-600 text-white rounded-lg text-xs font-medium hover:bg-sky-700 disabled:opacity-40 transition-colors min-h-[36px]"
                          >
                            <Send className="w-3 h-3" />
                            إضافة
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddItem(item)}
                          disabled={picks.length === 0}
                          className="flex items-center gap-1 px-3 py-2 bg-sky-600 text-white rounded-lg text-xs font-medium hover:bg-sky-700 disabled:opacity-40 transition-colors min-h-[36px] shrink-0"
                        >
                          <Send className="w-3 h-3" />
                          إضافة ({picks.length})
                        </button>
                      )}
                    </div>
                    {serials.length > 0 && (
                      <div className="mt-1.5 mr-4 flex flex-wrap gap-1.5">
                        {serials.map((s) => {
                          const picked = picks.includes(s);
                          return (
                            <button
                              key={s}
                              onClick={() => togglePick(item.id, s)}
                              className={`text-[10px] font-mono px-2 py-1 rounded-lg border transition-colors min-h-[36px] flex items-center gap-1 ${
                                picked ? "bg-emerald-500 text-white border-emerald-500" : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300"
                              }`}
                            >
                              {picked && <Check className="w-3 h-3" />}
                              {s}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <span className="text-sm text-slate-600">
              محدد: <span className="font-bold text-sky-700">{totalToAdd}</span> قطعة
            </span>
            <button onClick={handleAddAll} disabled={totalToAdd === 0} className="btn-success">
              <Send className="w-4 h-4" />
              إضافة المحدد
            </button>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        {box.items.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-400">الصندوق فارغ</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {box.items.map((item) => {
              const qty = currentQty[item.warehouseItemId] ?? item.qty;
              const max = item.originalQty || item.qty;
              const serials = item.serials || [];
              const isSerial = serials.length > 0;
              const outSet = new Set(item.outSerials || []);
              const canToggle = isSerial && !readonly && !!onToggleItemSerial &&
                (visitStatus === "active" || visitStatus === "collecting");
              const inBoxCount = isSerial ? serials.length - outSet.size : qty;
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
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-slate-400">{catLabel(item.category)}</span>
                        <span className="text-[11px] text-slate-300">·</span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {isSerial ? `${inBoxCount} / ${max} قطعة` : `${item.qty} / ${max} قطعة`}
                        </span>
                      </div>
                      {isSerial && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {serials.map((s) => {
                            const out = outSet.has(s);
                            if (canToggle) {
                              return (
                                <button
                                  key={s}
                                  onClick={() => onToggleItemSerial!(box.id, item.warehouseItemId, s)}
                                  className={`text-[10px] font-mono px-2 py-1 rounded-lg border transition-colors min-h-[36px] flex items-center gap-1 ${
                                    out ? "bg-red-500 text-white border-red-500" : "bg-white text-slate-600 border-slate-200 hover:border-red-400"
                                  }`}
                                >
                                  <Tag className="w-3 h-3" />
                                  {s}
                                </button>
                              );
                            }
                            return (
                              <span
                                key={s}
                                className={`text-[10px] font-mono px-2 py-1 rounded-lg border flex items-center gap-1 ${
                                  out ? "bg-red-50 text-red-600 border-red-200" : "bg-sky-50 text-sky-600 border-sky-200"
                                }`}
                              >
                                <Tag className="w-3 h-3" />
                                {s}
                              </span>
                            );
                          })}
                        </div>
                      )}
                      {canToggle && (
                        <p className="text-[10px] text-slate-400 mt-1">
                          اضغط على الجهاز لسحبه من الصندوق (أحمر) أو إعادته
                        </p>
                      )}
                    </div>
                  </div>
                  {!readonly && !isSerial && (
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
                  {!readonly && isSerial && (
                    <div className="flex flex-col items-center gap-0.5 shrink-0">
                      <span className={`text-sm font-bold ${inBoxCount === 0 ? "text-red-500" : inBoxCount < max ? "text-amber-600" : "text-slate-900"}`}>
                        {inBoxCount}
                      </span>
                      <span className="text-[10px] text-slate-400">داخل</span>
                    </div>
                  )}
                  {readonly && !isSerial && (
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