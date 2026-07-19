"use client";

import { useMemo } from "react";
import { Visit, Category } from "@/types";
import { ArrowRight, Package, CheckCircle, Trash2, AlertTriangle, Tag, FileSpreadsheet } from "lucide-react";
import { exportVisitReportToExcel } from "@/lib/exportExcel";

interface VisitReportProps {
  visit: Visit;
  categories: Category[];
  onBack: () => void;
}

export default function VisitReport({ visit, categories, onBack }: VisitReportProps) {
  const catLabel = (key: string) => categories.find((c) => c.key === key)?.label || key;

  const report = useMemo(() => {
    const allItems = visit.boxes.flatMap((b) =>
      b.items.map((bi) => ({
        ...bi,
        boxName: b.name,
      }))
    );

    const returned = allItems.filter((i) => i.status === "returned");
    const consumed = allItems.filter((i) => i.status === "consumed");
    const missing = allItems.filter((i) => i.status === "missing");
    const unknown = allItems.filter((i) => !i.status);

    return {
      total: allItems.length,
      totalDeployedQty: allItems.reduce((a, i) => a + i.qty, 0),
      returned,
      returnedQty: returned.reduce((a, i) => a + i.qty, 0),
      consumed,
      consumedQty: consumed.reduce((a, i) => a + i.qty, 0),
      missing,
      missingQty: missing.reduce((a, i) => a + i.qty, 0),
      unknown,
      unknownQty: unknown.reduce((a, i) => a + i.qty, 0),
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
          onClick={() => exportVisitReportToExcel(visit, categories)}
          className="flex items-center gap-2 px-3 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-medium hover:bg-emerald-100 transition-colors shrink-0 min-h-[44px]"
        >
          <FileSpreadsheet className="w-4 h-4" />
          تصدير Excel
        </button>
      </div>

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
              <div key={i} className="flex items-center gap-2 text-sm text-red-700">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                <span>{item.name}</span>
                <span className="text-red-500">× {item.qty}</span>
                <span className="text-red-400">({item.boxName})</span>
                {item.serialNumber && (
                  <span className="text-[11px] font-mono text-red-500">{item.serialNumber}</span>
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
                        {item.serialNumber && (
                          <span className="text-[11px] text-sky-600 font-mono bg-sky-50 px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0">
                            <Tag className="w-3 h-3" />
                            {item.serialNumber}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">{catLabel(item.category)}</span>
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
