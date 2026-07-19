"use client";

import { useState, useMemo } from "react";
import { Visit, VisitStatus, WarehouseItem } from "@/types";
import {
  Plus, MapPin, Calendar, X, Play, CheckCircle, Package,
  RotateCcw, AlertTriangle, ShoppingCart, Trash2,
} from "lucide-react";

interface VisitsViewProps {
  visits: Visit[];
  warehouseItems: WarehouseItem[];
  onSelectVisit: (visitId: string) => void;
  onAddVisit: (name: string, date: string, hijriDate?: string) => void;
  onToggleVisit: (visitId: string) => void;
  onReactivateVisit: (visitId: string) => void;
  onFillBoxes: (visitId: string) => void;
  onDeleteVisit?: (visitId: string) => void;
}

const STATUS_CONFIG: Record<VisitStatus, { label: string; color: string; bg: string; border: string }> = {
  inactive: { label: "غير مفعلة", color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200" },
  active: { label: "مفعلة", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-300" },
  collecting: { label: "جمع العناصر", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-300" },
  completed: { label: "مكتملة", color: "text-sky-700", bg: "bg-sky-50", border: "border-sky-300" },
};

export default function VisitsView({
  visits,
  warehouseItems,
  onSelectVisit,
  onAddVisit,
  onToggleVisit,
  onReactivateVisit,
  onFillBoxes,
  onDeleteVisit,
}: VisitsViewProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [formName, setFormName] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formHijri, setFormHijri] = useState("");
  const [shortageVisitId, setShortageVisitId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleAdd = () => {
    if (!formName.trim() || !formDate) return;
    onAddVisit(formName.trim(), formDate, formHijri.trim() || undefined);
    setFormName("");
    setFormDate("");
    setFormHijri("");
    setShowAdd(false);
  };

  const getShortageInfo = (visit: Visit) => {
    const needed: Record<string, number> = {};
    visit.boxes.forEach((b) =>
      b.items.forEach((bi) => {
        needed[bi.warehouseItemId] = (needed[bi.warehouseItemId] || 0) + bi.qty;
      })
    );
    const shortages: { name: string; needed: number; available: number }[] = [];
    for (const [itemId, reqQty] of Object.entries(needed)) {
      if (reqQty <= 0) continue;
      const whItem = warehouseItems.find((w) => w.id === itemId);
      const avail = whItem?.totalQty || 0;
      if (avail < reqQty) {
        shortages.push({ name: whItem?.name || itemId, needed: reqQty, available: avail });
      }
    }
    return shortages;
  };

  const handleFillClick = (visit: Visit) => {
    const shortages = getShortageInfo(visit);
    if (shortages.length > 0) {
      setShortageVisitId(visit.id);
    } else {
      onFillBoxes(visit.id);
    }
  };

  const activeVisits = visits.filter((v) => v.status === "active");
  const collectingVisits = visits.filter((v) => v.status === "collecting");
  const inactiveVisits = visits.filter((v) => v.status === "inactive");
  const completedVisits = visits.filter((v) => v.status === "completed");

  const renderVisit = (visit: Visit) => {
    const cfg = STATUS_CONFIG[visit.status];
    const totalItems = visit.boxes.reduce(
      (a, b) => a + b.items.reduce((c, i) => c + i.qty, 0),
      0
    );
    const templateItems = visit.boxes.reduce(
      (a, b) => a + b.items.length,
      0
    );
    const hasBoxes = visit.boxes.length > 0;
    const shortages = visit.status === "inactive" && hasBoxes ? getShortageInfo(visit) : [];
    const isShortageShowing = shortageVisitId === visit.id;

    return (
      <div
        key={visit.id}
        className={`${cfg.bg} border ${cfg.border} rounded-xl p-2.5 sm:p-4 transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm cursor-pointer`}
        onClick={() => onSelectVisit(visit.id)}
      >
        <div className="flex items-start justify-between mb-2">
          <span className={`text-[10px] sm:text-xs font-medium ${cfg.color} opacity-80`}>
            {cfg.label}
          </span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/60 flex items-center justify-center">
            <MapPin className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${cfg.color}`} />
          </div>
        </div>
        <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate mb-1">
          {visit.name}
        </p>
        <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-500 mb-1">
          <Calendar className="w-3 h-3 shrink-0" />
          <span className="truncate">{visit.date}</span>
        </div>
        {visit.year && (
          <p className="text-[10px] sm:text-[11px] text-slate-400 mb-1">
            {visit.year}
          </p>
        )}
        <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-600">
          <span>{visit.boxes.length} صناديق</span>
          <span>·</span>
          <span>{totalItems > 0 ? `${totalItems} قطعة` : `${templateItems} قالب`}</span>
        </div>

        {/* Shortage warning for inactive visits */}
        {visit.status === "inactive" && hasBoxes && isShortageShowing && shortages.length > 0 && (
          <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-1.5 mb-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="text-[10px] sm:text-[11px] font-medium text-amber-700">نقص في المخزن</span>
            </div>
            {shortages.map((s, i) => (
              <p key={i} className="text-[10px] text-amber-600 mb-0.5">
                {s.name}: يحتاج {s.needed} — متوفر {s.available}
              </p>
            ))}
            <div className="flex gap-1.5 mt-2">
              <button
                onClick={(e) => { e.stopPropagation(); onFillBoxes(visit.id); setShortageVisitId(null); }}
                className="flex-1 px-2 py-1.5 bg-amber-500 text-white rounded text-[10px] font-medium hover:bg-amber-600 min-h-[32px]"
              >
                متابعة بالتناقص
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setShortageVisitId(null); }}
                className="px-2 py-1.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium hover:bg-slate-200 min-h-[32px]"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}

        <div className="mt-2 flex gap-1.5">
          {visit.status === "active" && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleVisit(visit.id); }}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 bg-amber-50 text-amber-600 rounded-lg text-[11px] font-medium hover:bg-amber-100 transition-colors min-h-[44px] active:scale-95"
            >
              <Package className="w-3.5 h-3.5" />
              جمع
            </button>
          )}
          {visit.status === "collecting" && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleVisit(visit.id); }}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 bg-sky-50 text-sky-600 rounded-lg text-[11px] font-medium hover:bg-sky-100 transition-colors min-h-[44px] active:scale-95"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              إنهاء
            </button>
          )}
          {visit.status === "inactive" && hasBoxes && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); handleFillClick(visit); }}
                className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 bg-violet-50 text-violet-600 rounded-lg text-[11px] font-medium hover:bg-violet-100 transition-colors min-h-[44px] active:scale-95"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                تعبئة
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onToggleVisit(visit.id); }}
                className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 bg-emerald-600 text-white rounded-lg text-[11px] font-medium hover:bg-emerald-700 transition-colors min-h-[44px] active:scale-95"
              >
                <Play className="w-3.5 h-3.5" />
                تفعيل
              </button>
            </>
          )}
          {visit.status === "inactive" && !hasBoxes && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleVisit(visit.id); }}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 bg-emerald-600 text-white rounded-lg text-[11px] font-medium hover:bg-emerald-700 transition-colors min-h-[44px] active:scale-95"
            >
              <Play className="w-3.5 h-3.5" />
              تفعيل
            </button>
          )}
          {visit.status === "completed" && (
            <button
              onClick={(e) => { e.stopPropagation(); onReactivateVisit(visit.id); }}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 bg-violet-600 text-white rounded-lg text-[11px] font-medium hover:bg-violet-700 transition-colors min-h-[44px] active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              إعادة تفعيل
            </button>
          )}
          {onDeleteVisit && (
            confirmDeleteId === visit.id ? (
              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => { onDeleteVisit(visit.id); setConfirmDeleteId(null); }}
                  className="px-2 py-2.5 bg-red-600 text-white rounded-lg text-[10px] font-medium hover:bg-red-700 min-h-[36px]"
                >
                  تأكيد
                </button>
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="px-2 py-2.5 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-medium hover:bg-slate-200 min-h-[36px]"
                >
                  إلغاء
                </button>
              </div>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(visit.id); }}
                className="p-2.5 bg-red-50 text-red-400 rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">الزيارات</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            إدارة الزيارات والمناسبتات وتعبئة الصناديق
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-medium hover:bg-sky-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة زيارة</span>
        </button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">إضافة زيارة جديدة</h3>
            <button onClick={() => setShowAdd(false)} className="p-2 rounded-lg hover:bg-slate-100 min-w-[36px] min-h-[36px] flex items-center justify-center">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="اسم الزيارة (مثل: زيارة النجف)"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 min-h-[44px]"
            />
            <input
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 min-h-[44px]"
            />
            <input
              type="text"
              placeholder="التاريخ الهجري (اختياري)"
              value={formHijri}
              onChange={(e) => setFormHijri(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 min-h-[44px]"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="px-4 py-2.5 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700 min-h-[44px]">
              إضافة
            </button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200 min-h-[44px]">
              إلغاء
            </button>
          </div>
        </div>
      )}

      {activeVisits.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-emerald-600 mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            زيارات مفعلة
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
            {activeVisits.map(renderVisit)}
          </div>
        </div>
      )}

      {collectingVisits.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-amber-600 mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            جمع العناصر
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
            {collectingVisits.map(renderVisit)}
          </div>
        </div>
      )}

      {inactiveVisits.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-500 mb-2">زيارات غير مفعلة</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
            {inactiveVisits.map(renderVisit)}
          </div>
        </div>
      )}

      {completedVisits.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-sky-600 mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            زيارات مكتملة
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
            {completedVisits.map(renderVisit)}
          </div>
        </div>
      )}

      {visits.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 text-center">
          <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-400">لا توجد زيارات بعد.</p>
        </div>
      )}
    </div>
  );
}
