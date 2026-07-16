"use client";

import { useState } from "react";
import { Visit, BoxItem, WarehouseItem, Category, VisitStatus } from "@/types";
import { ArrowRight, Plus, Package, Play, Square, CheckCircle, X } from "lucide-react";

interface VisitDetailViewProps {
  visit: Visit;
  warehouseItems: WarehouseItem[];
  categories: Category[];
  onBack: () => void;
  onSelectBox: (boxId: string) => void;
  onToggleVisit: (visitId: string) => void;
  onFillBox: (visitId: string, boxId: string, items: BoxItem[]) => void;
  onReturnItems: (visitId: string, boxId: string, returned: { warehouseItemId: string; qty: number }[]) => void;
  onAddBox: (visitId: string, name: string, label: string) => void;
  onDeleteBox: (visitId: string, boxId: string) => void;
}

const STATUS_CONFIG: Record<VisitStatus, { label: string; color: string; bg: string }> = {
  inactive: { label: "غير مفعلة", color: "text-slate-500", bg: "bg-slate-100" },
  active: { label: "مفعلة", color: "text-emerald-600", bg: "bg-emerald-50" },
  completed: { label: "مكتملة", color: "text-sky-600", bg: "bg-sky-50" },
};

export default function VisitDetailView({
  visit,
  warehouseItems,
  categories,
  onBack,
  onSelectBox,
  onToggleVisit,
  onAddBox,
  onDeleteBox,
}: VisitDetailViewProps) {
  const [showAddBox, setShowAddBox] = useState(false);
  const [boxName, setBoxName] = useState("");
  const [boxLabel, setBoxLabel] = useState("");

  const cfg = STATUS_CONFIG[visit.status];
  const isActive = visit.status === "active";

  const totalItems = visit.boxes.reduce(
    (a, b) => a + b.items.reduce((c, i) => c + i.qty, 0),
    0
  );

  const handleAddBox = () => {
    if (!boxName.trim()) return;
    onAddBox(visit.id, boxName.trim(), boxLabel.trim());
    setBoxName("");
    setBoxLabel("");
    setShowAddBox(false);
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
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">{visit.name}</h1>
            <span className={`text-[11px] font-medium ${cfg.color} ${cfg.bg} px-2 py-1 rounded-md`}>
              {cfg.label}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {visit.date} · {visit.boxes.length} صناديق · {totalItems} قطعة
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          {isActive && (
            <button
              onClick={() => onToggleVisit(visit.id)}
              className="flex items-center gap-2 px-3 py-2.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
            >
              <Square className="w-4 h-4" />
              <span className="hidden sm:inline">إيقاف</span>
            </button>
          )}
          {!isActive && (
            <button
              onClick={() => onToggleVisit(visit.id)}
              className="flex items-center gap-2 px-3 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
            >
              <Play className="w-4 h-4" />
              <span className="hidden sm:inline">تفعيل</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setShowAddBox(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
        >
          <Plus className="w-4 h-4" />
          إضافة صندوق
        </button>
      </div>

      {showAddBox && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">إضافة صندوق جديد</h3>
            <button onClick={() => setShowAddBox(false)} className="p-1.5 rounded-lg hover:bg-slate-100">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="اسم الصندوق"
              value={boxName}
              onChange={(e) => setBoxName(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <input
              type="text"
              placeholder="الوصف (اختياري)"
              value={boxLabel}
              onChange={(e) => setBoxLabel(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAddBox} className="px-4 py-2.5 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700">
              إضافة
            </button>
            <button onClick={() => setShowAddBox(false)} className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200">
              إلغاء
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
        {visit.boxes.map((box) => {
          const boxTotal = box.items.reduce((a, i) => a + i.qty, 0);
          return (
            <div
              key={box.id}
              onClick={() => onSelectBox(box.id)}
              className="bg-slate-50 border border-transparent rounded-xl p-2.5 sm:p-4 transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-[10px] sm:text-xs font-medium text-slate-500 truncate">
                  {box.label || "صندوق"}
                </span>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/60 flex items-center justify-center shrink-0">
                  <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" />
                </div>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate mb-1">
                {box.name}
              </p>
              <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-600">
                <span>{boxTotal} قطعة</span>
                <span>·</span>
                <span>{box.items.length} صنف</span>
              </div>
            </div>
          );
        })}

        {visit.boxes.length === 0 && (
          <div className="col-span-full bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">لا توجد صناديق بعد — أضف صندوقاً للبدء</p>
          </div>
        )}
      </div>
    </div>
  );
}
