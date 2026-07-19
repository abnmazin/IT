"use client";

import { useState } from "react";
import { Visit, Category } from "@/types";
import { CheckCircle, Package, Tag, Calendar, ChevronDown, ChevronUp, AlertTriangle, FileSpreadsheet } from "lucide-react";
import { exportVisitReportToExcel } from "@/lib/exportExcel";

interface CompletedVisitsViewProps {
  visits: Visit[];
  categories: Category[];
  onSelectVisit: (visitId: string) => void;
}

export default function CompletedVisitsView({ visits, categories, onSelectVisit }: CompletedVisitsViewProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const completed = visits.filter((v) => v.status === "completed");

  const catLabel = (key: string) => categories.find((c) => c.key === key)?.label || key;

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (completed.length === 0) {
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
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">الزيارات المكتملة</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          سجل الزيارات المنتهية — {completed.length} زيارة
        </p>
      </div>

      <div className="space-y-3">
        {completed.map((visit) => {
          const isExpanded = expandedId === visit.id;
          const allItems = visit.boxes.flatMap((b) => b.items);
          const totalQty = allItems.reduce((a, i) => a + i.qty, 0);
          const returnedQty = allItems.filter((i) => i.status === "returned").reduce((a, i) => a + i.qty, 0);
          const consumedQty = allItems.filter((i) => i.status === "consumed").reduce((a, i) => a + i.qty, 0);
          const missingQty = allItems.filter((i) => i.status === "missing").reduce((a, i) => a + i.qty, 0);
          const hasMissing = missingQty > 0;

          return (
            <div key={visit.id} className={`bg-white rounded-xl border overflow-hidden transition-colors ${
              hasMissing ? "border-red-200" : "border-slate-200"
            }`}>
              <button
                onClick={() => toggleExpand(visit.id)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-right"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-sky-50 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-5 h-5 text-sky-600" />
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900 truncate">{visit.name}</span>
                      {hasMissing && (
                        <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>{visit.date}</span>
                      {visit.hijriDate && <span>({visit.hijriDate})</span>}
                      <span>·</span>
                      <span>{visit.boxes.length} صناديق</span>
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
                    onClick={(e) => { e.stopPropagation(); exportVisitReportToExcel(visit, categories); }}
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
                  {visit.boxes.map((box) => {
                    const boxReturned = box.items.filter((i) => i.status === "returned").reduce((a, i) => a + i.qty, 0);
                    const boxConsumed = box.items.filter((i) => i.status === "consumed").reduce((a, i) => a + i.qty, 0);
                    const boxMissing = box.items.filter((i) => i.status === "missing").reduce((a, i) => a + i.qty, 0);

                    return (
                      <div key={box.id} className="border-b border-slate-50 last:border-b-0">
                        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-medium text-slate-700">{box.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px]">
                            {boxReturned > 0 && <span className="text-emerald-600">{boxReturned} عاد</span>}
                            {boxConsumed > 0 && <span className="text-amber-600">{boxConsumed} استُهلك</span>}
                            {boxMissing > 0 && <span className="text-red-600">{boxMissing} مفقود</span>}
                          </div>
                        </div>
                        <div className="divide-y divide-slate-50">
                          {box.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-3 px-4 py-2.5">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${
                                  item.status === "returned" ? "bg-emerald-100" : item.status === "consumed" ? "bg-amber-100" : item.status === "missing" ? "bg-red-100" : "bg-slate-100"
                                }`}>
                                  {item.status === "returned" ? (
                                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                                  ) : item.status === "consumed" ? (
                                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                                  ) : item.status === "missing" ? (
                                    <AlertTriangle className="w-3 h-3 text-red-600" />
                                  ) : (
                                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-sm text-slate-700 truncate">{item.name}</span>
                                    {item.serialNumber && (
                                      <Tag className="w-3 h-3 text-sky-500 shrink-0" />
                                    )}
                                  </div>
                                  <span className="text-[11px] text-slate-400">{catLabel(item.category)}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-xs font-bold text-slate-600">×{item.qty}</span>
                                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                                  item.status === "returned" ? "bg-emerald-50 text-emerald-700"
                                  : item.status === "consumed" ? "bg-amber-50 text-amber-700"
                                  : item.status === "missing" ? "bg-red-50 text-red-700"
                                  : "bg-slate-100 text-slate-500"
                                }`}>
                                  {item.status === "returned" ? "عاد" : item.status === "consumed" ? "استُهلك" : item.status === "missing" ? "مفقود" : "—"}
                                </span>
                              </div>
                            </div>
                          ))}
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
    </div>
  );
}
