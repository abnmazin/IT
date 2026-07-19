"use client";

import { useState, useMemo } from "react";
import {
  ActivityLogEntry,
  ActivityType,
  ACTIVITY_TYPE_LABELS,
  Visit,
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
  ClipboardList,
  CheckCircle,
  Calendar,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";

interface ActivityLogViewProps {
  activityLog: ActivityLogEntry[];
  visits: Visit[];
}

const TYPE_ICONS: Record<ActivityType, React.ElementType> = {
  checkout: LogOut,
  return: LogIn,
  transfer: Truck,
  add_item: Plus,
  delete_item: Trash2,
  add_visit: Plus,
  activate_visit: LogIn,
  collect_visit: ClipboardList,
  complete_visit: CheckCircle,
  deactivate_visit: LogOut,
  fill_box: Plus,
  return_items: LogIn,
  add_user: Plus,
  delete_user: Trash2,
  edit_user: Edit2,
  add_category: Tag,
  edit_category: Edit2,
  delete_category: Trash2,
};

const TYPE_COLORS: Record<ActivityType, string> = {
  checkout: "bg-amber-50 text-amber-600",
  return: "bg-emerald-50 text-emerald-600",
  transfer: "bg-sky-50 text-sky-600",
  add_item: "bg-emerald-50 text-emerald-600",
  delete_item: "bg-red-50 text-red-600",
  add_visit: "bg-emerald-50 text-emerald-600",
  activate_visit: "bg-emerald-50 text-emerald-600",
  collect_visit: "bg-amber-50 text-amber-600",
  complete_visit: "bg-sky-50 text-sky-600",
  deactivate_visit: "bg-red-50 text-red-600",
  fill_box: "bg-sky-50 text-sky-600",
  return_items: "bg-amber-50 text-amber-600",
  add_user: "bg-purple-50 text-purple-600",
  delete_user: "bg-red-50 text-red-600",
  edit_user: "bg-blue-50 text-blue-600",
  add_category: "bg-emerald-50 text-emerald-600",
  edit_category: "bg-blue-50 text-blue-600",
  delete_category: "bg-red-50 text-red-600",
};

type FilterType = "all" | "date" | "checkout" | "return" | "transfer" | "visit" | "add" | "delete";

function getVisitLabel(v: Visit): string {
  const parts = [v.name];
  if (v.year) parts.push(v.year);
  else if (v.hijriDate) parts.push(v.hijriDate);
  return parts.join(" — ");
}

export default function ActivityLogView({ activityLog, visits }: ActivityLogViewProps) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [filterDate, setFilterDate] = useState<string>("");
  const [filterVisitId, setFilterVisitId] = useState<string>("All");
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilter = filterType !== "all" || filterVisitId !== "All";

  const filtered = useMemo(() => {
    let result = [...activityLog].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    if (filterType === "date" && filterDate) {
      result = result.filter((e) => e.timestamp.startsWith(filterDate));
    } else if (filterType === "checkout") {
      result = result.filter((e) => e.type === "checkout");
    } else if (filterType === "return") {
      result = result.filter((e) => e.type === "return");
    } else if (filterType === "transfer") {
      result = result.filter((e) => e.type === "transfer");
    } else if (filterType === "visit") {
      result = result.filter((e) =>
        ["activate_visit", "collect_visit", "complete_visit", "fill_box", "return_items"].includes(e.type)
      );
    } else if (filterType === "add") {
      result = result.filter((e) => e.type.startsWith("add_"));
    } else if (filterType === "delete") {
      result = result.filter(
        (e) => e.type.startsWith("delete_") || e.type.startsWith("edit_")
      );
    }

    if (filterVisitId !== "All") {
      result = result.filter((e) => e.visitId === filterVisitId);
    }

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
  }, [activityLog, filterType, filterDate, filterVisitId, search]);

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

  const filters: { value: FilterType; label: string; icon: React.ElementType }[] = [
    { value: "all", label: "الكل", icon: Filter },
    { value: "date", label: "تاريخ", icon: Calendar },
    { value: "visit", label: "زيارات", icon: ClipboardList },
    { value: "checkout", label: "سحب", icon: LogOut },
    { value: "return", label: "إرجاع", icon: LogIn },
    { value: "add", label: "إضافة", icon: Plus },
    { value: "delete", label: "تعديل", icon: Trash2 },
  ];

  return (
    <div className="p-3 sm:p-6 space-y-3 sm:space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">
        سجل النشاط ({filtered.length})
      </h2>

      {/* Search + filter toggle */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="بحث..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pr-9 pl-10 rounded-xl bg-white border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`h-11 px-3 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 shrink-0 ${
            showFilters || hasActiveFilter
              ? "bg-sky-100 text-sky-700"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">فلتر</span>
          {hasActiveFilter && (
            <span className="w-2 h-2 rounded-full bg-sky-500" />
          )}
          {showFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 space-y-3">
          <div>
            <p className="text-[11px] font-medium text-slate-500 mb-2">نوع النشاط</p>
            <div className="flex flex-wrap gap-1.5">
              {filters.map((f) => (
                <button
                  key={f.value}
                  onClick={() => {
                    setFilterType(f.value);
                    if (f.value === "date" && !filterDate) setFilterDate(new Date().toISOString().split("T")[0]);
                  }}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors min-h-[40px] ${
                    filterType === f.value
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <f.icon className="w-3.5 h-3.5" />
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          {filterType === "date" && (
            <div>
              <p className="text-[11px] font-medium text-slate-500 mb-2">اختر تاريخ</p>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full h-11 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300 bg-white"
              />
            </div>
          )}
          {visits.length > 0 && (
            <div>
              <p className="text-[11px] font-medium text-slate-500 mb-2">حسب زيارة</p>
              <select
                value={filterVisitId}
                onChange={(e) => setFilterVisitId(e.target.value)}
                className="w-full h-11 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300 bg-white appearance-none"
              >
                <option value="All">كل الزيارات</option>
                {visits.map((v) => (
                  <option key={v.id} value={v.id}>{getVisitLabel(v)}</option>
                ))}
              </select>
            </div>
          )}
          {hasActiveFilter && (
            <button
              onClick={() => { setFilterType("all"); setFilterVisitId("All"); }}
              className="w-full h-10 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              مسح الفلتر
            </button>
          )}
        </div>
      )}

      {/* Active filter chips */}
      {hasActiveFilter && !showFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          {filterType !== "all" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-sky-50 text-sky-700 rounded-lg text-xs font-medium">
              {filters.find((f) => f.value === filterType)?.label}
              <button onClick={() => setFilterType("all")} className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-sky-100">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filterVisitId !== "All" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-violet-50 text-violet-700 rounded-lg text-xs font-medium truncate max-w-[200px]">
              {visits.find((v) => v.id === filterVisitId)?.name}
              <button onClick={() => setFilterVisitId("All")} className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-violet-100 shrink-0">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Log entries */}
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
                  className="px-3 py-3 sm:px-5 sm:py-4 flex items-start gap-2.5 sm:gap-4 hover:bg-slate-50 transition-colors"
                >
                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg ${colorClass} flex items-center justify-center shrink-0 mt-0.5`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 leading-relaxed">
                      {entry.description}
                    </p>
                    {entry.details && (
                      <p className="text-xs text-slate-400 mt-0.5 truncate">
                        {entry.details}
                      </p>
                    )}
                    <div className="flex items-center gap-x-2 gap-y-1 mt-1.5 flex-wrap">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${colorClass}`}>
                        {ACTIVITY_TYPE_LABELS[entry.type]}
                      </span>
                      <span className="text-[10px] text-slate-400">{entry.userName}</span>
                      <span className="text-[10px] text-slate-300" dir="ltr">
                        {date} · {time}
                      </span>
                    </div>
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
