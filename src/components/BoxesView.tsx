"use client";

import { useMemo, useState } from "react";
import { Visit, Box, Category } from "@/types";
import { Package, MapPin, Search, X } from "lucide-react";

interface BoxesViewProps {
  visits: Visit[];
  categories: Category[];
  onSelectBox: (visitId: string, boxId: string) => void;
}

interface FlatBox {
  visitId: string;
  visitName: string;
  visitStatus: string;
  box: Box;
}

export default function BoxesView({ visits, categories, onSelectBox }: BoxesViewProps) {
  const [search, setSearch] = useState("");

  const allBoxes = useMemo(() => {
    const list: FlatBox[] = [];
    for (const visit of visits) {
      for (const box of visit.boxes) {
        list.push({
          visitId: visit.id,
          visitName: visit.name,
          visitStatus: visit.status,
          box,
        });
      }
    }
    return list;
  }, [visits]);

  const filtered = useMemo(() => {
    if (!search.trim()) return allBoxes;
    const q = search.trim().toLowerCase();
    return allBoxes.filter(
      (b) =>
        b.box.name.toLowerCase().includes(q) ||
        b.visitName.toLowerCase().includes(q) ||
        b.box.items.some((i) => i.name.toLowerCase().includes(q))
    );
  }, [allBoxes, search]);

  const activeBoxes = filtered.filter((b) => b.visitStatus === "active");
  const inactiveBoxes = filtered.filter((b) => b.visitStatus !== "active");

  const catLabel = (key: string) => categories.find((c) => c.key === key)?.label || key;

  const renderBoxCard = (item: FlatBox) => {
    const totalQty = item.box.items.reduce((a, i) => a + i.qty, 0);
    const isActive = item.visitStatus === "active";
    return (
      <button
        key={`${item.visitId}-${item.box.id}`}
        onClick={() => onSelectBox(item.visitId, item.box.id)}
        className={`text-right p-3 sm:p-4 rounded-xl border transition-all hover:shadow-md active:scale-[0.98] ${
          isActive
            ? "bg-white border-sky-200 hover:border-sky-300"
            : "bg-slate-50 border-slate-200 hover:border-slate-300"
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
            <Package className="w-4 h-4 text-slate-500" />
          </div>
          {isActive && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          )}
        </div>
        <h3 className="text-sm font-semibold text-slate-800 truncate">{item.box.name}</h3>
        <div className="flex items-center gap-1.5 mt-1.5">
          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="text-[11px] text-slate-500 truncate">{item.visitName}</span>
        </div>
        <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-slate-100">
          <span className="text-[11px] text-slate-400">{item.box.items.length} صنف</span>
          <span className="text-sm font-bold text-slate-700">{totalQty}</span>
        </div>
      </button>
    );
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">الصناديق</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          وصول سريع لجميع الصناديق — {allBoxes.length} صندوق
        </p>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="بحث بالاسم، الزيارة، أو الصنف..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-10 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-300 bg-white"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute left-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <Package className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-400">لا توجد صناديق</p>
        </div>
      ) : (
        <div className="space-y-6">
          {activeBoxes.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <h2 className="text-sm font-semibold text-slate-700">زيارات مفعلة</h2>
                <span className="text-[11px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">{activeBoxes.length}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {activeBoxes.map(renderBoxCard)}
              </div>
            </div>
          )}
          {inactiveBoxes.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-slate-300" />
                <h2 className="text-sm font-semibold text-slate-700">باقي الصناديق</h2>
                <span className="text-[11px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{inactiveBoxes.length}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {inactiveBoxes.map(renderBoxCard)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
