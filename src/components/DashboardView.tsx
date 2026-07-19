"use client";

import { useMemo } from "react";
import { Package, Warehouse, MapPin, CheckCircle, BarChart3, TrendingUp } from "lucide-react";
import { Visit } from "@/types";

interface DashboardViewProps {
  totalWarehouseItems: number;
  totalWarehouseQty: number;
  activeVisitCount: number;
  totalBoxItems: number;
  visits: Visit[];
  onNavigateToWarehouse: () => void;
  onNavigateToVisits: () => void;
  onNavigateToBoxes: () => void;
}

export default function DashboardView({
  totalWarehouseItems,
  totalWarehouseQty,
  activeVisitCount,
  totalBoxItems,
  visits,
  onNavigateToWarehouse,
  onNavigateToVisits,
  onNavigateToBoxes,
}: DashboardViewProps) {
  const stats = [
    {
      label: "عناصر المخزن",
      value: totalWarehouseQty,
      sub: `${totalWarehouseItems} صنف`,
      icon: Warehouse,
      bg: "bg-sky-50",
      textColor: "text-sky-700",
      iconColor: "text-sky-500",
      onClick: onNavigateToWarehouse,
    },
    {
      label: "الزيارات النشطة",
      value: activeVisitCount,
      sub: "جارية حالياً",
      icon: MapPin,
      bg: "bg-emerald-50",
      textColor: "text-emerald-700",
      iconColor: "text-emerald-500",
      onClick: onNavigateToVisits,
    },
    {
      label: "القطع في الصناديق",
      value: totalBoxItems,
      sub: "معبأة للزيارات",
      icon: Package,
      bg: "bg-amber-50",
      textColor: "text-amber-700",
      iconColor: "text-amber-500",
      onClick: onNavigateToBoxes,
    },
  ];

  const completedVisits = useMemo(() =>
    visits
      .filter((v) => v.status === "completed")
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [visits]
  );

  const visitStats = useMemo(() => {
    return completedVisits.map((visit) => {
      const allItems = visit.boxes.flatMap((b) => b.items);
      const total = allItems.reduce((a, i) => a + i.qty + (i.returnedQty || 0), 0);
      const returned = allItems.filter((i) => i.status === "returned").reduce((a, i) => a + (i.returnedQty || 0), 0);
      const consumed = allItems.filter((i) => i.status === "consumed").reduce((a, i) => a + (i.returnedQty || 0), 0);
      const missing = allItems.filter((i) => i.status === "missing").reduce((a, i) => a + i.qty, 0);
      const safeTotal = returned + consumed + missing || 1;
      return {
        id: visit.id,
        name: visit.name,
        year: visit.year || "",
        hijriDate: visit.hijriDate || "",
        date: visit.date,
        total: safeTotal,
        returned,
        consumed,
        missing,
        returnedPct: Math.round((returned / safeTotal) * 100),
        consumedPct: Math.round((consumed / safeTotal) * 100),
        missingPct: Math.round((missing / safeTotal) * 100),
      };
    });
  }, [completedVisits]);

  const totals = useMemo(() => {
    const t = visitStats.reduce(
      (acc, v) => ({
        returned: acc.returned + v.returned,
        consumed: acc.consumed + v.consumed,
        missing: acc.missing + v.missing,
      }),
      { returned: 0, consumed: 0, missing: 0 }
    );
    const grand = t.returned + t.consumed + t.missing || 1;
    return {
      ...t,
      grand,
      returnedPct: Math.round((t.returned / grand) * 100),
      consumedPct: Math.round((t.consumed / grand) * 100),
      missingPct: Math.round((t.missing / grand) * 100),
    };
  }, [visitStats]);

  return (
    <div className="p-3 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">لوحة التحكم</h1>
        <p className="text-sm text-slate-500 mt-1">نظرة عامة على المخزن والزيارات</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <button
              key={stat.label}
              onClick={stat.onClick}
              className={`${stat.bg} border border-transparent rounded-xl p-2.5 sm:p-4 text-right transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className={`text-[10px] sm:text-xs font-medium ${stat.textColor} opacity-80`}>
                  {stat.label}
                </span>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/60 flex items-center justify-center">
                  <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${stat.iconColor}`} />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{stat.sub}</p>
            </button>
          );
        })}
      </div>

      {visitStats.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-sky-500" />
            <h2 className="text-sm font-semibold text-slate-800">مقارنة الزيارات المكتملة</h2>
          </div>

          {/* Summary totals */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-emerald-50 rounded-lg p-2.5 text-center">
              <p className="text-lg sm:text-xl font-bold text-emerald-700">{totals.returned}</p>
              <p className="text-[10px] text-emerald-600">عاد ({totals.returnedPct}%)</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-2.5 text-center">
              <p className="text-lg sm:text-xl font-bold text-amber-700">{totals.consumed}</p>
              <p className="text-[10px] text-amber-600">استُهلك ({totals.consumedPct}%)</p>
            </div>
            <div className="bg-red-50 rounded-lg p-2.5 text-center">
              <p className="text-lg sm:text-xl font-bold text-red-700">{totals.missing}</p>
              <p className="text-[10px] text-red-600">مفقود ({totals.missingPct}%)</p>
            </div>
          </div>

          {/* Stacked bar chart */}
          <div className="space-y-3">
            {visitStats.map((vs) => (
              <div key={vs.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-medium text-slate-700 block truncate">{vs.name}</span>
                    <div className="flex items-center gap-2">
                      {vs.year && <span className="text-[10px] text-slate-400">{vs.year}</span>}
                      {vs.hijriDate && <span className="text-[10px] text-slate-400">{vs.hijriDate}</span>}
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-500 shrink-0 mr-2">{vs.total} قطعة</span>
                </div>
                <div className="h-6 sm:h-7 rounded-lg overflow-hidden flex bg-slate-100">
                  {vs.returned > 0 && (
                    <div
                      className="bg-emerald-500 transition-all duration-500 flex items-center justify-center relative group"
                      style={{ width: `${vs.returnedPct}%` }}
                    >
                      {vs.returnedPct > 12 && (
                        <span className="text-[9px] text-white font-medium">{vs.returned}</span>
                      )}
                    </div>
                  )}
                  {vs.consumed > 0 && (
                    <div
                      className="bg-amber-500 transition-all duration-500 flex items-center justify-center"
                      style={{ width: `${vs.consumedPct}%` }}
                    >
                      {vs.consumedPct > 12 && (
                        <span className="text-[9px] text-white font-medium">{vs.consumed}</span>
                      )}
                    </div>
                  )}
                  {vs.missing > 0 && (
                    <div
                      className="bg-red-500 transition-all duration-500 flex items-center justify-center"
                      style={{ width: `${vs.missingPct}%` }}
                    >
                      {vs.missingPct > 12 && (
                        <span className="text-[9px] text-white font-medium">{vs.missing}</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  {vs.returned > 0 && <span className="text-[9px] text-emerald-600">{vs.returnedPct}% عاد</span>}
                  {vs.consumed > 0 && <span className="text-[9px] text-amber-600">{vs.consumedPct}% استُهلك</span>}
                  {vs.missing > 0 && <span className="text-[9px] text-red-600">{vs.missingPct}% مفقود</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              <span className="text-[10px] text-slate-500">عاد</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
              <span className="text-[10px] text-slate-500">استُهلك</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-red-500" />
              <span className="text-[10px] text-slate-500">مفقود</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
