"use client";

import { useState } from "react";
import { Visit, Box, BoxItem, WarehouseItem, Category, VisitStatus } from "@/types";
import { ArrowRight, Plus, Package, Tag, MapPin, Play, Square, CheckCircle, RotateCcw, Edit3, Trash2, X } from "lucide-react";

interface VisitDetailViewProps {
  visit: Visit;
  warehouseItems: WarehouseItem[];
  categories: Category[];
  onBack: () => void;
  onToggleVisit: (visitId: string) => void;
  onFillBox: (visitId: string, boxId: string, items: BoxItem[]) => void;
  onReturnItems: (visitId: string, boxId: string, returned: { warehouseItemId: string; qty: number }[]) => void;
  onAddBox: (visitId: string, name: string, label: string) => void;
  onDeleteBox: (visitId: string, boxId: string) => void;
}

const STATUS_CONFIG: Record<VisitStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  inactive: { label: "غير مفعلة", color: "text-slate-500", bg: "bg-slate-100", icon: Play },
  active: { label: "مفعلة", color: "text-emerald-600", bg: "bg-emerald-50", icon: Square },
  completed: { label: "مكتملة", color: "text-sky-600", bg: "bg-sky-50", icon: CheckCircle },
};

export default function VisitDetailView({
  visit,
  warehouseItems,
  categories,
  onBack,
  onToggleVisit,
  onFillBox,
  onReturnItems,
  onAddBox,
  onDeleteBox,
}: VisitDetailViewProps) {
  const [showAddBox, setShowAddBox] = useState(false);
  const [boxName, setBoxName] = useState("");
  const [boxLabel, setBoxLabel] = useState("");
  const [selectedBox, setSelectedBox] = useState<string | null>(null);
  const [showFill, setShowFill] = useState(false);
  const [showReturn, setShowReturn] = useState(false);
  const [fillItems, setFillItems] = useState<{ warehouseItemId: string; qty: number }[]>([]);
  const [returnItems, setReturnItems] = useState<{ warehouseItemId: string; qty: number }[]>([]);

  const cfg = STATUS_CONFIG[visit.status];
  const isActive = visit.status === "active";
  const selectedBoxData = visit.boxes.find((b) => b.id === selectedBox);

  const totalItems = visit.boxes.reduce(
    (a, b) => a + b.items.reduce((c, i) => c + i.qty, 0),
    0
  );

  const handleAddBox = () => {
    if (!boxName.trim()) return;
    onAddBox(visit.id, boxName.trim(), boxLabel.trim());
    setBoxName("");
    setBoxLabel("");
    setShowAddBox(false);
  };

  const openFill = (boxId: string) => {
    setSelectedBox(boxId);
    setFillItems([]);
    setShowFill(true);
  };

  const openReturn = (boxId: string) => {
    setSelectedBox(boxId);
    const box = visit.boxes.find((b) => b.id === boxId);
    if (box) {
      setReturnItems(box.items.map((i) => ({ warehouseItemId: i.warehouseItemId, qty: 0 })));
    }
    setShowReturn(true);
  };

  const handleFill = () => {
    if (!selectedBox) return;
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
      onFillBox(visit.id, selectedBox, items);
    }
    setShowFill(false);
    setSelectedBox(null);
  };

  const handleReturn = () => {
    if (!selectedBox) return;
    const returned = returnItems.filter((ri) => ri.qty > 0);
    if (returned.length > 0) {
      onReturnItems(visit.id, selectedBox, returned);
    }
    setShowReturn(false);
    setSelectedBox(null);
  };

  const catLabel = (key: string) => categories.find((c) => c.key === key)?.label || key;

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
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">{visit.name}</h1>
            <span className={`text-[11px] font-medium ${cfg.color} ${cfg.bg} px-2 py-1 rounded-md`}>
              {cfg.label}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {visit.date} · {visit.boxes.length} صناديق · {totalItems} قطعة
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          {isActive && (
            <button
              onClick={() => onToggleVisit(visit.id)}
              className="flex items-center gap-2 px-3 py-2.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
            >
              <Square className="w-4 h-4" />
              <span className="hidden sm:inline">إيقاف</span>
            </button>
          )}
          {!isActive && (
            <button
              onClick={() => onToggleVisit(visit.id)}
              className="flex items-center gap-2 px-3 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
            >
              <Play className="w-4 h-4" />
              <span className="hidden sm:inline">تفعيل</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setShowAddBox(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
        >
          <Plus className="w-4 h-4" />
          إضافة صندوق
        </button>
      </div>

      {showAddBox && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">إضافة صندوق جديد</h3>
            <button onClick={() => setShowAddBox(false)} className="p-1.5 rounded-lg hover:bg-slate-100">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="اسم الصندوق"
              value={boxName}
              onChange={(e) => setBoxName(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <input
              type="text"
              placeholder="الوصف (اختياري)"
              value={boxLabel}
              onChange={(e) => setBoxLabel(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAddBox} className="px-4 py-2.5 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700">
              إضافة
            </button>
            <button onClick={() => setShowAddBox(false)} className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200">
              إلغاء
            </button>
          </div>
        </div>
      )}

      {showFill && selectedBoxData && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">
              تعبئة {selectedBoxData.name} من المخزن
            </h3>
            <button onClick={() => { setShowFill(false); setSelectedBox(null); }} className="p-1.5 rounded-lg hover:bg-slate-100">
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
                              f.warehouseItemId === whItem.id
                                ? { ...f, qty: f.qty - 1 }
                                : f
                            ).filter((f) => f.qty > 0)
                          );
                        }
                      }}
                      className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-300"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-slate-900">{currentFill}</span>
                    <button
                      onClick={() => {
                        if (currentFill < whItem.totalQty) {
                          setFillItems((prev) => {
                            const found = prev.find((f) => f.warehouseItemId === whItem.id);
                            if (found) {
                              return prev.map((f) =>
                                f.warehouseItemId === whItem.id
                                  ? { ...f, qty: f.qty + 1 }
                                  : f
                              );
                            }
                            return [...prev, { warehouseItemId: whItem.id, qty: 1 }];
                          });
                        }
                      }}
                      className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600 hover:bg-sky-200"
                    >
                      +
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
            <button onClick={() => { setShowFill(false); setSelectedBox(null); }} className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200">
              إلغاء
            </button>
          </div>
        </div>
      )}

      {showReturn && selectedBoxData && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">
              إرجاع مواد من {selectedBoxData.name} للمخزن
            </h3>
            <button onClick={() => { setShowReturn(false); setSelectedBox(null); }} className="p-1.5 rounded-lg hover:bg-slate-100">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {selectedBoxData.items.map((boxItem) => {
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
                              r.warehouseItemId === boxItem.warehouseItemId
                                ? { ...r, qty: r.qty - 1 }
                                : r
                            )
                          );
                        }
                      }}
                      className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-300"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-slate-900">{returnQty}</span>
                    <button
                      onClick={() => {
                        if (returnQty < boxItem.qty) {
                          setReturnItems((prev) =>
                            prev.map((r) =>
                              r.warehouseItemId === boxItem.warehouseItemId
                                ? { ...r, qty: r.qty + 1 }
                                : r
                            )
                          );
                        }
                      }}
                      className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 hover:bg-emerald-200"
                    >
                      +
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
            <button onClick={() => { setShowReturn(false); setSelectedBox(null); }} className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200">
              إلغاء
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {visit.boxes.map((box) => {
          const boxTotal = box.items.reduce((a, i) => a + i.qty, 0);
          return (
            <div key={box.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-slate-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{box.name}</p>
                    {box.label && <p className="text-xs text-slate-400 truncate">{box.label}</p>}
                    <p className="text-xs text-slate-500 mt-0.5">{boxTotal} قطعة · {box.items.length} صنف</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {isActive && (
                    <>
                      <button
                        onClick={() => openFill(box.id)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-sky-50 text-sky-600 rounded-lg text-xs font-medium hover:bg-sky-100 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        تعبئة
                      </button>
                      <button
                        onClick={() => openReturn(box.id)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-medium hover:bg-emerald-100 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        إرجاع
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => onDeleteBox(visit.id, box.id)}
                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {box.items.length > 0 && (
                <div className="px-4 pb-4">
                  <div className="space-y-1.5">
                    {box.items.map((item) => (
                      <div
                        key={item.warehouseItemId}
                        className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg bg-slate-50"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Package className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="text-xs sm:text-sm text-slate-700 truncate">{item.name}</span>
                          {item.serialNumber && (
                            <Tag className="w-3 h-3 text-sky-500 shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-medium bg-slate-200 px-2 py-0.5 rounded">
                            {item.qty}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {catLabel(item.category)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {box.items.length === 0 && (
                <div className="px-4 pb-4">
                  <p className="text-xs text-slate-400 text-center py-4">
                    الصندوق فارغ — اضغط &quot;تعبئة&quot; لإضافة عناصر من المخزن
                  </p>
                </div>
              )}
            </div>
          );
        })}

        {visit.boxes.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">لا توجد صناديق بعد — أضف صندوقاً للبدء</p>
          </div>
        )}
      </div>
    </div>
  );
}
