"use client";

import { useState, useMemo } from "react";
import { Visit, WarehouseItem, Category, ItemCategory } from "@/types";
import { ArrowRight, Package, CheckCircle, ChevronDown, ChevronUp, RotateCcw, Minus, Plus, Tag } from "lucide-react";

interface CollectionViewProps {
  visit: Visit;
  warehouseItems: WarehouseItem[];
  categories: Category[];
  onBack: () => void;
  onComplete: (visitId: string, collected: { warehouseItemId: string; qty: number; returnedSerials?: string[]; status: "returned" | "consumed" | "missing" }[]) => void;
}

interface CollectItem {
  warehouseItemId: string;
  name: string;
  category: ItemCategory;
  consumable: boolean;
  deployedQty: number;
  serials?: string[];
  outSerials?: string[];
  inBoxCount: number;
  returnedSerials: string[];
  returnedQty: number;
  boxId: string;
  boxName: string;
}

export default function CollectionView({
  visit,
  categories,
  onBack,
  onComplete,
}: CollectionViewProps) {
  const [items, setItems] = useState<CollectItem[]>(() => {
    const list: CollectItem[] = [];
    for (const box of visit.boxes) {
      for (const bi of box.items) {
        const serials = bi.serials || [];
        const out = (bi.outSerials || []).filter((s) => serials.includes(s));
        const sentQty = bi.originalQty || bi.qty;
        if (serials.length > 0) {
          list.push({
            warehouseItemId: bi.warehouseItemId,
            name: bi.name,
            category: bi.category,
            consumable: bi.consumable,
            deployedQty: serials.length,
            serials,
            outSerials: out,
            inBoxCount: serials.length - out.length,
            returnedSerials: [],
            returnedQty: 0,
            boxId: box.id,
            boxName: box.name,
          });
        } else {
          list.push({
            warehouseItemId: bi.warehouseItemId,
            name: bi.name,
            category: bi.category,
            consumable: bi.consumable,
            deployedQty: sentQty,
            returnedQty: bi.qty,
            inBoxCount: 0,
            returnedSerials: [],
            boxId: box.id,
            boxName: box.name,
          });
        }
      }
    }
    return list;
  });

  const [expandedBox, setExpandedBox] = useState<string | null>(() => visit.boxes[0]?.id || null);
  const [viewMode, setViewMode] = useState<"box" | "category">("box");

  const catLabel = (key: string) => categories.find((c) => c.key === key)?.label || key;

  const itemReturnedQty = (item: CollectItem) =>
    item.serials && item.serials.length > 0
      ? item.inBoxCount + item.returnedSerials.length
      : item.returnedQty;

  const itemMissingQty = (item: CollectItem) => {
    if (item.serials && item.serials.length > 0) {
      return (item.outSerials?.length || 0) - item.returnedSerials.length;
    }
    return item.deployedQty - item.returnedQty;
  };

  const summary = useMemo(() => {
    const totalDeployed = items.reduce((a, i) => a + i.deployedQty, 0);
    const totalReturned = items.reduce((a, i) => a + itemReturnedQty(i), 0);
    const totalConsumed = items.filter((i) => i.consumable).reduce((a, i) => a + (i.deployedQty - itemReturnedQty(i)), 0);
    const totalMissing = items.filter((i) => !i.consumable).reduce((a, i) => a + (i.deployedQty - itemReturnedQty(i)), 0);
    return { totalDeployed, totalReturned, totalConsumed, totalMissing };
  }, [items]);

  const groupedByBox = useMemo(() => {
    const groups: Record<string, { boxName: string; items: CollectItem[] }> = {};
    for (const item of items) {
      if (!groups[item.boxId]) groups[item.boxId] = { boxName: item.boxName, items: [] };
      groups[item.boxId].items.push(item);
    }
    return groups;
  }, [items]);

  const groupedByCategory = useMemo(() => {
    const groups: Record<string, CollectItem[]> = {};
    for (const item of items) {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    }
    return groups;
  }, [items]);

  const setReturnedQty = (warehouseItemId: string, qty: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.warehouseItemId !== warehouseItemId) return item;
        const clamped = Math.max(0, Math.min(qty, item.deployedQty));
        return { ...item, returnedQty: clamped };
      })
    );
  };

  const toggleSerial = (warehouseItemId: string, serial: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.warehouseItemId !== warehouseItemId) return item;
        const returnedSerials = item.returnedSerials.includes(serial)
          ? item.returnedSerials.filter((s) => s !== serial)
          : [...item.returnedSerials, serial];
        return { ...item, returnedSerials };
      })
    );
  };

  const missingNonConsumable = items.filter((i) => !i.consumable && itemMissingQty(i) > 0);

  const handleComplete = () => {
    const collected = items.map((i) => {
      if (i.serials && i.serials.length > 0) {
        return {
          warehouseItemId: i.warehouseItemId,
          qty: itemReturnedQty(i),
          returnedSerials: i.returnedSerials,
          status: (itemMissingQty(i) > 0 ? "missing" : "returned") as "returned" | "consumed" | "missing",
        };
      }
      return {
        warehouseItemId: i.warehouseItemId,
        qty: i.returnedQty,
        status: (i.returnedQty === i.deployedQty ? "returned" : i.consumable ? "consumed" : "missing") as "returned" | "consumed" | "missing",
      };
    });
    onComplete(visit.id, collected);
  };

  const renderSerialItem = (item: CollectItem) => {
    const returned = itemReturnedQty(item);
    const missing = itemMissingQty(item);
    const fullyReturned = missing === 0;
    return (
      <div key={item.warehouseItemId} className="px-3 sm:px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${fullyReturned ? "bg-emerald-100" : "bg-red-100"}`}>
              {fullyReturned ? (
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              ) : (
                <RotateCcw className="w-4 h-4 text-red-600" />
              )}
            </div>
            <div className="min-w-0">
              <span className="text-sm font-medium text-slate-800 truncate block">{item.name}</span>
              <span className="text-[11px] text-slate-400">{catLabel(item.category)} · مُرسل: {item.deployedQty}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${fullyReturned ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
              عاد {returned}
            </span>
            {missing > 0 && <span className="text-[11px] font-bold text-red-600">-{missing}</span>}
          </div>
        </div>
        <div className="mt-2 mr-10 flex flex-wrap gap-1.5">
          {(item.serials || []).map((s) => {
            const out = (item.outSerials || []).includes(s);
            if (!out) {
              return (
                <span key={s} className="text-[10px] font-mono px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-500 flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {s}
                </span>
              );
            }
            const returnedOut = item.returnedSerials.includes(s);
            return (
              <button
                key={s}
                onClick={() => toggleSerial(item.warehouseItemId, s)}
                className={`text-[10px] font-mono px-2 py-1 rounded-lg border transition-colors min-h-[36px] flex items-center gap-1 ${
                  returnedOut
                    ? "bg-emerald-500 text-white border-emerald-500"
                    : "bg-red-500 text-white border-red-500 hover:bg-red-600"
                }`}
              >
                <Tag className="w-3 h-3" />
                {s}
              </button>
            );
          })}
        </div>
        <p className="mr-10 mt-1 text-[10px] text-slate-400">
          الأبيض داخل الصندوق (يعود تلقائياً) — اضغط الأحمر إذا عاد
        </p>
      </div>
    );
  };

  const renderCountItem = (item: CollectItem) => {
    const missing = item.deployedQty - item.returnedQty;
    return (
      <div key={item.warehouseItemId} className="flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-4 py-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
            item.returnedQty === item.deployedQty ? "bg-emerald-100" : item.returnedQty > 0 ? "bg-amber-100" : "bg-slate-100"
          }`}>
            {item.returnedQty === item.deployedQty ? (
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            ) : (
              <RotateCcw className="w-4 h-4 text-amber-600" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-slate-800 truncate">{item.name}</span>
              {item.consumable && (
                <span className="text-[10px] text-amber-600 bg-amber-50 px-1 py-0.5 rounded shrink-0">استهلاكي</span>
              )}
            </div>
            <span className="text-[11px] text-slate-400">{catLabel(item.category)} · مُرسل: {item.deployedQty}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setReturnedQty(item.warehouseItemId, item.returnedQty - 1)}
            disabled={item.returnedQty <= 0}
            className="w-10 h-10 sm:w-9 sm:h-9 rounded-xl bg-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-300 disabled:opacity-30 active:scale-95 transition-all"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className={`w-8 text-center text-sm font-bold ${
            item.returnedQty === item.deployedQty ? "text-emerald-700" : item.returnedQty > 0 ? "text-amber-700" : "text-red-600"
          }`}>
            {item.returnedQty}
          </span>
          <button
            onClick={() => setReturnedQty(item.warehouseItemId, item.returnedQty + 1)}
            disabled={item.returnedQty >= item.deployedQty}
            className="w-10 h-10 sm:w-9 sm:h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 hover:bg-emerald-200 disabled:opacity-30 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
          </button>
          {missing > 0 && !item.consumable && (
            <span className="text-[10px] text-red-500 font-medium">-{missing}</span>
          )}
        </div>
      </div>
    );
  };

  const renderItem = (item: CollectItem) =>
    item.serials && item.serials.length > 0 ? renderSerialItem(item) : renderCountItem(item);

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-start gap-3">
        <button
          onClick={onBack}
          className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-2xl font-bold text-slate-900 leading-tight">جمع العناصر</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 truncate">{visit.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="card p-3 text-center">
          <p className="text-lg sm:text-xl font-bold text-slate-900">{summary.totalDeployed}</p>
          <p className="text-[11px] text-slate-500">المُرسل</p>
        </div>
        <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-3 text-center">
          <p className="text-lg sm:text-xl font-bold text-emerald-700">{summary.totalReturned}</p>
          <p className="text-[11px] text-emerald-600">عاد</p>
        </div>
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-3 text-center">
          <p className="text-lg sm:text-xl font-bold text-amber-700">{summary.totalConsumed}</p>
          <p className="text-[11px] text-amber-600">استُهلك</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 p-3 text-center">
          <p className="text-lg sm:text-xl font-bold text-red-700">{summary.totalMissing}</p>
          <p className="text-[11px] text-red-600">مفقود</p>
        </div>
      </div>

      {missingNonConsumable.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <p className="text-xs sm:text-sm font-medium text-amber-800">
            ⚠️ {missingNonConsumable.length} عناصر غير استهلاكية لم تُرجع بالكامل
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setViewMode("box")}
          className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[44px] ${
            viewMode === "box" ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          حسب الصندوق
        </button>
        <button
          onClick={() => setViewMode("category")}
          className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[44px] ${
            viewMode === "category" ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          حسب الفئة
        </button>
      </div>

      {viewMode === "box" ? (
        <div className="space-y-2">
          {Object.entries(groupedByBox).map(([boxId, group]) => {
            const isExpanded = expandedBox === boxId;
            const boxReturned = group.items.reduce((a, i) => a + itemReturnedQty(i), 0);
            const boxTotal = group.items.reduce((a, i) => a + i.deployedQty, 0);
            return (
              <div key={boxId} className="card overflow-hidden">
                <button
                  onClick={() => setExpandedBox(isExpanded ? null : boxId)}
                  className="w-full flex items-center justify-between px-3 sm:px-4 py-3.5 hover:bg-slate-50 transition-colors min-h-[48px]"
                >
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-semibold text-slate-800">{group.boxName}</span>
                    <span className="text-[11px] text-slate-400">{group.items.length} صنف</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                      boxReturned === boxTotal ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                    }`}>
                      {boxReturned}/{boxTotal}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </button>
                {isExpanded && (
                  <div className="border-t border-slate-100 divide-y divide-slate-50">
                    {group.items.map(renderItem)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {Object.entries(groupedByCategory).map(([cat, catItems]) => {
            const catReturned = catItems.reduce((a, i) => a + itemReturnedQty(i), 0);
            const catTotal = catItems.reduce((a, i) => a + i.deployedQty, 0);
            return (
              <div key={cat} className="card overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800">{catLabel(cat)}</span>
                    <span className="text-[11px] text-slate-400">{catItems.length} صنف</span>
                  </div>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                    catReturned === catTotal ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                  }`}>
                    {catReturned}/{catTotal}
                  </span>
                </div>
                <div className="divide-y divide-slate-50">
                  {catItems.map(renderItem)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={handleComplete}
          className="px-6 py-3 bg-sky-600 text-white rounded-xl text-sm font-medium hover:bg-sky-700 transition-colors min-h-[44px]"
        >
          إنهاء الزيارة وحفظ التقرير
        </button>
        <button
          onClick={onBack}
          className="px-4 py-3 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors min-h-[44px]"
        >
          رجوع
        </button>
      </div>
    </div>
  );
}
