"use client";

import { useState, useMemo } from "react";
import { Visit, Box, BoxItem, WarehouseItem, Category, ItemCategory } from "@/types";
import { ArrowRight, Package, CheckCircle, Trash2, AlertTriangle, Tag } from "lucide-react";

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
  qty: number;
  consumable: boolean;
  boxName: string;
  status: "returned" | "consumed" | "missing";
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
          qty: bi.qty,
          consumable: bi.consumable,
          boxName: box.name,
          status: bi.consumable ? "consumed" : "returned",
        });
      }
    }
    return list;
  });

  const catLabel = (key: string) => categories.find((c) => c.key === key)?.label || key;

  const summary = useMemo(() => {
    const returned = items.filter((i) => i.status === "returned");
    const consumed = items.filter((i) => i.status === "consumed");
    const missing = items.filter((i) => i.status === "missing");
    return {
      total: items.length,
      returnedQty: returned.reduce((a, i) => a + i.qty, 0),
      consumedQty: consumed.reduce((a, i) => a + i.qty, 0),
      missingQty: missing.reduce((a, i) => a + i.qty, 0),
      returnedCount: returned.length,
      consumedCount: consumed.length,
      missingCount: missing.length,
    };
  }, [items]);

  const missingNonConsumable = items.filter((i) => i.status === "missing" && !i.consumable);

  const toggleStatus = (idx: number) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== idx) return item;
        if (item.status === "returned") return { ...item, status: "consumed" as const };
        if (item.status === "consumed") return { ...item, status: "missing" as const };
        return { ...item, status: "returned" as const };
      })
    );
  };

  const handleComplete = () => {
    const collected = items.map((i) => ({
      warehouseItemId: i.warehouseItemId,
      qty: i.qty,
      status: i.status as "returned" | "consumed",
    }));
    onComplete(visit.id, collected);
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
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">جمع العناصر — {visit.name}</h1>
            <span className="text-[11px] font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
              جمع العناصر
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            حدد حالة كل صنف: عاد للمخزن، استُهلك، أو مفقود
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-3 text-center">
          <p className="text-xl font-bold text-slate-900">{summary.total}</p>
          <p className="text-[11px] text-slate-500">إجمالي العناصر</p>
        </div>
        <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-3 text-center">
          <p className="text-xl font-bold text-emerald-700">{summary.returnedQty}</p>
          <p className="text-[11px] text-emerald-600">عاد للمخزن</p>
        </div>
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-3 text-center">
          <p className="text-xl font-bold text-amber-700">{summary.consumedQty}</p>
          <p className="text-[11px] text-amber-600">استُهلك</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 p-3 text-center">
          <p className="text-xl font-bold text-red-700">{summary.missingQty}</p>
          <p className="text-[11px] text-red-600">مفقود</p>
        </div>
      </div>

      {missingNonConsumable.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="text-sm font-semibold text-red-800">تنبيه: عناصر غير استهلاكية مفقودة</h3>
          </div>
          <p className="text-sm text-red-700 mb-2">العناصر التالية يجب إرجاعها ولا تُ considers استهلاكية:</p>
          <div className="space-y-1">
            {missingNonConsumable.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-red-700">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                <span>{item.name}</span>
                <span className="text-red-500">× {item.qty}</span>
                <span className="text-red-400">({item.boxName})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between gap-3 px-3 sm:px-5 py-3 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  item.status === "returned" ? "bg-emerald-100" : item.status === "consumed" ? "bg-amber-100" : "bg-red-100"
                }`}>
                  {item.status === "returned" ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  ) : item.status === "consumed" ? (
                    <Trash2 className="w-4 h-4 text-amber-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  )}
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
                    {item.consumable && (
                      <span className="text-[11px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded shrink-0">استهلاكي</span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">{catLabel(item.category)} · {item.boxName} · ×{item.qty}</span>
                </div>
              </div>
              <button
                onClick={() => toggleStatus(idx)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                  item.status === "returned"
                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                    : item.status === "consumed"
                    ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                    : "bg-red-100 text-red-700 hover:bg-red-200"
                }`}
              >
                {item.status === "returned" ? "عاد" : item.status === "consumed" ? "استُهلك" : "مفقود"}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleComplete}
          className="px-6 py-2.5 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
        >
          إنهاء الزيارة وحفظ التقرير
        </button>
        <button
          onClick={onBack}
          className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
        >
          رجوع
        </button>
      </div>
    </div>
  );
}
