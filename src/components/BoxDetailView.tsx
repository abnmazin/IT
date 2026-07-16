"use client";

import { useState } from "react";
import { Box, BoxItem, WarehouseItem, Category } from "@/types";
import { ArrowRight, Plus, Package, Tag, RotateCcw, Trash2, X, Minus } from "lucide-react";

interface BoxDetailViewProps {
  box: Box;
  visitId: string;
  visitName: string;
  isActive: boolean;
  warehouseItems: WarehouseItem[];
  categories: Category[];
  onBack: () => void;
  onFillBox: (visitId: string, boxId: string, items: BoxItem[]) => void;
  onReturnItems: (visitId: string, boxId: string, returned: { warehouseItemId: string; qty: number }[]) => void;
  onUpdateItemQty: (visitId: string, boxId: string, warehouseItemId: string, delta: number) => void;
  onDeleteItem: (visitId: string, boxId: string, warehouseItemId: string) => void;
}

export default function BoxDetailView({
  box,
  visitId,
  visitName,
  isActive,
  warehouseItems,
  categories,
  onBack,
  onFillBox,
  onReturnItems,
  onUpdateItemQty,
  onDeleteItem,
}: BoxDetailViewProps) {
  const [showFill, setShowFill] = useState(false);
  const [showReturn, setShowReturn] = useState(false);
  const [fillItems, setFillItems] = useState<{ warehouseItemId: string; qty: number }[]>([]);
  const [returnItems, setReturnItems] = useState<{ warehouseItemId: string; qty: number }[]>([]);

  const totalQty = box.items.reduce((a, i) => a + i.qty, 0);

  const catLabel = (key: string) => categories.find((c) => c.key === key)?.label || key;

  const handleFill = () => {
    const items: BoxItem[] = fillItems
      .filter((fi) => fi.qty > 0)
      .map((fi) => {
        const whItem = warehouseItems.find((w) => w.id === fi.warehouseItemId);
        return {
          warehouseItemId: fi.warehouseItemId,
          name: whItem?.name || "",
          category: whItem?.category || "Cable",
          serialNumber: whItem?.serialNumber,
          qty: fi.qty,
        };
      });
    if (items.length > 0) {
      onFillBox(visitId, box.id, items);
    }
    setShowFill(false);
    setFillItems([]);
  };

  const handleReturn = () => {
    const returned = returnItems.filter((ri) => ri.qty > 0);
    if (returned.length > 0) {
      onReturnItems(visitId, box.id, returned);
    }
    setShowReturn(false);
    setReturnItems([]);
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">{box.name}</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {visitName} · {totalQty} قطعة · {box.items.length} صنف
          </p>
        </div>
        {isActive && (
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => { setShowFill(true); setShowReturn(false); setFillItems([]); }}
              className="flex items-center gap-2 px-3 py-2.5 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">تعبئة</span>
            </button>
            <button
              onClick={() => { setShowReturn(true); setShowFill(false); setReturnItems(box.items.map((i) => ({ warehouseItemId: i.warehouseItemId, qty: 0 }))); }}
              className="flex items-center gap-2 px-3 py-2.5 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">إرجاع</span>
            </button>
          </div>
        )}
      </div>

      {showFill && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">
              تعبئة {box.name} من المخزن
            </h3>
            <button onClick={() => setShowFill(false)} className="p-1.5 rounded-lg hover:bg-slate-100">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {warehouseItems.filter((w) => w.totalQty > 0).map((whItem) => {
              const existing = fillItems.find((f) => f.warehouseItemId === whItem.id);
              const currentFill = existing?.qty || 0;
              return (
                <div key={whItem.id} className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-2 min-w-0">
                    <Package className="w-4 h-4 text-slate-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-slate-700 truncate block">{whItem.name}</span>
                      <span className="text-[11px] text-slate-400">
                        {catLabel(whItem.category)} · متوفر: {whItem.totalQty}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        if (currentFill > 0) {
                          setFillItems((prev) =>
                            prev.map((f) =>
                              f.warehouseItemId === whItem.id ? { ...f, qty: f.qty - 1 } : f
                            ).filter((f) => f.qty > 0)
                          );
                        }
                      }}
                      className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-300"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-slate-900">{currentFill}</span>
                    <button
                      onClick={() => {
                        if (currentFill < whItem.totalQty) {
                          setFillItems((prev) => {
                            const found = prev.find((f) => f.warehouseItemId === whItem.id);
                            if (found) {
                              return prev.map((f) =>
                                f.warehouseItemId === whItem.id ? { ...f, qty: f.qty + 1 } : f
                              );
                            }
                            return [...prev, { warehouseItemId: whItem.id, qty: 1 }];
                          });
                        }
                      }}
                      className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600 hover:bg-sky-200"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-2">
            <button onClick={handleFill} className="px-4 py-2.5 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700">
              تعبئة الصندوق
            </button>
            <button onClick={() => setShowFill(false)} className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200">
              إلغاء
            </button>
          </div>
        </div>
      )}

      {showReturn && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">
              إرجاع مواد من {box.name} للمخزن
            </h3>
            <button onClick={() => setShowReturn(false)} className="p-1.5 rounded-lg hover:bg-slate-100">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {box.items.map((boxItem) => {
              const ri = returnItems.find((r) => r.warehouseItemId === boxItem.warehouseItemId);
              const returnQty = ri?.qty || 0;
              return (
                <div key={boxItem.warehouseItemId} className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-2 min-w-0">
                    <Package className="w-4 h-4 text-slate-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-slate-700 truncate block">{boxItem.name}</span>
                      <span className="text-[11px] text-slate-400">
                        في الصندوق: {boxItem.qty} · مُرجع: {returnQty}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        if (returnQty > 0) {
                          setReturnItems((prev) =>
                            prev.map((r) =>
                              r.warehouseItemId === boxItem.warehouseItemId ? { ...r, qty: r.qty - 1 } : r
                            )
                          );
                        }
                      }}
                      className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-300"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-slate-900">{returnQty}</span>
                    <button
                      onClick={() => {
                        if (returnQty < boxItem.qty) {
                          setReturnItems((prev) =>
                            prev.map((r) =>
                              r.warehouseItemId === boxItem.warehouseItemId ? { ...r, qty: r.qty + 1 } : r
                            )
                          );
                        }
                      }}
                      className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 hover:bg-emerald-200"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-2">
            <button onClick={handleReturn} className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">
              إرجاع للمخزن
            </button>
            <button onClick={() => setShowReturn(false)} className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200">
              إلغاء
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {box.items.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-400">الصندوق فارغ</p>
            {isActive && (
              <button
                onClick={() => { setShowFill(true); setFillItems([]); }}
                className="mt-3 px-4 py-2 bg-sky-50 text-sky-600 rounded-lg text-sm font-medium hover:bg-sky-100 transition-colors"
              >
                تعبئة من المخزن
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {box.items.map((item) => (
              <div
                key={item.warehouseItemId}
                className="flex items-center justify-between gap-3 px-3 sm:px-5 py-3 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-800 truncate">{item.name}</span>
                      {item.serialNumber && (
                        <span className="text-[11px] text-sky-600 font-mono bg-sky-50 px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0">
                          <Tag className="w-3 h-3" />
                          {item.serialNumber}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">{catLabel(item.category)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {isActive ? (
                    <>
                      <button
                        onClick={() => onUpdateItemQty(visitId, box.id, item.warehouseItemId, -1)}
                        className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-300 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-slate-900">{item.qty}</span>
                      <button
                        onClick={() => onUpdateItemQty(visitId, box.id, item.warehouseItemId, 1)}
                        className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600 hover:bg-sky-200 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteItem(visitId, box.id, item.warehouseItemId)}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <span className="text-sm font-medium text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                      {item.qty}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
