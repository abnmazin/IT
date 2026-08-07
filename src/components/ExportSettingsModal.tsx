"use client";

import { useMemo, useState } from "react";
import { X, FileSpreadsheet, Package, ListChecks, Settings2 } from "lucide-react";
import { ExportFilter, ExportOptions, loadExportSettings, saveExportSettings } from "@/lib/exportExcel";

interface ExportSettingsModalProps {
  title: string;
  boxes?: { id: string; name: string }[];
  showFlatToggle?: boolean;
  flatLabel?: string;
  onExport: (opts: ExportOptions) => void;
  onClose: () => void;
}

const FILTERS: { value: ExportFilter; label: string }[] = [
  { value: "all", label: "الكل" },
  { value: "missing", label: "المفقود فقط" },
  { value: "consumed", label: "المستهلك فقط" },
  { value: "returned", label: "العائد فقط" },
];

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 py-2.5 cursor-pointer select-none">
      <span className="min-w-0">
        <span className="block text-sm font-medium text-slate-800">{label}</span>
        {hint && <span className="block text-[11px] text-slate-400 mt-0.5">{hint}</span>}
      </span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${
          checked ? "bg-emerald-500" : "bg-slate-200"
        }`}
        aria-pressed={checked}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
            checked ? "right-0.5" : "right-[18px]"
          }`}
        />
      </button>
    </label>
  );
}

export default function ExportSettingsModal({
  title,
  boxes,
  showFlatToggle = true,
  flatLabel = "كل الأصناف",
  onExport,
  onClose,
}: ExportSettingsModalProps) {
  const saved = useMemo(() => loadExportSettings(), []);
  const [checkedBoxes, setCheckedBoxes] = useState<Set<string>>(
    () => new Set((boxes || []).map((b) => b.id))
  );
  const [includeFlat, setIncludeFlat] = useState(saved.includeFlat);
  const [includeSummary, setIncludeSummary] = useState(saved.includeSummary);
  const [totals, setTotals] = useState(saved.totals);
  const [serials, setSerials] = useState(saved.serials);
  const [filter, setFilter] = useState<ExportFilter>(saved.filter);

  const toggleBox = (id: string) => {
    setCheckedBoxes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllBoxes = (checked: boolean) => {
    setCheckedBoxes(checked ? new Set((boxes || []).map((b) => b.id)) : new Set());
  };

  const handleExport = () => {
    saveExportSettings({ includeFlat, includeSummary, totals, serials, filter });
    onExport({
      includeBoxes: Array.from(checkedBoxes),
      includeFlat,
      includeSummary,
      totals,
      serials,
      filter,
    });
  };

  const allSelected = (boxes || []).length > 0 && checkedBoxes.size === (boxes || []).length;

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 sm:px-5 py-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-slate-900 truncate">{title}</h3>
            <p className="text-[11px] text-slate-400">إعدادات التصدير</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-4">
          {/* Sheet selection */}
          {boxes && boxes.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-sky-500" />
                  <p className="text-sm font-semibold text-slate-800">الأوراق</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleAllBoxes(!allSelected)}
                  className="text-[11px] font-medium text-sky-600 hover:text-sky-700"
                >
                  {allSelected ? "إلغاء الكل" : "تحديد الكل"}
                </button>
              </div>
              <div className="bg-slate-50 rounded-xl border border-slate-200 divide-y divide-slate-100 max-h-40 overflow-y-auto">
                {boxes.map((b) => {
                  const checked = checkedBoxes.has(b.id);
                  return (
                    <label
                      key={b.id}
                      className="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleBox(b.id)}
                        className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                      />
                      <span className="text-xs font-medium text-slate-700 truncate">{b.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Options */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Settings2 className="w-4 h-4 text-violet-500" />
              <p className="text-sm font-semibold text-slate-800">الخيارات</p>
            </div>
            <div className="divide-y divide-slate-100">
              {showFlatToggle && (
                <ToggleRow
                  label={flatLabel}
                  hint="ورقة تجمع كل الأصناف من جميع الصناديق"
                  checked={includeFlat}
                  onChange={setIncludeFlat}
                />
              )}
              <ToggleRow
                label="الملخص التنفيذي"
                hint="ورقة إجماليات في نهاية الملف"
                checked={includeSummary}
                onChange={setIncludeSummary}
              />
              <ToggleRow
                label="صف الإجمالي"
                hint="سطر الإجماليات أسفل كل جدول"
                checked={totals}
                onChange={setTotals}
              />
              <ToggleRow
                label="أعمدة الأرقام المسلسلة"
                hint="فصل الأرقام إلى عائدة ومفقودة"
                checked={serials}
                onChange={setSerials}
              />
            </div>
          </div>

          {/* Filter */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <ListChecks className="w-4 h-4 text-amber-500" />
              <p className="text-sm font-semibold text-slate-800">الفلتر</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFilter(f.value)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors min-h-[38px] ${
                    filter === f.value
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-4 sm:px-5 py-4 border-t border-slate-100 bg-slate-50/60">
          <button
            onClick={handleExport}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 active:scale-[0.98] transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            تصدير الملف
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 bg-white text-slate-600 rounded-xl text-sm font-medium border border-slate-200 hover:bg-slate-50 active:scale-[0.98] transition-all"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
