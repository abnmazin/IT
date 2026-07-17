"use client";

import { useState, useMemo } from "react";
import { WarehouseItem, Category } from "@/types";
import { Search, Plus, Package, Tag, Edit3, Trash2, X, Minus } from "lucide-react";

interface WarehouseViewProps {
  items: WarehouseItem[];
  categories: Category[];
  onAddItem: (name: string, category: string, serialNumber: string, totalQty: number, consumable: boolean) => void;
  onEditItem: (id: string, name: string, category: string, serialNumber: string, totalQty: number, consumable: boolean) => void;
  onDeleteItem: (id: string) => void;
  onAddCategory: (key: string, label: string, serialTracked: boolean, consumable: boolean) => void;
}

export default function WarehouseView({
  items,
  categories,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onAddCategory,
}: WarehouseViewProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingItem, setEditingItem] = useState<WarehouseItem | null>(null);
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formSerial, setFormSerial] = useState("");
  const [formQty, setFormQty] = useState(1);
  const [formConsumable, setFormConsumable] = useState(false);
  const [catLabel2, setCatLabel2] = useState("");
  const [catSerialTracked, setCatSerialTracked] = useState(false);
  const [catConsumable, setCatConsumable] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("All");

  const filtered = useMemo(() => {
    let result = items;
    if (filterCategory !== "All") {
      result = result.filter((i) => i.category === filterCategory);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          (i.serialNumber && i.serialNumber.toLowerCase().includes(q))
      );
    }
    return result;
  }, [items, search, filterCategory]);

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
    setFormConsumable(false);
    setShowAdd(false);
    setEditingItem(null);
  };

  const openAdd = () => {
    resetForm();
    setFormCategory(filterCategory !== "All" ? filterCategory : categories[0]?.key || "");
    setShowAdd(true);
  };

  const openEdit = (item: WarehouseItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormSerial(item.serialNumber || "");
    setFormQty(item.totalQty);
    setFormConsumable(item.consumable);
    setShowAdd(true);
  };

  const handleSubmit = () => {
    if (!formName.trim()) return;
    if (editingItem) {
      onEditItem(editingItem.id, formName.trim(), formCategory, formSerial.trim(), formQty, formConsumable);
    } else {
      onAddItem(formName.trim(), formCategory, formSerial.trim(), formQty, formConsumable);
    }
    resetForm();
  };

  const handleAddCat = () => {
    if (!catLabel2.trim()) return;
    const key = catLabel2.trim().replace(/\s+/g, "_").toLowerCase();
    onAddCategory(key, catLabel2.trim(), catSerialTracked, catConsumable);
    setCatLabel2("");
    setCatSerialTracked(false);
    setCatConsumable(false);
    setShowAddCategory(false);
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
        <div className="flex gap-2">
          <button
            onClick={() => { setShowAddCategory(!showAddCategory); setShowAdd(false); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              showAddCategory ? "bg-violet-100 text-violet-700" : "bg-violet-50 text-violet-600 hover:bg-violet-100"
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>إضافة فئة</span>
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-medium hover:bg-sky-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة صنف</span>
          </button>
        </div>
      </div>

      {showAddCategory && (
        <div className="bg-white rounded-xl border border-violet-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">إضافة فئة جديدة</h3>
            <button onClick={() => setShowAddCategory(false)} className="p-2 rounded-lg hover:bg-slate-100 min-w-[36px] min-h-[36px] flex items-center justify-center">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="text"
              placeholder="اسم الفئة (مثال: كابلات، شاشات...)"
              value={catLabel2}
              onChange={(e) => setCatLabel2(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddCat()}
              className="flex-1 min-w-[200px] px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <label className="flex items-center gap-2 text-sm text-slate-600 shrink-0 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={catSerialTracked}
                onChange={(e) => setCatSerialTracked(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
              />
              يتطلب سيريال
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600 shrink-0 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={catConsumable}
                onChange={(e) => setCatConsumable(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
              />
              استهلاكي
            </label>
            <button
              onClick={handleAddCat}
              className="px-4 py-2.5 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors shrink-0"
            >
              إضافة
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="بحث بالاسم أو السيريال..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-3 pr-10 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300 bg-white"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-slate-100 min-w-[36px] min-h-[36px] flex items-center justify-center">
              <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
            </button>
          )}
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="py-2.5 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300 bg-white"
        >
          <option value="All">كل الفئات</option>
          {categories.map((c) => (
            <option key={c.key} value={c.key}>{c.label}</option>
          ))}
        </select>
      </div>

      {showAdd && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">
              {editingItem ? "تعديل الصنف" : "إضافة صنف جديد"}
            </h3>
            <button onClick={resetForm} className="p-2 rounded-lg hover:bg-slate-100 min-w-[36px] min-h-[36px] flex items-center justify-center">
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
              onChange={(e) => {
                setFormCategory(e.target.value);
                const cat = categories.find((c) => c.key === e.target.value);
                if (cat) setFormConsumable(cat.consumable);
              }}
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
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={formConsumable}
              onChange={(e) => setFormConsumable(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
            />
            صنف استهلاكي (لا يُرجع بعد الاستخدام)
          </label>
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

      {Array.from(grouped.entries()).map(([catKey, catItems]) => {
        const totalInCat = catItems.reduce((a, i) => a + i.totalQty, 0);
        return (
          <div key={catKey}>
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-semibold text-slate-900">{catLabel(catKey)}</span>
              <span className="text-xs text-slate-400">{catItems.length} صنف · {totalInCat} قطعة</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
              {catItems.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white rounded-xl border p-3 sm:p-4 flex flex-col items-center text-center gap-2 min-h-[140px] justify-between ${
                    item.totalQty === 0
                      ? "border-red-200 bg-red-50"
                      : item.totalQty < 5
                      ? "border-amber-200 bg-amber-50"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex flex-col items-center gap-1 min-w-0 w-full">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5 text-slate-500" />
                    </div>
                    <span className="text-sm font-bold text-slate-900 leading-tight truncate">{item.name}</span>
                    {item.consumable && (
                      <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">استهلاكي</span>
                    )}
                    {item.serialNumber && (
                      <span className="text-[10px] text-sky-600 font-mono truncate max-w-full">{item.serialNumber}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 w-full justify-center">
                    <span className={`text-lg font-bold ${
                      item.totalQty === 0 ? "text-red-600" : item.totalQty < 5 ? "text-amber-600" : "text-emerald-600"
                    }`}>
                      {item.totalQty}
                    </span>
                    <span className="text-[10px] text-slate-400">قطعة</span>
                  </div>
                  <div className="flex gap-1.5 w-full">
                    <button
                      onClick={() => openEdit(item)}
                      className="flex-1 py-2.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-sky-100 hover:text-sky-700 text-[11px] font-medium transition-colors min-h-[44px] flex items-center justify-center"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="py-2.5 px-3 rounded-lg bg-slate-100 text-slate-400 hover:bg-red-100 hover:text-red-500 transition-colors min-h-[44px] flex items-center justify-center"
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
        <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 text-center">
          <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-400">لا توجد عناصر في المخزن.</p>
        </div>
      )}
    </div>
  );
}
