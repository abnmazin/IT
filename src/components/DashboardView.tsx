"use client";

import { Package, Warehouse, MapPin, MinusCircle } from "lucide-react";

interface DashboardViewProps {
  totalWarehouseItems: number;
  totalWarehouseQty: number;
  activeVisitCount: number;
  totalBoxItems: number;
  onNavigateToWarehouse: () => void;
  onNavigateToVisits: () => void;
  onNavigateToBoxes: () => void;
}

export default function DashboardView({
  totalWarehouseItems,
  totalWarehouseQty,
  activeVisitCount,
  totalBoxItems,
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
    </div>
  );
}
