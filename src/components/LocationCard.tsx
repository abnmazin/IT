"use client";

import { Location, InventoryItem } from "@/types";
import { MapPin, Package, Warehouse, Layers, DoorOpen, HelpCircle } from "lucide-react";

interface LocationCardProps {
  location: Location;
  items: InventoryItem[];
  siteName: string;
  onClick: () => void;
}

const typeConfig: Record<
  Location["type"],
  { icon: React.ElementType; label: string; color: string; bg: string }
> = {
  box: { icon: Package, label: "صندوق", color: "text-sky-600", bg: "bg-sky-100" },
  warehouse: { icon: Warehouse, label: "مخزن", color: "text-amber-600", bg: "bg-amber-100" },
  shelf: { icon: Layers, label: "رف", color: "text-emerald-600", bg: "bg-emerald-100" },
  room: { icon: DoorOpen, label: "غرفة", color: "text-purple-600", bg: "bg-purple-100" },
  other: { icon: HelpCircle, label: "أخرى", color: "text-slate-600", bg: "bg-slate-100" },
};

export default function LocationCard({ location, items, siteName, onClick }: LocationCardProps) {
  const config = typeConfig[location.type];
  const Icon = config.icon;
  const totalExpected = items.reduce((a, i) => a + i.expectedQty, 0);
  const totalCurrent = items.reduce((a, i) => a + i.currentQty, 0);
  const checkedOut = items.reduce((a, i) => a + i.checkedOut, 0);
  const pct = totalExpected > 0 ? (totalCurrent / totalExpected) * 100 : 0;

  const statusBg =
    pct === 100
      ? "bg-emerald-50 border-emerald-200 hover:border-emerald-300"
      : pct > 50
      ? "bg-amber-50 border-amber-200 hover:border-amber-300"
      : "bg-red-50 border-red-200 hover:border-red-300";

  return (
    <button
      onClick={onClick}
      className={`${statusBg} border rounded-xl p-5 text-right transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm cursor-pointer w-full`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className={`text-xs font-medium px-2 py-1 rounded-md ${config.bg} ${config.color}`}>
          {config.label}
        </span>
        <div className={`w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${config.color}`} />
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="text-lg font-bold text-slate-900 truncate">{location.name}</h3>
        {location.label && (
          <p className="text-sm text-slate-600 mt-0.5 truncate">{location.label}</p>
        )}

        <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-500">
          <MapPin className="w-3.5 h-3.5" />
          <span className="truncate">{siteName}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-700">
          {totalCurrent}/{totalExpected} عنصر
        </span>
        {checkedOut > 0 && (
          <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
            {checkedOut} مستلم
          </span>
        )}
      </div>

      <div className="mt-2 h-1 bg-white/60 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            pct === 100 ? "bg-emerald-500" : pct > 50 ? "bg-amber-400" : "bg-red-500"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </button>
  );
}
