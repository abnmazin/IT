"use client";

import { useMemo, useState } from "react";
import { ArchivedVisit, Category, Box, getItemReturnedSerials, getItemMissingSerials } from "@/types";
import { CheckCircle, Package, Tag, Calendar, ChevronDown, ChevronUp, AlertTriangle, FileSpreadsheet } from "lucide-react";
import { exportVisitReportToExcel, exportBoxToExcel, exportCompletedVisitsToExcel } from "@/lib/exportExcel";
import ExportSettingsModal from "@/components/ExportSettingsModal";

interface CompletedVisitsViewProps {
  archivedVisits: ArchivedVisit[];
  categories: Category[];
  onSelectVisit: (visitId: string) => void;
}

interface ItemMetrics {
  deployedQty: number;
  returnedQty: number;
  consumedQty: number;
  missingQty: number;
  status: string;
}

function itemMetrics(item: ArchivedVisit["boxes"][number]["items"][number]): ItemMetrics {
  const deployedQty = item.originalQty || item.qty;
  const returnedQty = item.returnedQty ?? (item.status === "returned" ? item.qty : 0);
  const shortage = deployedQty - returnedQty;
  const consumedQty = item.consumable ? shortage : 0;
  const missingQty = !item.consumable ? shortage : 0;
  const status = item.status || (returnedQty === deployedQty ? "returned" : item.consumable ? "consumed" : "missing");
  return { deployedQty, returnedQty, consumedQty, missingQty, status };
}

type ExportTarget =
  | { type: "archive"; archive: ArchivedVisit }
  | { type: "box"; box: Box; archiveName: string }
  | { type: "log" };

export default function CompletedVisitsView({ archivedVisits, categories }: CompletedVisitsViewProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [exportTarget, setExportTarget] = useState<ExportTarget | null>(null);

  const catLabel = (key: string) => categories.find((c) => c.key === key)?.label || key;

  const nameGroups = useMemo(() => {
    const groups: Record<string, ArchivedVisit[]> = {};
    for (const a of archivedVisits) {
      if (!groups[a.name]) groups[a.name] = [];
      groups[a.name].push(a);
    }
    for (const key of Object.keys(groups)) {
      groups[key].sort((x, y) => new Date(x.archivedAt).getTime() - new Date(y.archivedAt).getTime());
    }
    return groups;
  }, [archivedVisits]);

  const sequenceOf = (archive: ArchivedVisit): { num: number; oldest: boolean } | null => {
    const group = nameGroups[archive.name];
    if (!group || group.length <= 1) return null;
    const idx = group.findIndex((g) => g.id === archive.id);
    return { num: idx + 1, oldest: idx === 0 };
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (archivedVisits.length === 0) {
    return (
      <div className="p-3 sm:p-6 space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">الزيارات المكتملة</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">سجل الزيارات المنتهية وتفاصيلها</p>
        </div>
        <div className="py-20 text-center">
          <CheckCircle className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-400">لا توجد زيارات مكتملة بعد.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">الزيارات المكتملة</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            سجل الزيارات المنتهية — {archivedVisits.length} زيارة
          </p>
        </div>
        <button
          onClick={() => setExportTarget({ type: "log" })}
          className="flex items-center gap-2 px-3 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-medium hover:bg-emerald-100 transition-colors min-h-[44px]"
        >
          <FileSpreadsheet className="w-4 h-4" />
          تصدير السجل
        </button>
      </div>

      <div className="space-y-3">
        {archivedVisits.map((archive) => {
          const isExpanded = expandedId === archive.id;
          const seq = sequenceOf(archive);
          const allItems = archive.boxes.flatMap((b) => b.items);
          const totalQty = allItems.reduce((a, i) => a + itemMetrics(i).deployedQty, 0);
          const returnedQty = allItems.reduce((a, i) => a + itemMetrics(i).returnedQty, 0);
          const consumedQty = allItems.reduce((a, i) => a + itemMetrics(i).consumedQty, 0);
          const missingQty = allItems.reduce((a, i) => a + itemMetrics(i).missingQty, 0);
          const hasMissing = missingQty > 0;

          return (
            <div key={archive.id} className={`bg-white rounded-xl border overflow-hidden transition-colors ${
              hasMissing ? "border-red-200" : "border-slate-200"
            }`}>
              <button
                onClick={() => toggleExpand(archive.id)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-right"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-sky-50 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-5 h-5 text-sky-600" />
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900 truncate">{archive.name}</span>
                      {seq && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                          seq.oldest ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"
                        }`}>
                          {seq.oldest ? "الأقدم" : `#${seq.num}`}
                        </span>
                      )}
                      {hasMissing && (
                        <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>{archive.date}</span>
                      {archive.hijriDate && <span>({archive.hijriDate})</span>}
                      <span>·</span>
                      <span>{archive.boxes.length} صناديق</span>
                      <span>·</span>
                      <span>{totalQty} قطعة</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="hidden sm:flex items-center gap-2 text-[11px]">
                    <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{returnedQty} عاد</span>
                    <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">{consumedQty} استُهلك</span>
                    {hasMissing && (
                      <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded-full">{missingQty} مفقود</span>
                    )}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setExportTarget({ type: "archive", archive }); }}
                    className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-500 hover:text-emerald-600 transition-colors"
                    title="تصدير Excel"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                  </button>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-slate-100">
                  {archive.boxes.map((box) => {
                    const boxReturned = box.items.reduce((a, i) => a + itemMetrics(i).returnedQty, 0);
                    const boxConsumed = box.items.reduce((a, i) => a + itemMetrics(i).consumedQty, 0);
                    const boxMissing = box.items.reduce((a, i) => a + itemMetrics(i).missingQty, 0);

                    return (
                      <div key={box.id} className="border-b border-slate-50 last:border-b-0">
                        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-medium text-slate-700">{box.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 text-[11px]">
                              {boxReturned > 0 && <span className="text-emerald-600">{boxReturned} عاد</span>}
                              {boxConsumed > 0 && <span className="text-amber-600">{boxConsumed} استُهلك</span>}
                              {boxMissing > 0 && <span className="text-red-600">{boxMissing} مفقود</span>}
                            </div>
                            <button
                              onClick={() => setExportTarget({ type: "box", box, archiveName: archive.name })}
                              className="p-1.5 rounded-md hover:bg-emerald-100 text-emerald-500 hover:text-emerald-600 transition-colors"
                              title="تصدير الصندوق"
                            >
                              <FileSpreadsheet className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="divide-y divide-slate-50">
                          {box.items.map((item, idx) => {
                            const m = itemMetrics(item);
                            return (
                              <div key={idx} className="flex items-center justify-between gap-3 px-4 py-2.5">
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${
                                    m.status === "returned" ? "bg-emerald-100" : m.status === "consumed" ? "bg-amber-100" : m.status === "missing" ? "bg-red-100" : "bg-slate-100"
                                  }`}>
                                    {m.status === "returned" ? (
                                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                                    ) : m.status === "consumed" ? (
                                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                                    ) : m.status === "missing" ? (
                                      <AlertTriangle className="w-3 h-3 text-red-600" />
                                    ) : (
                                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-sm text-slate-700 truncate">{item.name}</span>
                                    </div>
                                    <span className="text-[11px] text-slate-400">{catLabel(item.category)}</span>
                                    {item.serials && item.serials.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-0.5">
                                        {getItemReturnedSerials(item).map((s) => (
                                          <span key={s} className="text-[10px] text-emerald-600 font-mono bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                                            <Tag className="w-3 h-3" />
                                            {s}
                                          </span>
                                        ))}
                                        {getItemMissingSerials(item).map((s) => (
                                          <span key={s} className="text-[10px] text-red-600 font-mono bg-red-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                                            <Tag className="w-3 h-3" />
                                            {s}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="text-xs font-bold text-slate-600">×{m.returnedQty}</span>
                                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                                    m.status === "returned" ? "bg-emerald-50 text-emerald-700"
                                    : m.status === "consumed" ? "bg-amber-50 text-amber-700"
                                    : m.status === "missing" ? "bg-red-50 text-red-700"
                                    : "bg-slate-100 text-slate-500"
                                  }`}>
                                    {m.status === "returned" ? "عاد" : m.status === "consumed" ? "استُهلك" : m.status === "missing" ? "مفقود" : "—"}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {exportTarget?.type === "log" && (
        <ExportSettingsModal
          title="تصدير سجل الزيارات المكتملة"
          boxes={archivedVisits.map((a) => ({ id: a.id, name: a.name }))}
          flatLabel="سجل الزيارات (مسطح)"
          onExport={(opts) => {
            exportCompletedVisitsToExcel(archivedVisits, categories, opts);
            setExportTarget(null);
          }}
          onClose={() => setExportTarget(null)}
        />
      )}
      {exportTarget?.type === "archive" && (
        <ExportSettingsModal
          title={`تصدير تقرير الزيارة: ${exportTarget.archive.name}`}
          boxes={exportTarget.archive.boxes.map((b) => ({ id: b.id, name: b.name }))}
          flatLabel="كل الأصناف (مسطح)"
          onExport={(opts) => {
            const a = exportTarget.archive;
            exportVisitReportToExcel(
              { id: a.visitId, name: a.name, date: a.date, hijriDate: a.hijriDate, year: a.year, status: "completed", boxes: a.boxes },
              categories,
              opts
            );
            setExportTarget(null);
          }}
          onClose={() => setExportTarget(null)}
        />
      )}
      {exportTarget?.type === "box" && (
        <ExportSettingsModal
          title={`تصدير الصندوق: ${exportTarget.box.name}`}
          showFlatToggle={false}
          onExport={(opts) => {
            exportBoxToExcel(exportTarget.box, exportTarget.archiveName, categories, opts);
            setExportTarget(null);
          }}
          onClose={() => setExportTarget(null)}
        />
      )}
    </div>
  );
}
