"use client";

import { useMemo } from "react";
import { Package, Warehouse, MapPin, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { Visit, ActivityLogEntry } from "@/types";

interface DashboardViewProps {
  totalWarehouseItems: number;
  totalWarehouseQty: number;
  activeVisitCount: number;
  totalBoxItems: number;
  visits: Visit[];
  activityLog: ActivityLogEntry[];
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
  activityLog,
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

  const completedVisits = useMemo(() => visits.filter((v) => v.status === "completed"), [visits]);

  const visitStats = useMemo(() => {
    return completedVisits.map((visit) => {
      const allItems = visit.boxes.flatMap((b) => b.items);
      const total = allItems.reduce((a, i) => a + i.qty, 0);
      const returned = allItems.filter((i) => i.status === "returned").reduce((a, i) => a + i.qty, 0);
      const consumed = allItems.filter((i) => i.status === "consumed").reduce((a, i) => a + i.qty, 0);
      const missing = allItems.filter((i) => i.status === "missing").reduce((a, i) => a + i.qty, 0);
      return { id: visit.id, name: visit.name, date: visit.date, total, returned, consumed, missing };
    });
  }, [completedVisits]);

  const maxTotal = useMemo(() => Math.max(...visitStats.map((v) => v.total), 1), [visitStats]);

  const recentActivity = useMemo(() => {
    return [...activityLog]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
  }, [activityLog]);

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
            <CheckCircle className="w-4 h-4 text-sky-500" />
            <h2 className="text-sm font-semibold text-slate-800">مقارنة الزيارات المكتملة</h2>
          </div>
          <div className="space-y-3">
            {visitStats.map((vs) => {
              const returnedPct = vs.total > 0 ? (vs.returned / vs.total) * 100 : 0;
              const consumedPct = vs.total > 0 ? (vs.consumed / vs.total) * 100 : 0;
              const missingPct = vs.total > 0 ? (vs.missing / vs.total) * 100 : 0;
              return (
                <div key={vs.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="min-w-0">
                      <span className="text-xs font-medium text-slate-700 truncate block">{vs.name}</span>
                      <span className="text-[10px] text-slate-400">{vs.date}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 shrink-0">{vs.total} قطعة</span>
                  </div>
                  <div className="h-5 sm:h-6 rounded-lg overflow-hidden flex bg-slate-100">
                    {vs.returned > 0 && (
                      <div
                        className="bg-emerald-500 transition-all duration-500 flex items-center justify-center"
                        style={{ width: `${returnedPct}%` }}
                      >
                        {returnedPct > 15 && <span className="text-[9px] text-white font-medium">{vs.returned}</span>}
                      </div>
                    )}
                    {vs.consumed > 0 && (
                      <div
                        className="bg-amber-500 transition-all duration-500 flex items-center justify-center"
                        style={{ width: `${consumedPct}%` }}
                      >
                        {consumedPct > 15 && <span className="text-[9px] text-white font-medium">{vs.consumed}</span>}
                      </div>
                    )}
                    {vs.missing > 0 && (
                      <div
                        className="bg-red-500 transition-all duration-500 flex items-center justify-center"
                        style={{ width: `${missingPct}%` }}
                      >
                        {missingPct > 15 && <span className="text-[9px] text-white font-medium">{vs.missing}</span>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
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

      {recentActivity.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-800">آخر النشاطات</h2>
          </div>
          <div className="space-y-2">
            {recentActivity.map((entry) => (
              <div key={entry.id} className="flex items-center gap-3 py-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-700 truncate">{entry.description}</p>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">{entry.userName}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
