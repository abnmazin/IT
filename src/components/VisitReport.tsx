"use client";

import { useMemo, useState } from "react";
import { Visit, Category, getItemReturnedSerials, getItemMissingSerials } from "@/types";
import { ArrowRight, Package, CheckCircle, Trash2, AlertTriangle, Tag, FileSpreadsheet } from "lucide-react";
import { exportVisitReportToExcel } from "@/lib/exportExcel";
import ExportSettingsModal from "@/components/ExportSettingsModal";

interface VisitReportProps {
  visit: Visit;
  categories: Category[];
  onBack: () => void;
}

export default function VisitReport({ visit, categories, onBack }: VisitReportProps) {
  const catLabel = (key: string) => categories.find((c) => c.key === key)?.label || key;
  const [showExport, setShowExport] = useState(false);

  const report = useMemo(() => {
    const allItems = visit.boxes.flatMap((b) =>
      b.items.map((bi) => {
        const deployedQty = bi.originalQty || bi.qty;
        const returnedQty = bi.returnedQty ?? (bi.status === "returned" ? bi.qty : 0);
        const shortage = deployedQty - returnedQty;
        const consumedQty = bi.consumable ? shortage : 0;
        const missingQty = !bi.consumable ? shortage : 0;
        const status = bi.status || (returnedQty === deployedQty ? "returned" : bi.consumable ? "consumed" : "missing");
        return { ...bi, deployedQty, returnedQty, consumedQty, missingQty, status, boxName: b.name };
      })
    );

    const consumed = allItems.filter((i) => i.status === "consumed");
    const missing = allItems.filter((i) => i.status === "missing");

    return {
      total: allItems.length,
      totalDeployedQty: allItems.reduce((a, i) => a + i.deployedQty, 0),
      returnedQty: allItems.reduce((a, i) => a + i.returnedQty, 0),
      consumed,
      consumedQty: consumed.reduce((a, i) => a + i.consumedQty, 0),
      missing,
      missingQty: missing.reduce((a, i) => a + i.missingQty, 0),
      unknown: allItems.filter((i) => !i.status),
      unknownQty: allItems.filter((i) => !i.status).reduce((a, i) => a + i.qty, 0),
    };
  }, [visit]);

  const missingNonConsumable = report.missing.filter((i) => !i.consumable);

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
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">تقرير — {visit.name}</h1>
            <span className="text-[11px] font-medium text-sky-600 bg-sky-50 px-2 py-1 rounded-md">
              مكتملة
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {visit.date}{visit.hijriDate ? ` (${visit.hijriDate})` : ""} · أُنهيت
          </p>
        </div>
        <button
          onClick={() => setShowExport(true)}
          className="flex items-center gap-2 px-3 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-medium hover:bg-emerald-100 transition-colors shrink-0 min-h-[44px]"
        >
          <FileSpreadsheet className="w-4 h-4" />
          تصدير Excel
        </button>
      </div>

      {showExport && (
        <ExportSettingsModal
          title={`تصدير تقرير الزيارة: ${visit.name}`}
          boxes={visit.boxes.map((b) => ({ id: b.id, name: b.name }))}
          flatLabel="كل الأصناف (مسطح)"
          onExport={(opts) => {
            exportVisitReportToExcel(visit, categories, opts);
            setShowExport(false);
          }}
          onClose={() => setShowExport(false)}
        />
      )}

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-3 text-center">
          <p className="text-xl font-bold text-slate-900">{report.totalDeployedQty}</p>
          <p className="text-[11px] text-slate-500">إجمالي المُرسل</p>
        </div>
        <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-3 text-center">
          <p className="text-xl font-bold text-emerald-700">{report.returnedQty}</p>
          <p className="text-[11px] text-emerald-600">عاد للمخزن</p>
        </div>
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-3 text-center">
          <p className="text-xl font-bold text-amber-700">{report.consumedQty}</p>
          <p className="text-[11px] text-amber-600">استُهلك</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 p-3 text-center">
          <p className="text-xl font-bold text-red-700">{report.missingQty}</p>
          <p className="text-[11px] text-red-600">مفقود</p>
        </div>
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 text-center">
          <p className="text-xl font-bold text-slate-700">{report.unknownQty}</p>
          <p className="text-[11px] text-slate-500">لم يُحدد</p>
        </div>
      </div>

      {missingNonConsumable.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="text-sm font-semibold text-red-800">تنبيه: عناصر غير استهلاكية مفقودة</h3>
          </div>
          <div className="space-y-1">
            {missingNonConsumable.map((item, i) => (
              <div key={i} className="flex flex-col gap-0.5 text-sm text-red-700">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  <span>{item.name}</span>
                  <span className="text-red-500">× {item.missingQty}</span>
                  <span className="text-red-400">({item.boxName})</span>
                </div>
                {item.serials && item.serials.length > 0 && (
                  <div className="mr-5 flex flex-wrap gap-1">
                    {getItemMissingSerials(item).map((s) => (
                      <span key={s} className="text-[10px] font-mono text-red-500 bg-red-50 px-1.5 py-0.5 rounded">{s}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {visit.boxes.map((box) => {
        const boxReturned = box.items.filter((i) => i.status === "returned");
        const boxConsumed = box.items.filter((i) => i.status === "consumed");
        const boxMissing = box.items.filter((i) => i.status === "missing");
        const boxTotal = box.items.reduce((a, i) => a + i.qty, 0);

        return (
          <div key={box.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-semibold text-slate-900">{box.name}</span>
              </div>
              <span className="text-xs text-slate-500">{boxTotal} قطعة</span>
            </div>
            <div className="divide-y divide-slate-100">
              {box.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      item.status === "returned" ? "bg-emerald-100" : item.status === "consumed" ? "bg-amber-100" : item.status === "missing" ? "bg-red-100" : "bg-slate-100"
                    }`}>
                      {item.status === "returned" ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      ) : item.status === "consumed" ? (
                        <Trash2 className="w-4 h-4 text-amber-600" />
                      ) : item.status === "missing" ? (
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      ) : (
                        <Package className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-800 truncate">{item.name}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">{catLabel(item.category)}</span>
                      {item.serials && item.serials.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
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
                    <span className="text-sm font-bold text-slate-700">×{item.qty}</span>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                      item.status === "returned" ? "bg-emerald-50 text-emerald-700"
                      : item.status === "consumed" ? "bg-amber-50 text-amber-700"
                      : item.status === "missing" ? "bg-red-50 text-red-700"
                      : "bg-slate-100 text-slate-500"
                    }`}>
                      {item.status === "returned" ? "عاد" : item.status === "consumed" ? "استُهلك" : item.status === "missing" ? "مفقود" : "غير محدد"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
