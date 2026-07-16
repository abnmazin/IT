"use client";

import { Location, InventoryItem } from "@/types";
import { MapPin, Package, Warehouse, Layers, DoorOpen, HelpCircle, Pin } from "lucide-react";

interface LocationCardProps {
  location: Location;
  items: InventoryItem[];
  siteName: string;
  onClick: () => void;
  onTogglePin: () => void;
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

export default function LocationCard({ location, items, siteName, onClick, onTogglePin }: LocationCardProps) {
  const config = typeConfig[location.type];
  const Icon = config.icon;
  const totalExpected = items.reduce((a, i) => a + i.expectedQty, 0);
  const totalCurrent = items.reduce((a, i) => a + i.currentQty, 0);
  const checkedOut = items.reduce((a, i) => a + i.checkedOut, 0);
  const pct = totalExpected > 0 ? (totalCurrent / totalExpected) * 100 : 0;

  const isPinned = location.pinned;

  const statusBg =
    pct === 100
      ? "bg-emerald-50 border-emerald-200 hover:border-emerald-300"
      : pct > 50
      ? "bg-amber-50 border-amber-200 hover:border-amber-300"
      : "bg-red-50 border-red-200 hover:border-red-300";

  return (
    <button
      onClick={onClick}
      className={`${statusBg} border rounded-xl p-2.5 sm:p-4 text-right transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm cursor-pointer w-full relative group`}
    >
      <div className="flex items-start justify-between mb-2">
        <span className={`text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md ${config.bg} ${config.color}`}>
          {config.label}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin();
            }}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-colors ${
              isPinned
                ? "text-sky-600 bg-sky-100 hover:bg-sky-200"
                : "text-slate-300 hover:text-sky-500 hover:bg-sky-50"
            }`}
            title={isPinned? "إلغاء التثبيت" : "تثبيت"}
          >
            <Pin className={`w-3.5 h-3.5 ${isPinned ? "fill-current" : ""}`} />
          </button>
          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg ${config.bg} flex items-center justify-center`}>
            <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${config.color}`} />
          </div>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">{location.name}</h3>
        {location.label && (
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5 truncate">{location.label}</p>
        )}

        <div className="flex items-center gap-1 mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-slate-500">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate">{siteName}</span>
        </div>
      </div>

      <div className="mt-2 sm:mt-3 flex items-center justify-between">
        <span className="text-[10px] sm:text-xs font-medium text-slate-700">
          {totalCurrent}/{totalExpected}
        </span>
        {checkedOut > 0 && (
          <span className="text-[10px] sm:text-xs text-amber-600 bg-amber-50 px-1 sm:px-1.5 py-0.5 rounded">
            {checkedOut} مستلم
          </span>
        )}
      </div>

      <div className="mt-1.5 sm:mt-2 h-1 bg-white/60 rounded-full overflow-hidden">
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
