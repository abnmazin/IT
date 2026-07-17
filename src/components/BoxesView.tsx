"use client";

import { useMemo, useState } from "react";
import { Visit, Box, Category } from "@/types";
import { Package, Search, X, Power } from "lucide-react";

interface BoxesViewProps {
  visits: Visit[];
  categories: Category[];
  onSelectBox: (visitId: string, boxId: string) => void;
}

export default function BoxesView({ visits, categories, onSelectBox }: BoxesViewProps) {
  const [search, setSearch] = useState("");

  const activeVisit = visits.find((v) => v.status === "active");
  const activeVisit2 = visits.find((v) => v.status === "active");
  const collectingVisit = visits.find((v) => v.status === "collecting");
  const currentVisit = collectingVisit || activeVisit;

  const boxes = useMemo(() => {
    if (!currentVisit) return [];
    let result = currentVisit.boxes;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (box) =>
          box.name.toLowerCase().includes(q) ||
          box.items.some((i) => i.name.toLowerCase().includes(q))
      );
    }
    return result;
  }, [currentVisit, search]);

  const catLabel = (key: string) => categories.find((c) => c.key === key)?.label || key;

  if (!currentVisit) {
    return (
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">الصناديق</h1>
        </div>
        <div className="py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Power className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-base font-medium text-slate-500 mb-2">لا توجد زيارة مفعلة</p>
          <p className="text-sm text-slate-400">قم بتفعيل زيارة من صفحة الزيارات لعرض صناديقها</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">الصناديق</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {currentVisit.name} — {currentVisit.boxes.length} صندوق
        </p>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="بحث بالاسم أو الصنف..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-3 pr-10 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300 bg-white"
        />
          {search && (
            <button onClick={() => setSearch("")} className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-slate-100 min-w-[36px] min-h-[36px] flex items-center justify-center">
              <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
            </button>
          )}
      </div>

      {boxes.length === 0 ? (
        <div className="py-16 text-center">
          <Package className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-400">لا توجد صناديق</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {boxes.map((box) => {
            const totalQty = box.items.reduce((a, i) => a + i.qty, 0);
            return (
              <button
                key={box.id}
                onClick={() => onSelectBox(currentVisit.id, box.id)}
                className="text-right p-3 sm:p-4 rounded-xl border border-sky-200 bg-white transition-all hover:shadow-md hover:border-sky-300 active:scale-[0.98]"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center">
                    <Package className="w-4 h-4 text-sky-500" />
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800 truncate">{box.name}</h3>
                <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400">{box.items.length} صنف</span>
                  <span className="text-sm font-bold text-slate-700">{totalQty}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
