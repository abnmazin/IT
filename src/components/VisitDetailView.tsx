"use client";

import { useState, useMemo } from "react";
import { Visit, BoxItem, WarehouseItem, Category, VisitStatus, ActivityLogEntry, ACTIVITY_TYPE_LABELS } from "@/types";
import { ArrowRight, Plus, Package, Play, Square, CheckCircle, X, AlertTriangle, ClipboardList, Clock } from "lucide-react";

interface VisitDetailViewProps {
  visit: Visit;
  warehouseItems: WarehouseItem[];
  categories: Category[];
  activityLog: ActivityLogEntry[];
  onBack: () => void;
  onSelectBox: (boxId: string) => void;
  onToggleVisit: (visitId: string) => void;
  onActivateVisit: (visitId: string, year: string, hijriDate: string) => void;
  onFillBox: (visitId: string, boxId: string, items: BoxItem[]) => void;
  onReturnItems: (visitId: string, boxId: string, returned: { warehouseItemId: string; qty: number }[]) => void;
  onAddBox: (visitId: string, name: string, label: string) => void;
  onDeleteBox: (visitId: string, boxId: string) => void;
  onStartCollect: (visitId: string) => void;
}

const STATUS_CONFIG: Record<VisitStatus, { label: string; color: string; bg: string }> = {
  inactive: { label: "غير مفعلة", color: "text-slate-500", bg: "bg-slate-100" },
  active: { label: "مفعلة", color: "text-emerald-600", bg: "bg-emerald-50" },
  collecting: { label: "جمع العناصر", color: "text-amber-600", bg: "bg-amber-50" },
  completed: { label: "مكتملة", color: "text-sky-600", bg: "bg-sky-50" },
};

const ACTIVITY_COLORS: Record<string, string> = {
  activate_visit: "bg-emerald-50 text-emerald-600",
  fill_box: "bg-sky-50 text-sky-600",
  collect_visit: "bg-amber-50 text-amber-600",
  complete_visit: "bg-sky-50 text-sky-600",
  add_visit: "bg-emerald-50 text-emerald-600",
};

export default function VisitDetailView({
  visit,
  warehouseItems,
  categories,
  activityLog,
  onBack,
  onSelectBox,
  onToggleVisit,
  onActivateVisit,
  onAddBox,
  onDeleteBox,
  onStartCollect,
}: VisitDetailViewProps) {
  const [showAddBox, setShowAddBox] = useState(false);
  const [showActivateConfirm, setShowActivateConfirm] = useState(false);
  const [activateYear, setActivateYear] = useState(new Date().getFullYear().toString());
  const [activateHijri, setActivateHijri] = useState("");
  const [boxName, setBoxName] = useState("");
  const [boxLabel, setBoxLabel] = useState("");
  const [showActivity, setShowActivity] = useState(false);

  const cfg = STATUS_CONFIG[visit.status];
  const isActive = visit.status === "active";
  const isCollecting = visit.status === "collecting";
  const isInactive = visit.status === "inactive";
  const isCompleted = visit.status === "completed";

  const totalItems = visit.boxes.reduce(
    (a, b) => a + b.items.reduce((c, i) => c + i.qty, 0),
    0
  );

  const visitActivity = useMemo(() => {
    return activityLog
      .filter((e) => e.visitId === visit.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [activityLog, visit.id]);

  const handleAddBox = () => {
    if (!boxName.trim()) return;
    onAddBox(visit.id, boxName.trim(), boxLabel.trim());
    setBoxName("");
    setBoxLabel("");
    setShowAddBox(false);
  };

  const formatTime = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
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
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg sm:text-2xl font-bold text-slate-900 leading-tight">{visit.name}</h1>
            <span className={`text-[11px] font-medium ${cfg.color} ${cfg.bg} px-2 py-0.5 rounded-md`}>
              {cfg.label}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {visit.date}{visit.hijriDate ? ` (${visit.hijriDate})` : ""} · {visit.boxes.length} صناديق · {totalItems} قطعة
          </p>
        </div>
        <div className="flex gap-1.5 shrink-0">
          {isInactive && (
            <button
              onClick={() => setShowActivateConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors min-h-[44px] active:scale-95"
            >
              <Play className="w-4 h-4" />
              <span className="hidden sm:inline">تفعيل</span>
            </button>
          )}
          {isActive && (
            <>
              <button
                onClick={() => onStartCollect(visit.id)}
                className="flex items-center gap-1.5 px-3 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 transition-colors min-h-[44px] active:scale-95"
              >
                <ClipboardList className="w-4 h-4" />
                <span className="hidden sm:inline">جمع</span>
              </button>
              <button
                onClick={() => onToggleVisit(visit.id)}
                className="flex items-center gap-1.5 px-3 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors min-h-[44px] active:scale-95"
              >
                <Square className="w-4 h-4" />
                <span className="hidden sm:inline">إيقاف</span>
              </button>
            </>
          )}
          {isCompleted && null}
        </div>
      </div>

      {showActivateConfirm && (
        <div className="bg-white rounded-xl border border-emerald-200 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-semibold text-slate-900">تأكيد تفعيل الزيارة</h3>
          </div>
          <p className="text-sm text-slate-600">
            سيتم تفعيل الزيارة "<strong>{visit.name}</strong>" وفتح الصناديق للتعبئة.
            {visit.boxes.length > 0 && ` يوجد ${visit.boxes.length} صندوق جاهز.`}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-500 mb-1 block">السنة</label>
              <input
                type="text"
                value={activateYear}
                onChange={(e) => setActivateYear(e.target.value)}
                placeholder="مثال: 2026"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-500 mb-1 block">التاريخ الهجري (اختياري)</label>
              <input
                type="text"
                value={activateHijri}
                onChange={(e) => setActivateHijri(e.target.value)}
                placeholder="مثال: 1448 شوال"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { onActivateVisit(visit.id, activateYear, activateHijri); setShowActivateConfirm(false); }}
              className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 min-h-[44px]"
            >
              تفعيل
            </button>
            <button
              onClick={() => setShowActivateConfirm(false)}
              className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 min-h-[44px]"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {(isActive || isInactive) && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowAddBox(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            إضافة صندوق
          </button>
          {visitActivity.length > 0 && (
            <button
              onClick={() => setShowActivity(!showActivity)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[44px] ${
                showActivity ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Clock className="w-4 h-4" />
              سجل النشاط ({visitActivity.length})
            </button>
          )}
        </div>
      )}

      {showAddBox && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">إضافة صندوق جديد</h3>
            <button onClick={() => setShowAddBox(false)} className="p-2 rounded-lg hover:bg-slate-100 min-w-[36px] min-h-[36px] flex items-center justify-center">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="اسم الصندوق"
              value={boxName}
              onChange={(e) => setBoxName(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 min-h-[44px]"
            />
            <input
              type="text"
              placeholder="الوصف (اختياري)"
              value={boxLabel}
              onChange={(e) => setBoxLabel(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 min-h-[44px]"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAddBox} className="px-4 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-medium hover:bg-sky-700 min-h-[44px]">
              إضافة
            </button>
            <button onClick={() => setShowAddBox(false)} className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 min-h-[44px]">
              إلغاء
            </button>
          </div>
        </div>
      )}

      {showActivity && visitActivity.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-700">سجل نشاط الزيارة</h3>
          </div>
          <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
            {visitActivity.map((entry) => (
              <div key={entry.id} className="px-3 sm:px-4 py-2.5 flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full shrink-0 ${ACTIVITY_COLORS[entry.type] || "bg-slate-300"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-slate-700 truncate">{entry.description}</p>
                  <p className="text-[11px] text-slate-400">{entry.userName}</p>
                </div>
                <span className="text-[11px] text-slate-400 shrink-0" dir="ltr">{formatTime(entry.timestamp)}</span>
              </div>
            ))}
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
              className="bg-slate-50 border border-transparent rounded-xl p-2.5 sm:p-4 transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm cursor-pointer min-h-[80px]"
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
          <div className="col-span-full bg-white rounded-xl border border-slate-200 p-8 sm:p-12 text-center">
            <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">لا توجد صناديق بعد — أضف صندوقاً للبدء</p>
          </div>
        )}
      </div>
    </div>
  );
}
