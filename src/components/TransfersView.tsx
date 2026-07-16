"use client";

import { Transfer } from "@/types";
import { Truck, Calendar } from "lucide-react";

interface TransfersViewProps {
  transfers: Transfer[];
}

export default function TransfersView({ transfers }: TransfersViewProps) {
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
            <div key={tr.id} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-sky-500" />
                  <span className="text-sm font-semibold text-slate-900">عملية نقل</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Calendar className="w-3 h-3" />
                  {tr.date}
                </div>
              </div>
              <div className="space-y-1.5">
                {tr.items.map((item) => (
                  <div key={item.itemId} className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50">
                    <span className="text-sm text-slate-700">{item.itemName}</span>
                    {item.serialNumber && (
                      <span className="text-[11px] text-sky-600 font-mono">{item.serialNumber}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
