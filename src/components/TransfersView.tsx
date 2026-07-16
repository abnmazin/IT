"use client";

import { Transfer, Site } from "@/types";
import { Truck, MapPin, Calendar, Tag, ArrowLeft } from "lucide-react";

interface TransfersViewProps {
  transfers: Transfer[];
  sites: Site[];
}

export default function TransfersView({ transfers, sites }: TransfersViewProps) {
  const getSiteName = (id: string) =>
    sites.find((s) => s.id === id)?.name ?? id;

  return (
    <div className="p-3 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">عمليات النقل</h1>
        <p className="text-sm text-slate-500 mt-1">
          سجل نقل العناصر بين المواقع
        </p>
      </div>

      {transfers.length === 0 ? (
        <div className="py-20 text-center">
          <Truck className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-400">لا توجد عمليات نقل بعد.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transfers.map((tr) => (
            <div
              key={tr.id}
              className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center">
                    <Truck className="w-5 h-5 text-sky-500" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="min-w-0 truncate">{getSiteName(tr.toSiteId)}</span>
                      <ArrowLeft className="w-3.5 h-3.5 text-slate-300" />
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="min-w-0 truncate">{getSiteName(tr.fromSiteId)}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                      <Calendar className="w-3 h-3" />
                      {tr.date}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-medium text-sky-600 bg-sky-50 px-2 py-1 rounded-md">
                  {tr.items.length} صنف
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {tr.items.map((ti) => (
                  <span
                    key={ti.itemId}
                    className="flex items-center gap-1.5 text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg"
                  >
                    {ti.itemName}
                    {ti.serialNumber && (
                      <Tag className="w-3 h-3 text-sky-500" />
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
