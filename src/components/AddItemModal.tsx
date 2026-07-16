"use client";

import { useState } from "react";
import { Category, ItemCategory } from "@/types";
import { X } from "lucide-react";

interface AddItemModalProps {
  locationId: string;
  categories: Category[];
  onClose: () => void;
  onAdd: (
    name: string,
    category: ItemCategory,
    locationId: string,
    serialNumber?: string,
    qty?: number
  ) => void;
}

export default function AddItemModal({
  locationId,
  categories,
  onClose,
  onAdd,
}: AddItemModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ItemCategory>(
    categories.length > 0 ? categories[0].key : "Laptop"
  );
  const [serialNumber, setSerialNumber] = useState("");
  const [qty, setQty] = useState(1);

  const currentCat = categories.find((c) => c.key === category);
  const tracked = currentCat?.serialTracked ?? false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(
      name.trim(),
      category,
      locationId,
      tracked && serialNumber.trim() ? serialNumber.trim() : undefined,
      tracked ? 1 : qty
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">إضافة صنف جديد</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              اسم الصنف
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: Dell Latitude 5540"
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              الفئة
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ItemCategory)}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 bg-white"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.key}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {tracked && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                الرقم التسلسلي
              </label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="مثال: IT-LAP-012"
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 font-mono"
              />
              <p className="text-xs text-slate-400 mt-1">
                هذا الجهاز يتطلب رقم تسلسلي للتعقب
              </p>
            </div>
          )}

          {!tracked && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                الكمية
              </label>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400"
              />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 h-11 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium transition-colors"
            >
              إضافة
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
