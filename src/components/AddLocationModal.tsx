"use client";

import { useState } from "react";
import { Site, Location, LOCATION_TYPE_LABELS } from "@/types";
import { X, MapPin } from "lucide-react";

interface AddLocationModalProps {
  sites: Site[];
  selectedSiteId: string | null;
  onClose: () => void;
  onAdd: (
    name: string,
    type: Location["type"],
    siteId: string,
    label?: string
  ) => void;
}

export default function AddLocationModal({
  sites,
  selectedSiteId,
  onClose,
  onAdd,
}: AddLocationModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<Location["type"]>("box");
  const [siteId, setSiteId] = useState(selectedSiteId ?? sites[0]?.id ?? "");
  const [label, setLabel] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !siteId) return;
    onAdd(name.trim(), type, siteId, label.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">إضافة مكان جديد</h2>
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
              اسم المكان *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: صندوق #6، مخزن اللجنة"
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              النوع *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(LOCATION_TYPE_LABELS) as [Location["type"], string][]).map(
                ([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setType(value)}
                    className={`px-3 h-11 rounded-lg text-xs font-medium border transition-colors ${
                      type === value
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {label}
                  </button>
                )
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              الموقع *
            </label>
            <select
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 bg-white"
            >
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              الوصف (اختياري)
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="وصف مختصر للمكان"
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={!name.trim() || !siteId}
              className="flex-1 h-11 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
