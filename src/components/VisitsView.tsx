"use client";

import { useState } from "react";
import { Visit, VisitStatus } from "@/types";
import { Plus, MapPin, Calendar, X, Play, Trash2 } from "lucide-react";

interface VisitsViewProps {
  visits: Visit[];
  onSelectVisit: (visitId: string) => void;
  onAddVisit: (name: string, date: string) => void;
  onActivateVisit: (visitId: string, year: string, hijriDate: string) => void;
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
  onSelectVisit,
  onAddVisit,
  onActivateVisit,
  onDeleteVisit,
}: VisitsViewProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [formName, setFormName] = useState("");
  const [formDate, setFormDate] = useState("");
  const [confirmAction, setConfirmAction] = useState<{ visitId: string; action: string } | null>(null);
  const [activateDialog, setActivateDialog] = useState<{ visitId: string; year: string; hijriDate: string } | null>(null);

  const handleAdd = () => {
    if (!formName.trim() || !formDate) return;
    onAddVisit(formName.trim(), formDate);
    setFormName("");
    setFormDate("");
    setShowAdd(false);
  };

  const confirm = (visitId: string, action: string) => {
    setConfirmAction({ visitId, action });
  };

  const isConfirming = (visitId: string, action: string) =>
    confirmAction?.visitId === visitId && confirmAction?.action === action;

  const clearConfirm = () => setConfirmAction(null);

  const activeVisits = visits.filter((v) => v.status === "active");
  const collectingVisits = visits.filter((v) => v.status === "collecting");
  const inactiveVisits = visits.filter((v) => v.status === "inactive" || v.status === "completed");

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
    const isReusable = visit.status === "inactive" || visit.status === "completed";

    const btnBase = "flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-lg text-[11px] font-medium transition-colors min-h-[44px] active:scale-95";

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

        <div className="mt-2 flex gap-1.5" onClick={(e) => e.stopPropagation()}>
          {isReusable && (
            <button
              onClick={() => setActivateDialog({ visitId: visit.id, year: new Date().getFullYear().toString(), hijriDate: "" })}
              className={`${btnBase} bg-emerald-600 text-white hover:bg-emerald-700`}
            >
              <Play className="w-3.5 h-3.5" />
              تفعيل
            </button>
          )}

          {onDeleteVisit && (
            isConfirming(visit.id, "delete") ? (
              <>
                <button onClick={() => { onDeleteVisit(visit.id); clearConfirm(); }} className={`${btnBase} bg-red-600 text-white hover:bg-red-700 flex-none`}>
                  <Trash2 className="w-3.5 h-3.5" />
                  تأكيد
                </button>
                <button onClick={clearConfirm} className={`${btnBase} bg-slate-100 text-slate-600 hover:bg-slate-200 flex-none`}>إلغاء</button>
              </>
            ) : (
              <button onClick={() => confirm(visit.id, "delete")} className={`${btnBase} bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 flex-none`}>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

      {visits.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 text-center">
          <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-400">لا توجد زيارات بعد.</p>
        </div>
      )}

      {activateDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setActivateDialog(null)}>
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">تفعيل الزيارة</h3>
              <button onClick={() => setActivateDialog(null)} className="p-1.5 rounded-lg hover:bg-slate-100">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">السنة</label>
                <input
                  type="text"
                  placeholder="مثال: 2026"
                  value={activateDialog.year}
                  onChange={(e) => setActivateDialog({ ...activateDialog, year: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">التاريخ الهجري *</label>
                <input
                  type="text"
                  placeholder="مثال: 15 محرم 1447"
                  value={activateDialog.hijriDate}
                  onChange={(e) => setActivateDialog({ ...activateDialog, hijriDate: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
                  autoFocus
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (!activateDialog.hijriDate.trim()) return;
                  onActivateVisit(activateDialog.visitId, activateDialog.year.trim(), activateDialog.hijriDate.trim());
                  setActivateDialog(null);
                }}
                disabled={!activateDialog.hijriDate.trim()}
                className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 min-h-[44px] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                تفعيل
              </button>
              <button
                onClick={() => setActivateDialog(null)}
                className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200 min-h-[44px]"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
