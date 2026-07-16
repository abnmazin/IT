"use client";

import { Site, Location, InventoryItem } from "@/types";
import { Search, Package, Tag } from "lucide-react";

interface InventoryViewProps {
  sites: Site[];
  locations: Location[];
  items: InventoryItem[];
  searchQuery: string;
}

export default function InventoryView({
  sites,
  locations,
  items,
  searchQuery,
}: InventoryViewProps) {
  const enriched = items.map((item) => {
    const loc = locations.find((l) => l.id === item.locationId);
    const site = loc ? sites.find((s) => s.id === loc.siteId) : undefined;
    return { ...item, locationName: loc?.name ?? "—", siteName: site?.name ?? "—" };
  });

  const filtered = searchQuery
    ? enriched.filter(
        (i) =>
          i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (i.serialNumber &&
            i.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : enriched;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">المخزون</h1>
        <p className="text-sm text-slate-500 mt-1">
          قائمة كاملة بجميع العناصر المتعقبة
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-3 sm:px-5 py-3">
                  الصنف
                </th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-3 sm:px-5 py-3 hidden sm:table-cell">
                  الرقم التسلسلي
                </th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-3 sm:px-5 py-3">
                  الفئة
                </th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-3 sm:px-5 py-3 hidden md:table-cell">
                  المكان
                </th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-3 sm:px-5 py-3 hidden lg:table-cell">
                  الموقع
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-3 sm:px-5 py-3">
                  الكمية
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-3 sm:px-5 py-3">
                  الحالة
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <Search className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">
                      لم يتم العثور على عناصر.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-3 sm:px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                          <Package className="w-4 h-4 text-slate-500" />
                        </div>
                        <span className="text-sm font-medium text-slate-800 truncate">
                          {item.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-5 py-3 hidden sm:table-cell">
                      {item.serialNumber ? (
                        <span className="flex items-center gap-1 text-xs text-sky-600 font-mono bg-sky-50 px-2 py-0.5 rounded w-fit truncate">
                          <Tag className="w-3 h-3" />
                          {item.serialNumber}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-3 sm:px-5 py-3 text-sm text-slate-500">
                      {item.category}
                    </td>
                    <td className="px-3 sm:px-5 py-3 text-sm text-slate-600 hidden md:table-cell">
                      {item.locationName}
                    </td>
                    <td className="px-3 sm:px-5 py-3 text-sm text-slate-500 hidden lg:table-cell">
                      {item.siteName}
                    </td>
                    <td className="px-3 sm:px-5 py-3 text-sm font-medium text-slate-800">
                      {item.serialNumber
                        ? item.currentQty > 0
                          ? "متوفر"
                          : "مستلم"
                        : item.currentQty}
                    </td>
                    <td className="px-3 sm:px-5 py-3">
                      {item.checkedOut > 0 ? (
                        <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                          مستلم
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                          متاح
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
