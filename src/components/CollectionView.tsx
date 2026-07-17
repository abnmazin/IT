"use client";

import { useState, useMemo } from "react";
import { Visit, Box, BoxItem, WarehouseItem, Category, ItemCategory } from "@/types";
import { ArrowRight, Package, CheckCircle, Tag, ChevronDown, ChevronUp, RotateCcw, Minus, Plus } from "lucide-react";

interface CollectionViewProps {
  visit: Visit;
  warehouseItems: WarehouseItem[];
  categories: Category[];
  onBack: () => void;
  onComplete: (visitId: string, collected: { warehouseItemId: string; qty: number; status: "returned" | "consumed" }[]) => void;
}

interface CollectItem {
  warehouseItemId: string;
  name: string;
  category: ItemCategory;
  serialNumber?: string;
  deployedQty: number;
  returnedQty: number;
  consumable: boolean;
  boxId: string;
  boxName: string;
}

export default function CollectionView({
  visit,
  warehouseItems,
  categories,
  onBack,
  onComplete,
}: CollectionViewProps) {
  const [items, setItems] = useState<CollectItem[]>(() => {
    const list: CollectItem[] = [];
    for (const box of visit.boxes) {
      for (const bi of box.items) {
        list.push({
          warehouseItemId: bi.warehouseItemId,
          name: bi.name,
          category: bi.category,
          serialNumber: bi.serialNumber,
          deployedQty: bi.qty,
          returnedQty: bi.consumable ? 0 : bi.qty,
          consumable: bi.consumable,
          boxId: box.id,
          boxName: box.name,
        });
      }
    }
    return list;
  });

  const [expandedBox, setExpandedBox] = useState<string | null>(() => visit.boxes[0]?.id || null);
  const [viewMode, setViewMode] = useState<"box" | "category">("box");

  const catLabel = (key: string) => categories.find((c) => c.key === key)?.label || key;

  const summary = useMemo(() => {
    const totalDeployed = items.reduce((a, i) => a + i.deployedQty, 0);
    const totalReturned = items.reduce((a, i) => a + i.returnedQty, 0);
    const totalConsumed = items.filter((i) => i.consumable).reduce((a, i) => a + (i.deployedQty - i.returnedQty), 0);
    const totalMissing = items.filter((i) => !i.consumable).reduce((a, i) => a + (i.deployedQty - i.returnedQty), 0);
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

  const missingNonConsumable = items.filter(
    (i) => !i.consumable && i.returnedQty < i.deployedQty
  );

  const handleComplete = () => {
    const collected = items.map((i) => ({
      warehouseItemId: i.warehouseItemId,
      qty: i.returnedQty,
      status: (i.returnedQty > 0 ? "returned" : "consumed") as "returned" | "consumed",
    }));
    onComplete(visit.id, collected);
  };

  const renderItem = (item: CollectItem) => {
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
              {item.serialNumber && (
                <Tag className="w-3 h-3 text-sky-500 shrink-0" />
              )}
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
        <div className="bg-white rounded-xl border border-slate-200 p-3 text-center">
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
            const boxReturned = group.items.reduce((a, i) => a + i.returnedQty, 0);
            const boxTotal = group.items.reduce((a, i) => a + i.deployedQty, 0);
            return (
              <div key={boxId} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
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
            const catReturned = catItems.reduce((a, i) => a + i.returnedQty, 0);
            const catTotal = catItems.reduce((a, i) => a + i.deployedQty, 0);
            return (
              <div key={cat} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
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
