"use client";

import { useState } from "react";
import { Visit, VisitStatus } from "@/types";
import { Plus, MapPin, Calendar, ChevronLeft, X, Play, Square, CheckCircle } from "lucide-react";

interface VisitsViewProps {
  visits: Visit[];
  onSelectVisit: (visitId: string) => void;
  onAddVisit: (name: string, date: string) => void;
  onToggleVisit: (visitId: string) => void;
}

const STATUS_CONFIG: Record<VisitStatus, { label: string; color: string; bg: string }> = {
  inactive: { label: "غير مفعلة", color: "text-slate-500", bg: "bg-slate-100" },
  active: { label: "مفعلة", color: "text-emerald-600", bg: "bg-emerald-50" },
  completed: { label: "مكتملة", color: "text-sky-600", bg: "bg-sky-50" },
};

export default function VisitsView({
  visits,
  onSelectVisit,
  onAddVisit,
  onToggleVisit,
}: VisitsViewProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [formName, setFormName] = useState("");
  const [formDate, setFormDate] = useState("");

  const handleAdd = () => {
    if (!formName.trim() || !formDate) return;
    onAddVisit(formName.trim(), formDate);
    setFormName("");
    setFormDate("");
    setShowAdd(false);
  };

  const activeVisits = visits.filter((v) => v.status === "active");
  const inactiveVisits = visits.filter((v) => v.status === "inactive");
  const completedVisits = visits.filter((v) => v.status === "completed");

  const renderVisit = (visit: Visit) => {
    const cfg = STATUS_CONFIG[visit.status];
    const totalItems = visit.boxes.reduce(
      (a, b) => a + b.items.reduce((c, i) => c + i.qty, 0),
      0
    );
    return (
      <div
        key={visit.id}
        className="bg-white rounded-xl border border-slate-200 overflow-hidden"
      >
        <button
          onClick={() => onSelectVisit(visit.id)}
          className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-right"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
              <MapPin className={`w-5 h-5 ${cfg.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{visit.name}</p>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <Calendar className="w-3 h-3" />
                <span>{visit.date}</span>
                <span>·</span>
                <span>{visit.boxes.length} صناديق</span>
                <span>·</span>
                <span>{totalItems} قطعة</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-[11px] font-medium ${cfg.color} ${cfg.bg} px-2 py-1 rounded-md`}>
              {cfg.label}
            </span>
            <ChevronLeft className="w-4 h-4 text-slate-400" />
          </div>
        </button>

        <div className="px-4 pb-4 flex flex-wrap gap-2">
          {visit.boxes.map((box) => {
            const boxItems = box.items.reduce((a, i) => a + i.qty, 0);
            return (
              <div
                key={box.id}
                className="bg-slate-50 rounded-lg px-3 py-1.5 text-xs text-slate-600"
              >
                📦 {box.name} ({boxItems})
              </div>
            );
          })}
        </div>

        <div className="px-4 pb-4">
          {visit.status === "active" && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleVisit(visit.id); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
            >
              <Square className="w-4 h-4" />
              إيقاف الزيارة
            </button>
          )}
          {visit.status === "inactive" && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleVisit(visit.id); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
            >
              <Play className="w-4 h-4" />
              تفعيل الزيارة
            </button>
          )}
          {visit.status === "completed" && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleVisit(visit.id); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-sky-50 text-sky-600 rounded-lg text-sm font-medium hover:bg-sky-100 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              إعادة التفعيل
            </button>
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
            <button onClick={() => setShowAdd(false)} className="p-1.5 rounded-lg hover:bg-slate-100">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="اسم الزيارة (مثل: زيارة النجف)"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <input
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="px-4 py-2.5 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700">
              إضافة
            </button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200">
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
          <div className="space-y-2">{activeVisits.map(renderVisit)}</div>
        </div>
      )}

      {inactiveVisits.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-500 mb-2">زيارات غير مفعلة</h2>
          <div className="space-y-2">{inactiveVisits.map(renderVisit)}</div>
        </div>
      )}

      {completedVisits.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-sky-500 mb-2">زيارات مكتملة</h2>
          <div className="space-y-2">{completedVisits.map(renderVisit)}</div>
        </div>
      )}

      {visits.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-400">لا توجد زيارات بعد.</p>
        </div>
      )}
    </div>
  );
}
