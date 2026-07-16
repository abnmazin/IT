"use client";

import { useState, useMemo } from "react";
import { WarehouseItem, Category } from "@/types";
import { Search, Plus, Package, Tag, Edit3, Trash2, X, Minus } from "lucide-react";

interface WarehouseViewProps {
  items: WarehouseItem[];
  categories: Category[];
  searchQuery: string;
  onAddItem: (name: string, category: string, serialNumber: string, totalQty: number) => void;
  onEditItem: (id: string, name: string, category: string, serialNumber: string, totalQty: number) => void;
  onDeleteItem: (id: string) => void;
}

export default function WarehouseView({
  items,
  categories,
  searchQuery,
  onAddItem,
  onEditItem,
  onDeleteItem,
}: WarehouseViewProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingItem, setEditingItem] = useState<WarehouseItem | null>(null);
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formSerial, setFormSerial] = useState("");
  const [formQty, setFormQty] = useState(1);

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
    const map = new Map<string, WarehouseItem[]>();
    for (const item of filtered) {
      const list = map.get(item.category) || [];
      list.push(item);
      map.set(item.category, list);
    }
    return map;
  }, [filtered]);

  const resetForm = () => {
    setFormName("");
    setFormCategory(categories[0]?.key || "");
    setFormSerial("");
    setFormQty(1);
    setShowAdd(false);
    setEditingItem(null);
  };

  const openAdd = () => {
    resetForm();
    setFormCategory(categories[0]?.key || "");
    setShowAdd(true);
  };

  const openEdit = (item: WarehouseItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormSerial(item.serialNumber || "");
    setFormQty(item.totalQty);
    setShowAdd(true);
  };

  const handleSubmit = () => {
    if (!formName.trim()) return;
    if (editingItem) {
      onEditItem(editingItem.id, formName.trim(), formCategory, formSerial.trim(), formQty);
    } else {
      onAddItem(formName.trim(), formCategory, formSerial.trim(), formQty);
    }
    resetForm();
  };

  const catLabel = (key: string) => categories.find((c) => c.key === key)?.label || key;

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">المخزن الرئيسي</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            إدارة المواد والقطع — الإجمالي: {items.length} صنف
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-medium hover:bg-sky-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة صنف</span>
        </button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">
              {editingItem ? "تعديل الصنف" : "إضافة صنف جديد"}
            </h3>
            <button onClick={resetForm} className="p-1.5 rounded-lg hover:bg-slate-100">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="اسم الصنف"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <select
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {categories.map((c) => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="الرقم التسلسلي (اختياري)"
              value={formSerial}
              onChange={(e) => setFormSerial(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <input
              type="number"
              min={0}
              placeholder="الكمية"
              value={formQty}
              onChange={(e) => setFormQty(Number(e.target.value))}
              className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              className="px-4 py-2.5 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700"
            >
              {editingItem ? "حفظ التعديلات" : "إضافة"}
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {Array.from(grouped.entries()).map(([catKey, catItems]) => {
          const totalInCat = catItems.reduce((a, i) => a + i.totalQty, 0);
          return (
            <div key={catKey} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-semibold text-slate-900">{catLabel(catKey)}</span>
                </div>
                <span className="text-xs text-slate-500">{catItems.length} صنف · {totalInCat} قطعة</span>
              </div>
              <div className="divide-y divide-slate-100">
                {catItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        <Package className="w-4 h-4 text-slate-500" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-800 truncate">{item.name}</span>
                          {item.serialNumber && (
                            <span className="text-[11px] text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded font-mono flex items-center gap-1 shrink-0">
                              <Tag className="w-3 h-3" />
                              {item.serialNumber}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-sm font-bold px-2.5 py-1 rounded-lg ${
                        item.totalQty === 0
                          ? "bg-red-50 text-red-600"
                          : item.totalQty < 5
                          ? "bg-amber-50 text-amber-600"
                          : "bg-emerald-50 text-emerald-600"
                      }`}>
                        {item.totalQty}
                      </span>
                      <button
                        onClick={() => openEdit(item)}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-sky-600 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">لا توجد عناصر في المخزن.</p>
          </div>
        )}
      </div>
    </div>
  );
}
