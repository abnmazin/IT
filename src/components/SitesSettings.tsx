"use client";

import { useState } from "react";
import { Site } from "@/types";
import { Plus, Edit2, Trash2, X, MapPin } from "lucide-react";

interface SitesSettingsProps {
  sites: Site[];
  onAdd: (name: string) => void;
  onEdit: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

export default function SitesSettings({
  sites,
  onAdd,
  onEdit,
  onDelete,
}: SitesSettingsProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [name, setName] = useState("");

  const openAdd = () => {
    setEditingSite(null);
    setName("");
    setShowModal(true);
  };

  const openEdit = (site: Site) => {
    setEditingSite(site);
    setName(site.name);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (editingSite) {
      onEdit(editingSite.id, name.trim());
    } else {
      onAdd(name.trim());
    }
    setShowModal(false);
  };

  const handleDelete = (site: Site) => {
    if (confirm(`هل أنت متأكد من حذف "${site.name}"؟`)) {
      onDelete(site.id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">
          المواقع ({sites.length})
        </h2>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 h-11 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          إضافة موقع
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sites.map((site) => (
          <div
            key={site.id}
            className="bg-white rounded-xl border border-slate-200 p-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-9 h-9 rounded-lg bg-sky-50 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-sky-500" />
              </div>
              <p className="text-sm font-medium text-slate-800 truncate">{site.name}</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => openEdit(site)}
                className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                title="تعديل"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(site)}
                className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                title="حذف"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
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
                {editingSite ? "تعديل الموقع" : "إضافة موقع جديد"}
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
                  اسم الموقع *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: HQ - الطابق 5"
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="flex-1 h-11 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {editingSite ? "حفظ التعديلات" : "إضافة"}
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
