"use client";

import { useState } from "react";
import { Category, ItemCategory } from "@/types";
import { Plus, Edit2, Trash2, X, Tag, ToggleLeft, ToggleRight } from "lucide-react";

interface CategoriesSettingsProps {
  categories: Category[];
  onAdd: (key: string, label: string, serialTracked: boolean, consumable: boolean) => void;
  onEdit: (id: string, key: string, label: string, serialTracked: boolean, consumable: boolean) => void;
  onDelete: (id: string) => void;
}

export default function CategoriesSettings({
  categories,
  onAdd,
  onEdit,
  onDelete,
}: CategoriesSettingsProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [key, setKey] = useState("");
  const [label, setLabel] = useState("");
  const [serialTracked, setSerialTracked] = useState(false);
  const [consumable, setConsumable] = useState(false);

  const openAdd = () => {
    setEditingCat(null);
    setKey("");
    setLabel("");
    setSerialTracked(false);
    setConsumable(false);
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCat(cat);
    setKey(cat.key);
    setLabel(cat.label);
    setSerialTracked(cat.serialTracked);
    setConsumable(cat.consumable);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim() || !label.trim()) return;
    if (editingCat) {
      onEdit(editingCat.id, key.trim(), label.trim(), serialTracked, consumable);
    } else {
      onAdd(key.trim(), label.trim(), serialTracked, consumable);
    }
    setShowModal(false);
  };

  const handleDelete = (cat: Category) => {
    if (confirm(`هل أنت متأكد من حذف "${cat.label}"؟`)) {
      onDelete(cat.id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          الفئات ({categories.length})
        </h2>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 h-11 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          إضافة فئة
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="hidden sm:grid sm:grid-cols-[1fr_1fr_auto_auto_auto] gap-4 items-center px-5 py-3 border-b border-slate-100 bg-slate-50 text-xs font-medium text-slate-500 uppercase tracking-wider">
          <span>المفتاح (EN)</span>
          <span>الاسم (AR)</span>
          <span>تسلسلي</span>
          <span>استهلاكي</span>
          <span />
        </div>
        <div className="divide-y divide-slate-100">
          {categories.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              لا توجد فئات.
            </div>
          ) : (
            categories.map((cat) => (
              <div
                key={cat.id}
                className="flex flex-col sm:grid sm:grid-cols-[1fr_1fr_auto_auto_auto] gap-2 sm:gap-4 items-start sm:items-center px-5 py-3 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-mono text-slate-700">{cat.key}</span>
                </div>
                <span className="text-sm font-medium text-slate-800">{cat.label}</span>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    cat.serialTracked
                      ? "bg-sky-50 text-sky-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {cat.serialTracked ? "تسلسلي" : "كمي"}
                </span>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    cat.consumable
                      ? "bg-amber-50 text-amber-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {cat.consumable ? "استهلاكي" : "يعاد"}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(cat)}
                    className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    title="تعديل"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat)}
                    className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                {editingCat ? "تعديل الفئة" : "إضافة فئة جديدة"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  المفتاح (EN) *
                </label>
                <input
                  type="text"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="مثال: Laptop, Mouse..."
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 font-mono"
                  autoFocus
                />
                <p className="text-xs text-slate-400 mt-1">
                  اسم الفئة بالإنجليزية (يُستخدم كمعرف داخلي)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  الاسم (AR) *
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="مثال: لابتوب، ماوس..."
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400"
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-slate-700">يتطلب رقم تسلسلي</p>
                  <p className="text-xs text-slate-400">للأجهزة التي تتطلب تعقباً فردياً</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSerialTracked((v) => !v)}
                  className="text-slate-500"
                >
                  {serialTracked ? (
                    <ToggleRight className="w-12 h-12 text-sky-500" />
                  ) : (
                    <ToggleLeft className="w-12 h-12" />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-slate-700">صنف استهلاكي</p>
                  <p className="text-xs text-slate-400">المواد التي لا تُرجع بعد الاستخدام (كابلات، ملصقات)</p>
                </div>
                <button
                  type="button"
                  onClick={() => setConsumable((v) => !v)}
                  className="text-slate-500"
                >
                  {consumable ? (
                    <ToggleRight className="w-12 h-12 text-amber-500" />
                  ) : (
                    <ToggleLeft className="w-12 h-12" />
                  )}
                </button>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={!key.trim() || !label.trim()}
                  className="flex-1 h-11 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {editingCat ? "حفظ التعديلات" : "إضافة"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
