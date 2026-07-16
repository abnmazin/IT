"use client";

import { Package, MinusCircle, AlertTriangle, CheckCircle2, MapPin } from "lucide-react";
import { Site, Location, InventoryItem } from "@/types";

interface DashboardViewProps {
  sites: Site[];
  locations: Location[];
  items: InventoryItem[];
  siteName: string;
  onNavigateToLocations: () => void;
}

export default function DashboardView({
  sites,
  locations,
  items,
  siteName,
  onNavigateToLocations,
}: DashboardViewProps) {
  const totalLocations = locations.length;
  const totalItems = items.length;
  const totalCheckedOut = items.reduce((a, i) => a + i.checkedOut, 0);
  const lowStockItems = items.filter(
    (i) =>
      i.expectedQty > 1 &&
      i.currentQty > 0 &&
      i.currentQty < i.expectedQty * 0.5
  ).length;

  const stats = [
    {
      label: "إجمالي الأماكن",
      value: totalLocations,
      icon: MapPin,
      bg: "bg-sky-50",
      textColor: "text-sky-700",
      iconColor: "text-sky-500",
    },
    {
      label: "إجمالي العناصر",
      value: totalItems,
      icon: Package,
      bg: "bg-emerald-50",
      textColor: "text-emerald-700",
      iconColor: "text-emerald-500",
    },
    {
      label: "المستلمة",
      value: totalCheckedOut,
      icon: MinusCircle,
      bg: "bg-amber-50",
      textColor: "text-amber-700",
      iconColor: "text-amber-500",
    },
    {
      label: "تنبيهات النقص",
      value: lowStockItems,
      icon: AlertTriangle,
      bg: "bg-red-50",
      textColor: "text-red-700",
      iconColor: "text-red-500",
    },
  ];

  const checkedOutItems = items
    .filter((i) => i.checkedOut > 0)
    .slice(0, 8);

  return (
    <div className="p-3 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">لوحة التحكم</h1>
        <p className="text-sm text-slate-500 mt-1">
          نظرة عامة — {siteName}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`${stat.bg} border border-transparent rounded-xl p-2.5 sm:p-4 text-right transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className={`text-[10px] sm:text-xs font-medium ${stat.textColor} opacity-80`}>
                  {stat.label}
                </span>
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/60 flex items-center justify-center`}>
                  <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${stat.iconColor}`} />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-slate-900">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4">
          <div className="flex flex-wrap items-center justify-between mb-3">
            <h2 className="text-sm sm:font-semibold text-slate-900">
              العناصر المستلمة حالياً
            </h2>
            <button
              onClick={onNavigateToLocations}
              className="text-[11px] sm:text-xs text-sky-600 hover:text-sky-700 font-medium"
            >
              عرض كل الأماكن ←
            </button>
          </div>
          {checkedOutItems.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">
              لا توجد عناصر مستلمة حالياً.
            </p>
          ) : (
            <div className="space-y-2">
              {checkedOutItems.map((item) => {
                const loc = locations.find((l) => l.id === item.locationId);
                return (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between py-2 px-3 rounded-lg bg-slate-50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-700 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {item.serialNumber && `${item.serialNumber} · `}
                        {loc?.name ?? "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.checkedOutBy && (
                        <span className="text-[11px] text-slate-500 truncate">
                          {item.checkedOutBy}
                        </span>
                      )}
                      <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                        مستلم
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-4">
            حالة الأماكن
          </h2>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {locations.map((loc) => {
              const locItems = items.filter((i) => i.locationId === loc.id);
              const totalExpected = locItems.reduce(
                (a, i) => a + i.expectedQty,
                0
              );
              const totalCurrent = locItems.reduce(
                (a, i) => a + i.currentQty,
                0
              );
              const pct =
                totalExpected > 0
                  ? (totalCurrent / totalExpected) * 100
                  : 0;
              return (
                <div key={loc.id} className="py-2 px-3 rounded-lg bg-slate-50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700">
                      {loc.name}
                    </span>
                    <span className="text-xs text-slate-500">
                      {Math.round(pct)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        pct === 100
                          ? "bg-emerald-500"
                          : pct > 50
                          ? "bg-amber-400"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
