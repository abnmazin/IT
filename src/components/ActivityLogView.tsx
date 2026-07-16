"use client";

import { useState, useMemo } from "react";
import {
  ActivityLogEntry,
  ActivityType,
  ACTIVITY_TYPE_LABELS,
} from "@/types";
import {
  Search,
  LogOut,
  LogIn,
  Truck,
  Plus,
  Trash2,
  Edit2,
  Filter,
  Tag,
} from "lucide-react";

interface ActivityLogViewProps {
  activityLog: ActivityLogEntry[];
}

const TYPE_ICONS: Record<ActivityType, React.ElementType> = {
  checkout: LogOut,
  return: LogIn,
  transfer: Truck,
  add_item: Plus,
  add_location: Plus,
  add_site: Plus,
  add_user: Plus,
  delete_user: Trash2,
  edit_user: Edit2,
  delete_site: Trash2,
  edit_site: Edit2,
  add_category: Tag,
  edit_category: Edit2,
  delete_category: Trash2,
};

const TYPE_COLORS: Record<ActivityType, string> = {
  checkout: "bg-amber-50 text-amber-600",
  return: "bg-emerald-50 text-emerald-600",
  transfer: "bg-sky-50 text-sky-600",
  add_item: "bg-emerald-50 text-emerald-600",
  add_location: "bg-emerald-50 text-emerald-600",
  add_site: "bg-emerald-50 text-emerald-600",
  add_user: "bg-purple-50 text-purple-600",
  delete_user: "bg-red-50 text-red-600",
  edit_user: "bg-blue-50 text-blue-600",
  delete_site: "bg-red-50 text-red-600",
  edit_site: "bg-blue-50 text-blue-600",
  add_category: "bg-emerald-50 text-emerald-600",
  edit_category: "bg-blue-50 text-blue-600",
  delete_category: "bg-red-50 text-red-600",
};

type FilterType = "all" | "checkout" | "return" | "transfer" | "add" | "delete";

export default function ActivityLogView({ activityLog }: ActivityLogViewProps) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");

  const filtered = useMemo(() => {
    let result = [...activityLog].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    if (filterType === "checkout") result = result.filter((e) => e.type === "checkout");
    else if (filterType === "return") result = result.filter((e) => e.type === "return");
    else if (filterType === "transfer") result = result.filter((e) => e.type === "transfer");
    else if (filterType === "add")
      result = result.filter((e) => e.type.startsWith("add_"));
    else if (filterType === "delete")
      result = result.filter(
        (e) => e.type.startsWith("delete_") || e.type.startsWith("edit_")
      );

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.description.toLowerCase().includes(q) ||
          e.userName.toLowerCase().includes(q) ||
          ACTIVITY_TYPE_LABELS[e.type].includes(q)
      );
    }

    return result;
  }, [activityLog, filterType, search]);

  const formatTime = (ts: string) => {
    try {
      const d = new Date(ts);
      const dateStr = d.toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      const timeStr = d.toLocaleTimeString("ar-SA", {
        hour: "2-digit",
        minute: "2-digit",
      });
      return { date: dateStr, time: timeStr };
    } catch {
      return { date: ts, time: "" };
    }
  };

  const filters: { value: FilterType; label: string }[] = [
    { value: "all", label: "الكل" },
    { value: "checkout", label: "سحب" },
    { value: "return", label: "إرجاع" },
    { value: "transfer", label: "نقل" },
    { value: "add", label: "إضافة" },
    { value: "delete", label: "تعديل/حذف" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          سجل النشاط ({activityLog.length})
        </h2>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="بحث في السجل..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pr-9 pl-4 rounded-lg bg-white border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilterType(f.value)}
              className={`px-3 h-9 rounded-lg text-xs font-medium transition-colors ${
                filterType === f.value
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Search className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-400">لا توجد سجلات مطابقة.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((entry) => {
              const Icon = TYPE_ICONS[entry.type];
              const colorClass = TYPE_COLORS[entry.type];
              const { date, time } = formatTime(entry.timestamp);
              return (
                <div
                  key={entry.id}
                  className="px-3 sm:px-5 py-3 flex items-start gap-4 hover:bg-slate-50 transition-colors"
                >
                  <div
                    className={`w-9 h-9 rounded-lg ${colorClass} flex items-center justify-center shrink-0 mt-0.5`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {entry.description}
                      </p>
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${colorClass}`}
                      >
                        {ACTIVITY_TYPE_LABELS[entry.type]}
                      </span>
                    </div>
                    {entry.details && (
                      <p className="text-xs text-slate-400 mt-0.5 truncate">
                        {entry.details}
                      </p>
                    )}
                  </div>
                  <div className="text-left shrink-0">
                    <p className="text-xs font-medium text-slate-600 truncate">
                      {entry.userName}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5" dir="ltr">
                      {date} · {time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
