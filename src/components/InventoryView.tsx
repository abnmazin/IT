"use client";

import { useState, useMemo } from "react";
import { Site, Location, InventoryItem, Category, ItemCategory } from "@/types";
import {
  Search,
  Package,
  ChevronDown,
  ChevronUp,
  Tag,
  MapPin,
  MinusCircle,
} from "lucide-react";

interface InventoryViewProps {
  sites: Site[];
  locations: Location[];
  items: InventoryItem[];
  categories: Category[];
  searchQuery: string;
}

interface ItemGroup {
  name: string;
  category: ItemCategory;
  totalQty: number;
  totalCheckedOut: number;
  serialNumber?: string;
  locations: {
    locationId: string;
    locationName: string;
    siteName: string;
    currentQty: number;
    checkedOut: number;
    checkedOutBy?: string;
  }[];
}

export default function InventoryView({
  sites,
  locations,
  items,
  categories,
  searchQuery,
}: InventoryViewProps) {
  const [openCategories, setOpenCategories] = useState<Set<ItemCategory>>(
    () => new Set(categories.map((c) => c.key))
  );
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const toggleCategory = (key: ItemCategory) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleItem = (itemName: string) => {
    setExpandedItem((prev) => (prev === itemName ? null : itemName));
  };

  const filtered = useMemo(() => {
    if (!searchQuery) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q) ||
        (i.serialNumber && i.serialNumber.toLowerCase().includes(q))
    );
  }, [items, searchQuery]);

  const grouped = useMemo(() => {
    const catMap = new Map<ItemCategory, Map<string, ItemGroup>>();

    for (const cat of categories) {
      catMap.set(cat.key, new Map());
    }

    for (const item of filtered) {
      const catGroups = catMap.get(item.category);
      if (!catGroups) continue;

      const loc = locations.find((l) => l.id === item.locationId);
      const site = loc ? sites.find((s) => s.id === loc.siteId) : undefined;

      const existing = catGroups.get(item.name);
      if (existing) {
        existing.totalQty += item.currentQty;
        existing.totalCheckedOut += item.checkedOut;
        existing.locations.push({
          locationId: item.locationId,
          locationName: loc?.name ?? "—",
          siteName: site?.name ?? "—",
          currentQty: item.currentQty,
          checkedOut: item.checkedOut,
          checkedOutBy: item.checkedOutBy,
        });
      } else {
        catGroups.set(item.name, {
          name: item.name,
          category: item.category,
          totalQty: item.currentQty,
          totalCheckedOut: item.checkedOut,
          serialNumber: item.serialNumber,
          locations: [
            {
              locationId: item.locationId,
              locationName: loc?.name ?? "—",
              siteName: site?.name ?? "—",
              currentQty: item.currentQty,
              checkedOut: item.checkedOut,
              checkedOutBy: item.checkedOutBy,
            },
          ],
        });
      }
    }

    return catMap;
  }, [filtered, categories, locations, sites]);

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          المخزون
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          قائمة كاملة بجميع العناصر مقسمة حسب الفئة
        </p>
      </div>

      <div className="space-y-2">
        {categories.map((cat) => {
          const catGroups = grouped.get(cat.key);
          const items = catGroups ? Array.from(catGroups.values()) : [];
          const isOpen = openCategories.has(cat.key);
          const totalInCat = items.reduce((a, i) => a + i.totalQty, 0);
          const totalCheckedOutInCat = items.reduce(
            (a, i) => a + i.totalCheckedOut,
            0
          );
          const itemCount = items.length;

          if (itemCount === 0) return null;

          return (
            <div
              key={cat.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden"
            >
              <button
                onClick={() => toggleCategory(cat.key)}
                className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-slate-50 transition-colors text-right"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm sm:text-base font-semibold text-slate-900 truncate">
                      {cat.label}
                    </p>
                    <p className="text-[11px] sm:text-xs text-slate-400">
                      {itemCount} صنف · {totalInCat} قطعة
                      {totalCheckedOutInCat > 0 &&
                        ` · ${totalCheckedOutInCat} مستلمة`}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 mr-2">
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="px-3 pb-3 sm:px-4 sm:pb-4 border-t border-slate-100">
                  <div className="space-y-1.5 pt-3">
                    {items.map((item) => {
                      const isExpanded = expandedItem === item.name;
                      return (
                        <div key={item.name}>
                          <button
                            onClick={() => toggleItem(item.name)}
                            className={`w-full flex items-center justify-between gap-3 py-2.5 px-3 sm:px-4 rounded-lg border transition-all text-right ${
                              isExpanded
                                ? "border-sky-300 bg-sky-50"
                                : "border-transparent bg-slate-50 hover:bg-slate-100"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Package className="w-4 h-4 text-slate-400 shrink-0" />
                              <span className="text-sm font-medium text-slate-800 truncate">
                                {item.name}
                              </span>
                              {item.serialNumber && (
                                <Tag className="w-3 h-3 text-sky-500 shrink-0" />
                              )}
                            </div>
                            <div className="flex items-center gap-3 shrink-0 text-xs">
                              <span className="text-slate-700 font-medium">
                                {item.totalQty}
                              </span>
                              {item.totalCheckedOut > 0 && (
                                <span className="text-amber-600">
                                  {item.totalCheckedOut} مستلم
                                </span>
                              )}
                              <span className="text-slate-400">
                                {item.locations.length} مكان
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-slate-400" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="mt-1.5 mb-1 bg-white rounded-xl border border-slate-200 overflow-hidden">
                              <div className="p-3 sm:p-4">
                                <div className="flex flex-wrap items-center gap-3 mb-3">
                                  <h4 className="text-sm font-semibold text-slate-900">
                                    تفاصيل التوزيع
                                  </h4>
                                  <span className="text-xs text-slate-500">
                                    الكلي: {item.totalQty} قطعة
                                    {item.totalCheckedOut > 0 &&
                                      ` · المستلمة: ${item.totalCheckedOut}`}
                                  </span>
                                </div>

                                <div className="space-y-1.5">
                                  {item.locations.map((loc, idx) => (
                                    <div
                                      key={`${loc.locationId}-${idx}`}
                                      className="flex flex-wrap items-center justify-between gap-2 py-2 px-3 rounded-lg bg-slate-50"
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <div className="min-w-0">
                                          <span className="text-xs sm:text-sm font-medium text-slate-700 block truncate">
                                            {loc.locationName}
                                          </span>
                                          <span className="text-[11px] text-slate-400 block truncate">
                                            {loc.siteName}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 shrink-0">
                                        <span className="text-xs font-medium text-slate-700 bg-slate-200 px-2 py-0.5 rounded">
                                          {loc.currentQty} متاح
                                        </span>
                                        {loc.checkedOut > 0 && (
                                          <span className="text-[11px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                                            {loc.checkedOut} مستلم
                                            {loc.checkedOutBy &&
                                              ` — ${loc.checkedOutBy}`}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
