"use client";

import { useState } from "react";
import { Visit, BoxItem, WarehouseItem, Category, VisitStatus } from "@/types";
import { ArrowRight, Plus, Package, Tag, Play, Square, CheckCircle, RotateCcw, Trash2, X } from "lucide-react";

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

const STATUS_CONFIG: Record<VisitStatus, { label: string; color: string; bg: string }> = {
  inactive: { label: "غير مفعلة", color: "text-slate-500", bg: "bg-slate-100" },
  active: { label: "مفعلة", color: "text-emerald-600", bg: "bg-emerald-50" },
  completed: { label: "مكتملة", color: "text-sky-600", bg: "bg-sky-50" },
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
  const [expandedBox, setExpandedBox] = useState<string | null>(null);
  const [showFill, setShowFill] = useState(false);
  const [showReturn, setShowReturn] = useState(false);
  const [fillItems, setFillItems] = useState<{ warehouseItemId: string; qty: number }[]>([]);
  const [returnItems, setReturnItems] = useState<{ warehouseItemId: string; qty: number }[]>([]);

  const cfg = STATUS_CONFIG[visit.status];
  const isActive = visit.status === "active";
  const expandedBoxData = visit.boxes.find((b) => b.id === expandedBox);

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
    setExpandedBox(boxId);
    setFillItems([]);
    setShowFill(true);
    setShowReturn(false);
  };

  const openReturn = (boxId: string) => {
    setExpandedBox(boxId);
    const box = visit.boxes.find((b) => b.id === boxId);
    if (box) {
      setReturnItems(box.items.map((i) => ({ warehouseItemId: i.warehouseItemId, qty: 0 })));
    }
    setShowReturn(true);
    setShowFill(false);
  };

  const handleFill = () => {
    if (!expandedBox) return;
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
      onFillBox(visit.id, expandedBox, items);
    }
    setShowFill(false);
  };

  const handleReturn = () => {
    if (!expandedBox) return;
    const returned = returnItems.filter((ri) => ri.qty > 0);
    if (returned.length > 0) {
      onReturnItems(visit.id, expandedBox, returned);
    }
    setShowReturn(false);
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

      {showFill && expandedBoxData && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">
              تعبئة {expandedBoxData.name} من المخزن
            </h3>
            <button onClick={() => { setShowFill(false); }} className="p-1.5 rounded-lg hover:bg-slate-100">
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
            <button onClick={() => { setShowFill(false); }} className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200">
              إلغاء
            </button>
          </div>
        </div>
      )}

      {showReturn && expandedBoxData && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">
              إرجاع مواد من {expandedBoxData.name} للمخزن
            </h3>
            <button onClick={() => { setShowReturn(false); }} className="p-1.5 rounded-lg hover:bg-slate-100">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {expandedBoxData.items.map((boxItem) => {
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
            <button onClick={() => { setShowReturn(false); }} className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200">
              إلغاء
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
        {visit.boxes.map((box) => {
          const boxTotal = box.items.reduce((a, i) => a + i.qty, 0);
          const isExpanded = expandedBox === box.id && !showFill && !showReturn;
          return (
            <div key={box.id}>
              <div
                onClick={() => setExpandedBox(isExpanded ? null : box.id)}
                className={`bg-slate-50 border rounded-xl p-2.5 sm:p-4 transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm cursor-pointer ${
                  isExpanded ? "border-sky-300 bg-sky-50" : "border-transparent"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-[10px] sm:text-xs font-medium text-slate-500 truncate">
                    {box.label || "صندوق"}
                  </span>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/60 flex items-center justify-center shrink-0">
                    <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" />
                  </div>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate mb-1">
                  {box.name}
                </p>
                <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-600">
                  <span>{boxTotal} قطعة</span>
                  <span>·</span>
                  <span>{box.items.length} صنف</span>
                </div>
                {isActive && (
                  <div className="mt-2 flex gap-1.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); openFill(box.id); }}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-sky-100 text-sky-600 rounded-lg text-[11px] font-medium hover:bg-sky-200 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      تعبئة
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); openReturn(box.id); }}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-emerald-100 text-emerald-600 rounded-lg text-[11px] font-medium hover:bg-emerald-200 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      إرجاع
                    </button>
                  </div>
                )}
              </div>

              {isExpanded && box.items.length > 0 && (
                <div className="mt-2 space-y-1">
                  {box.items.map((item) => (
                    <div
                      key={item.warehouseItemId}
                      className="flex items-center justify-between gap-2 py-1.5 px-2.5 rounded-lg bg-white border border-slate-100 text-[11px] sm:text-xs"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Package className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="text-slate-700 truncate">{item.name}</span>
                        {item.serialNumber && <Tag className="w-2.5 h-2.5 text-sky-500 shrink-0" />}
                      </div>
                      <span className="font-medium bg-slate-200 px-1.5 py-0.5 rounded shrink-0">
                        {item.qty}
                      </span>
                    </div>
                  ))}
                  {isActive && (
                    <button
                      onClick={() => onDeleteBox(visit.id, box.id)}
                      className="w-full flex items-center justify-center gap-1 py-1.5 text-[11px] text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      حذف الصندوق
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {visit.boxes.length === 0 && (
          <div className="col-span-full bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">لا توجد صناديق بعد — أضف صندوقاً للبدء</p>
          </div>
        )}
      </div>
    </div>
  );
}
